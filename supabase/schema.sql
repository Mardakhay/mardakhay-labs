create table if not exists public.prompts (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null default '',
  content text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  is_favorite boolean not null default false,
  ai_target text check (ai_target is null or ai_target in ('ChatGPT', 'Claude', 'Gemini', 'Grok')),
  category text check (category is null or category in ('Writing', 'Coding', 'Research', 'Image', 'Video', 'Marketing', 'Automation')),
  hashtags text[] not null default '{}'
);

alter table if exists public.prompts
  add column if not exists title text not null default '';

alter table if exists public.prompts
  add column if not exists ai_target text;

alter table if exists public.prompts
  add column if not exists category text;

alter table if exists public.prompts
  add column if not exists hashtags text[] not null default '{}';

update public.prompts
set title = left(split_part(content, E'\n', 1), 80)
where title = '';

update public.prompts
set hashtags = coalesce(
  array(
    select tag
    from (
      select distinct lower(substring(match[2] from 1 for 32)) as tag
      from regexp_matches(content, '(^|\s)#([A-Za-z][A-Za-z0-9_-]{0,31})(?![A-Za-z0-9_-])', 'g') as match
    ) extracted_tags
    order by tag
  ),
  '{}'
)
where hashtags = '{}';

-- Align existing tables with the constraints declared by the baseline schema.
alter table public.prompts
  alter column id set generated always,
  alter column title set not null,
  alter column content set not null,
  alter column user_id set not null,
  alter column is_favorite set not null;

do $
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.prompts'::regclass and conname = 'prompts_user_id_fkey'
  ) then
    alter table public.prompts add constraint prompts_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.prompts'::regclass and conname = 'prompts_ai_target_check'
  ) then
    alter table public.prompts add constraint prompts_ai_target_check
      check (ai_target is null or ai_target in ('ChatGPT', 'Claude', 'Gemini', 'Grok'));
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.prompts'::regclass and conname = 'prompts_category_check'
  ) then
    alter table public.prompts add constraint prompts_category_check
      check (category is null or category in ('Writing', 'Coding', 'Research', 'Image', 'Video', 'Marketing', 'Automation'));
  end if;
end;
$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists prompts_set_updated_at on public.prompts;
create trigger prompts_set_updated_at
  before update on public.prompts
  for each row
  execute function public.set_updated_at();

create index if not exists prompts_user_id_created_at_idx
  on public.prompts (user_id, created_at desc);

create index if not exists prompts_user_id_updated_at_idx
  on public.prompts (user_id, updated_at desc);

create index if not exists prompts_user_id_is_favorite_idx
  on public.prompts (user_id, is_favorite);

alter table public.prompts enable row level security;

drop policy if exists "Enable users to view their own data only" on public.prompts;
drop policy if exists "Users can view own prompts" on public.prompts;
drop policy if exists "Users can view their own prompts" on public.prompts;
drop policy if exists "Users can insert own prompts" on public.prompts;
drop policy if exists "Users can create their own prompts" on public.prompts;
drop policy if exists "Users can update own prompts" on public.prompts;
drop policy if exists "Users can update their own prompts" on public.prompts;
drop policy if exists "Enable delete for users based on user_id" on public.prompts;
drop policy if exists "Users can delete their own prompts" on public.prompts;

create policy "Users can view their own prompts"
on public.prompts
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own prompts"
on public.prompts
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own prompts"
on public.prompts
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own prompts"
on public.prompts
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- RLS policies filter rows; grants independently enforce least privilege.
revoke all privileges on table public.prompts from anon, authenticated;
grant select, insert, update, delete on table public.prompts to authenticated;
revoke all privileges on sequence public.prompts_id_seq from anon, authenticated;
grant usage on sequence public.prompts_id_seq to authenticated;
