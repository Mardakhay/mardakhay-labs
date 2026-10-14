# Development Guide

## Requirements

- Node.js 24.x, aligned with Vercel production and GitHub Actions CI.
- npm (use the committed lockfile).
- A Supabase development project for real authentication/database integration.
- Git.

## Local setup

    git clone https://github.com/Mardakhay/mardakhay-labs.git
    cd mardakhay-labs
    npm ci

Create **.env** in the repository root:

    VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
    VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY

Use the publishable key for browser code. The client has backward compatibility with **VITE_SUPABASE_ANON_KEY**, but do not set either variable to a service-role or other privileged key. Restart the development server after changing environment variables.

    npm run dev

## Quality gates

Run the same checks as CI before pushing:

    npm test
    npm run lint
    npm run build

**npm run build** runs TypeScript project builds and Vite production bundling. **npm run check** runs build and lint; it does not replace **npm test**. Use **npm run test:watch** while developing a test.

Tests live under **src/lib/__tests__/** and cover pure helpers and critical flows such as auth-session race handling, cache transforms, import/export, validation, focus trapping, storage-key scoping, metadata, and service-worker behavior.

## Working conventions

- Keep UI in components/pages; isolate remote operations in API modules and remote-state logic in hooks.
- Keep pure transformations in **src/lib/** and cover behavior with unit tests.
- Query keys for user-owned data must include the user identity.
- Any auth transition or sign-out path must not leave previous-user prompt data visible.
- Use optimistic updates only when rollback can preserve concurrent updates; invalidate the canonical query after a mutation settles.
- Preserve the RLS/least-privilege contract when changing any SQL or API logic.
- Add a migration for an incremental database change and keep **supabase/schema.sql** aligned with the resulting current schema.
- Never commit .env, exports, database dumps, OAuth secrets, database passwords, or service-role keys.

## Database setup and migrations

The repository has two related artifacts:
- **supabase/schema.sql**: the complete current baseline for a clean database.
- **supabase/migrations/**: sequential historical/incremental migrations intended for databases that track those versions.

Do not apply the current baseline and then blindly replay every historical migration. Historical migrations may add columns/constraints that already exist in the baseline or require an earlier table. That can fail or distort the migration ledger.

For an existing linked project:
1. Inspect local and remote migration history.
2. Back up the database before a production migration (see [Backup and Restore](BACKUP_AND_RESTORE.md)).
3. Apply only genuinely pending migrations, in timestamp order, and inspect their SQL before execution.
4. Verify the catalog/constraints, row counts, and RLS after the change.
5. Keep the corresponding migration file in Git.

For a fresh project:
1. Create the database from **schema.sql** as the chosen current baseline.
2. Reconcile the Supabase migration history to reflect the schema baseline before using incremental CLI pushes; do not claim that historical SQL was executed against the baseline if it was only marked as represented.
3. Run the SQL catalog checks in **supabase/tests/prompts_security.test.sql** against a database with the expected schema.
4. Verify Email and optional Google sign-in, RLS ownership, CRUD, and cascade deletion with test accounts.

When unsure whether a remote migration has already run, inspect migration history first instead of retrying SQL blindly. Some migrations are intentionally not idempotent.

## Useful scripts

| Command | Description |
| --- | --- |
| **npm run dev** | Development server |
| **npm test** | Run unit tests once |
| **npm run test:watch** | Test watcher |
| **npm run lint** | ESLint |
| **npm run build** | TypeScript build + Vite bundle |
| **npm run preview** | Preview production output locally |
| **npm run check** | Build and lint |

## Manual release smoke test

- Sign in and sign out; verify session restoration after reload.
- Test Email/password; test Google only if its provider and redirect URLs are configured.
- Create, edit, favorite, unfavorite, and delete a prompt.
- Test search/filters and bulk actions.
- Import a small JSON fixture, reject a file above the 5 MiB limit, and reject more than 500 prompts.
- Verify local activity/draft data remains scoped to the correct account.
- Open /prompts, /favorites, /settings, and /login directly in a fresh tab and reload each route.
- For PWA QA, load the deployment online first so the service worker installs, wait for it to activate, then test offline reload. Do not expect remote Supabase requests or Google Fonts to work offline.
- Check a narrow mobile viewport and iOS Safari when responsive styles change.
- Confirm the production schema migration history and backup state before a database release.

## Workflow automation

- **.github/workflows/ci.yml** runs tests, lint, and build on main pushes and pull requests.
- **.github/workflows/dependency-audit.yml** runs an npm audit report on dependency changes, weekly, or manually; it uploads the full report artifact.
- **.github/workflows/supabase-keepalive.yml** pings the configured REST endpoint on a schedule. It needs **SUPABASE_URL**, **SUPABASE_ANON_KEY**, and **SUPABASE_TABLE** repository secrets. It is an availability workaround for the free-tier project, not a backup or health monitoring system.
