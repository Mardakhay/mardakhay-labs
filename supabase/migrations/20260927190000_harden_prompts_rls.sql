-- Harden prompt RLS policies and trigger security.
--
-- Removes legacy duplicate policies that were left on the production table,
-- uses a stable search_path for the trigger function, and evaluates auth.uid()
-- once per statement instead of once per row.

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
