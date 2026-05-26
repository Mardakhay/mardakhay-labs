create table if not exists public.prompts (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  title text not null default '',
  content text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  is_favorite boolean not null default false
);

alter table if exists public.prompts
  add column if not exists title text not null default '';

update public.prompts
set title = left(split_part(content, E'\n', 1), 80)
where title = '';

create index if not exists prompts_user_id_created_at_idx
  on public.prompts (user_id, created_at desc);

create index if not exists prompts_user_id_is_favorite_idx
  on public.prompts (user_id, is_favorite);

alter table public.prompts enable row level security;

drop policy if exists "Users can view their own prompts" on public.prompts;
create policy "Users can view their own prompts"
on public.prompts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own prompts" on public.prompts;
create policy "Users can create their own prompts"
on public.prompts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own prompts" on public.prompts;
create policy "Users can update their own prompts"
on public.prompts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own prompts" on public.prompts;
create policy "Users can delete their own prompts"
on public.prompts
for delete
to authenticated
using (auth.uid() = user_id);
