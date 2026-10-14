-- Read-only catalog assertions for the prompts authorization contract.
-- Run in a local Supabase database after applying the schema and migrations.
DO $security_checks$
DECLARE
  v_policy_count integer;
  v_user_id_not_null boolean;
  v_title_not_null boolean;
  v_content_not_null boolean;
  v_favorite_not_null boolean;
  v_id_always boolean;
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.prompts'::regclass) THEN
    RAISE EXCEPTION 'RLS must be enabled on public.prompts';
  END IF;

  SELECT count(*) INTO v_policy_count
  FROM pg_policies WHERE schemaname = 'public' AND tablename = 'prompts';

  IF v_policy_count <> 4 THEN
    RAISE EXCEPTION 'Expected exactly four prompts RLS policies; found %', v_policy_count;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'prompts'
      AND (
        roles <> ARRAY['authenticated'::name]
        OR (cmd IN ('SELECT', 'UPDATE', 'DELETE')
            AND (qual IS NULL OR qual NOT ILIKE '%auth.uid%' OR qual NOT ILIKE '%user_id%'))
        OR (cmd IN ('INSERT', 'UPDATE')
            AND (with_check IS NULL OR with_check NOT ILIKE '%auth.uid%' OR with_check NOT ILIKE '%user_id%'))
      )
  ) THEN
    RAISE EXCEPTION 'Prompts policies must be authenticated-only and enforce auth.uid() ownership';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='prompts' AND cmd='SELECT')
     OR NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='prompts' AND cmd='INSERT')
     OR NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='prompts' AND cmd='UPDATE')
     OR NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='prompts' AND cmd='DELETE') THEN
    RAISE EXCEPTION 'Expected one policy for each CRUD operation';
  END IF;

  IF has_table_privilege('anon', 'public.prompts', 'SELECT')
     OR has_table_privilege('anon', 'public.prompts', 'INSERT')
     OR has_table_privilege('anon', 'public.prompts', 'UPDATE')
     OR has_table_privilege('anon', 'public.prompts', 'DELETE')
     OR has_table_privilege('anon', 'public.prompts', 'TRUNCATE')
     OR has_table_privilege('anon', 'public.prompts', 'TRIGGER') THEN
    RAISE EXCEPTION 'anon must have no table privileges on public.prompts';
  END IF;

  IF NOT has_table_privilege('authenticated', 'public.prompts', 'SELECT')
     OR NOT has_table_privilege('authenticated', 'public.prompts', 'INSERT')
     OR NOT has_table_privilege('authenticated', 'public.prompts', 'UPDATE')
     OR NOT has_table_privilege('authenticated', 'public.prompts', 'DELETE') THEN
    RAISE EXCEPTION 'authenticated must retain CRUD privileges';
  END IF;

  IF has_table_privilege('authenticated', 'public.prompts', 'TRUNCATE')
     OR has_table_privilege('authenticated', 'public.prompts', 'TRIGGER')
     OR has_table_privilege('authenticated', 'public.prompts', 'REFERENCES')
     OR has_table_privilege('authenticated', 'public.prompts', 'MAINTAIN') THEN
    RAISE EXCEPTION 'authenticated has privileges beyond CRUD on public.prompts';
  END IF;

  IF has_sequence_privilege('anon', 'public.prompts_id_seq', 'USAGE')
     OR NOT has_sequence_privilege('authenticated', 'public.prompts_id_seq', 'USAGE')
     OR has_sequence_privilege('authenticated', 'public.prompts_id_seq', 'UPDATE')
     OR has_sequence_privilege('authenticated', 'public.prompts_id_seq', 'SELECT') THEN
    RAISE EXCEPTION 'Identity sequence privileges do not follow least privilege';
  END IF;

  SELECT attnotnull INTO v_user_id_not_null FROM pg_attribute WHERE attrelid='public.prompts'::regclass AND attname='user_id' AND NOT attisdropped;
  SELECT attnotnull INTO v_title_not_null FROM pg_attribute WHERE attrelid='public.prompts'::regclass AND attname='title' AND NOT attisdropped;
  SELECT attnotnull INTO v_content_not_null FROM pg_attribute WHERE attrelid='public.prompts'::regclass AND attname='content' AND NOT attisdropped;
  SELECT attnotnull INTO v_favorite_not_null FROM pg_attribute WHERE attrelid='public.prompts'::regclass AND attname='is_favorite' AND NOT attisdropped;
  SELECT attidentity = 'a' INTO v_id_always FROM pg_attribute WHERE attrelid='public.prompts'::regclass AND attname='id' AND NOT attisdropped;

  IF NOT coalesce(v_user_id_not_null, false)
     OR NOT coalesce(v_title_not_null, false)
     OR NOT coalesce(v_content_not_null, false)
     OR NOT coalesce(v_favorite_not_null, false)
     OR NOT coalesce(v_id_always, false) THEN
    RAISE EXCEPTION 'Required prompt column constraints are missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.prompts'::regclass AND conname='prompts_user_id_fkey'
      AND contype='f' AND pg_get_constraintdef(oid) ILIKE '%ON DELETE CASCADE%'
  ) THEN
    RAISE EXCEPTION 'Missing owner foreign key with ON DELETE CASCADE';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.prompts'::regclass AND conname='prompts_ai_target_check' AND contype='c')
     OR NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.prompts'::regclass AND conname='prompts_category_check' AND contype='c') THEN
    RAISE EXCEPTION 'Server-side metadata check constraints are missing';
  END IF;
END;
$security_checks$;
