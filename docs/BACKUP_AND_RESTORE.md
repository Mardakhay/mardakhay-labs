# Backup and Restore Runbook

This runbook is designed for the Mardakhay Labs pet project on Supabase Free. Free projects do not include downloadable automatic database backups, so keep a small, manual backup outside this repository.

## 1. Quick prompt-content backup

Before a bigger change, and whenever you have added valuable prompts:

1. Sign in to the app and open **Prompts**.
2. Clear the search box and set every filter to **All** so that the whole library is visible.
3. Click **Export filtered** and save `mardakhay-prompts.json`.
4. Save a second copy somewhere separate (for example, an encrypted cloud drive or external disk). Do not commit private prompt content to Git.

The app's JSON export is a convenient content-level backup. Importing it restores prompt content and supported metadata, but it is **not** a full database backup: it does not preserve record IDs or timestamps, and the current importer does not restore favorite state.

## 2. Database schema and data backup (optional, stronger recovery)

Use this before schema changes or periodically if the database matters. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and Docker Desktop first; `supabase db dump` runs `pg_dump` in a container.

From the repository root:

```sh
supabase login
supabase link --project-ref vjjktfbkgtlvmcjvprgi

backup_dir="$HOME/backups/mardakhay-labs/$(date +%F)"
mkdir -p "$backup_dir"

supabase db dump --linked --file "$backup_dir/roles.sql" --role-only
supabase db dump --linked --file "$backup_dir/schema.sql"
supabase db dump --linked --file "$backup_dir/data.sql" --use-copy --data-only
```

The CLI may prompt for the database password. Enter it interactively; do not put it in this repository, commit it, or paste it into issue trackers.

These SQL files back up the application database objects/data that the CLI dump includes. Supabase-managed schemas (including Auth and Storage internals), Auth users, OAuth provider secrets, and dashboard settings are **not** fully captured by these files. Keep project configuration and recovery notes in a private, secure place, and use the official [Supabase backup and restore guide](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore) for a full recovery plan.

## 3. Restore safely

- For a prompt-content recovery, create/sign into the app and use its **Import** action with the JSON export.
- For a database recovery, create a separate target Supabase project first. Review and restore the SQL dumps there following the official guide linked above.
- Validate the restored schema, prompt counts, RLS policies, and sign-in flows before changing any production environment variables.
- Never run a restore over the only live project as an experiment. Keep at least one untouched backup copy until the recovery has been verified.

## 4. Simple routine

- **When prompts change materially:** export JSON and keep two copies.
- **Before every database migration:** create fresh SQL dumps.
- **After backing up:** check that the files exist and have non-zero size; periodically test importing a JSON backup or restoring SQL into a separate project.
- **Never put backups, database passwords, service-role keys, or OAuth client secrets in Git.**

## Official references

- [Supabase CLI database dump](https://supabase.com/docs/reference/cli/supabase-db-dump)
- [Supabase backup and restore](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
- [Supabase Free project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
