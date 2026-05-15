create table if not exists public.prompts (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  content text not null
);

alter table public.prompts enable row level security;

drop policy if exists "Allow public read access" on public.prompts;
create policy "Allow public read access"
on public.prompts
for select
using (true);

drop policy if exists "Allow public insert access" on public.prompts;
create policy "Allow public insert access"
on public.prompts
for insert
with check (true);

drop policy if exists "Allow public delete access" on public.prompts;
create policy "Allow public delete access"
on public.prompts
for delete
using (true);
