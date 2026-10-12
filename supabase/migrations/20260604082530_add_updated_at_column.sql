/*
  # Add updated_at timestamp to prompts table

  1. New Columns
    - `updated_at` (timestamptz) on `prompts` table
      - Automatically set to current timestamp on creation
      - Updated via trigger on every row update

  2. New Objects
    - `set_updated_at()` trigger function
      - Sets `updated_at = now()` before each update
    - `prompts_set_updated_at` trigger
      - Fires on UPDATE for each row

  3. New Index
    - `prompts_user_id_updated_at_idx` on (user_id, updated_at desc)
      - Supports sorted queries by update time

  4. Security
    - No RLS changes required
    - Column is auto-managed, not user-writable

  5. Important Notes
    1. Column added with `IF NOT EXISTS` guard
    2. Existing rows get `updated_at` set to their `created_at` value
    3. The trigger ensures `updated_at` is always current on updates
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prompts' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.prompts ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

UPDATE public.prompts SET updated_at = created_at WHERE updated_at = created_at AND updated_at IS NOT NULL;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prompts_set_updated_at ON public.prompts;
CREATE TRIGGER prompts_set_updated_at
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS prompts_user_id_updated_at_idx
  ON public.prompts (user_id, updated_at desc);
