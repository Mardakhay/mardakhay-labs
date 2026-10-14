-- Least-privilege table and sequence grants alongside row-level security.
REVOKE ALL PRIVILEGES ON TABLE public.prompts FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.prompts FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.prompts TO authenticated;

REVOKE ALL PRIVILEGES ON SEQUENCE public.prompts_id_seq FROM anon;
REVOKE ALL PRIVILEGES ON SEQUENCE public.prompts_id_seq FROM authenticated;
GRANT USAGE ON SEQUENCE public.prompts_id_seq TO authenticated;

-- Restore the integrity constraints declared in supabase/schema.sql.
ALTER TABLE public.prompts
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN content SET NOT NULL,
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN is_favorite SET NOT NULL,
  ALTER COLUMN id SET GENERATED ALWAYS;

ALTER TABLE public.prompts
  ADD CONSTRAINT prompts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
