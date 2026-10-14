# Security Model and Configuration

## Security boundaries

The application treats the browser as an untrusted client.

1. **Supabase Auth** establishes a session and supplies the authenticated identity.
2. **API functions** require a current user and include the current user's ID in writes and owner-scoped queries.
3. **PostgreSQL RLS** is the decisive row-level authorization boundary. Each SELECT/INSERT/UPDATE/DELETE policy restricts access to rows where the owner matches auth.uid().
4. **Database privileges** are separate from RLS: anon has no privileges on public.prompts; authenticated has CRUD only. The ID sequence grants only USAGE.
5. **Constraints and triggers** enforce allowed metadata, required fields, owner referential integrity, and updated_at maintenance independently of client validation.

Client-side filtering and owner-scoped query predicates are defense in depth and query efficiency; neither replaces RLS.

## Secrets and environment variables

The frontend requires:
- **VITE_SUPABASE_URL**
- **VITE_SUPABASE_PUBLISHABLE_KEY** (preferred) or legacy **VITE_SUPABASE_ANON_KEY**

Vite variables are bundled into browser-accessible assets. The Supabase publishable/anon key is designed for client use only when policies protect the data. Never place the following in a VITE_* variable or the repository:
- Supabase service-role/secret keys
- PostgreSQL/database passwords
- OAuth client secrets
- private backup files or exported prompts

Use Vercel environment configuration for the public application variables and protected repository secrets for workflow credentials. Limit production secrets to workflows that need them.

## Authentication

Email/password and Google OAuth are separate providers. Enabling Google should not replace or disable Email/password unless that is an explicit product decision.

Verify these settings in the Supabase dashboard:
- Email provider enabled, with email confirmation behavior understood.
- Google provider configured with the correct client credentials if used.
- Production HTTPS origin set as Site URL and exact origins/callbacks allow-listed.
- Existing users have confirmed their email when confirmation is required.
- Identity linking is based on Supabase's trusted/verified provider behavior; never merge accounts using an unverified email or write directly to auth.users.

Password minimum length, password strength, and leaked-password protection are Auth configuration settings rather than frontend-enforced policy. Review the actual configuration in Authentication settings before considering the project security configuration fully audited. In the last project audit, leaked-password protection was reported as unavailable on the current Supabase plan (documented as Pro+); that limitation does not mean password sign-in is broken, but it does leave a security hardening option unavailable without a plan change. The active password minimum/strength values were not independently verified through the available configuration interface, so this document does not claim particular values.

## Cache and browser persistence

- Prompt query keys include user ID. Session loss/user changes remove user-scoped prompt queries.
- Auth restoration ignores stale promises after a newer auth event.
- Activity history and draft keys are scoped by user/prompt. Local persistence is not an authoritative server record; sign-out should not be treated as a secure-wipe operation for browser profiles shared between people.
- Prompt JSON/Markdown exports may contain private user content. Treat them as sensitive data and store backups outside Git.
- The PWA cache contains the application shell and compiled static assets, not authenticated prompt API responses. Third-party requests are not cached by the service worker.

## Database change safety

Before changing policies, grants, constraints, or timestamp types:
1. Create a backup in a location outside the repository.
2. Inspect the current schema and migration ledger.
3. Make the migration narrow and review how existing rows are interpreted.
4. Apply to a development/staging database first when feasible.
5. Validate grants, policies, constraints, counts, and nulls after execution.
6. Commit the migration SQL and update the baseline schema/documentation.

The production created_at conversion interpreted prior timestamp-without-time-zone values as UTC after confirming the database timezone was UTC and inserts relied on DEFAULT now(). The migration kept existing rows and restored the default. This assumption should not be copied into another database without confirming its timezone/data semantics.

## Security checks

Run the application checks with:

    npm test
    npm run lint
    npm run build

Run **supabase/tests/prompts_security.test.sql** against a local database prepared with the current schema. It asserts the RLS/policy/grant/constraint contract through PostgreSQL catalog inspection.

The unit/SQL tests cannot verify Supabase dashboard provider flags, password rules, OAuth secret validity, production environment-variable values, or third-party account configuration. Those remain dashboard/operational responsibilities.
