-- The database timezone is UTC and prompt inserts rely on DEFAULT now().
-- Preserve existing timestamp wall-clock values as UTC instants while normalizing
-- created_at to match the canonical schema and updated_at column type.
ALTER TABLE public.prompts
  ALTER COLUMN created_at DROP DEFAULT;

ALTER TABLE public.prompts
  ALTER COLUMN created_at TYPE timestamptz
  USING created_at AT TIME ZONE 'UTC';

ALTER TABLE public.prompts
  ALTER COLUMN created_at SET DEFAULT now();
