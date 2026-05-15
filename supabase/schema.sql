create table if not exists public.prompts (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  content text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  is_favorite boolean not null default false
);

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
