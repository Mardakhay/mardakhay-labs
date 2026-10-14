# Deployment and Operations

## Hosting model

- Vercel builds the Vite app and serves the static output from **dist/**.
- The production domain is https://www.mardakhay-labs.xyz/.
- Supabase supplies Auth and PostgreSQL.
- **vercel.json** rewrites SPA paths to /index.html, allowing React Router to handle a direct visit or reload of a client route.

## Vercel configuration

The project uses the Vite framework and Node 24.x. Configure the following for Production, Preview, and Development as appropriate:

- **VITE_SUPABASE_URL**
- **VITE_SUPABASE_PUBLISHABLE_KEY**

The code accepts the legacy **VITE_SUPABASE_ANON_KEY** fallback, but prefer the publishable-key variable. These values are browser-visible; do not enter a service-role key.

Deploy through the connected GitHub main branch. Verify the build logs show TypeScript/Vite build completion and review emitted asset sizes. The GitHub CI workflow separately runs tests, lint, and build; a successful Vercel deployment does not replace tests.

## Supabase configuration

- Keep production and non-production projects separate where feasible.
- Enable Email/password as required by the product.
- Configure Google OAuth and valid redirect allow-lists if using that provider.
- Verify password minimum/strength and leaked-password protection directly in Authentication settings.
- Preserve remote migration history. See [Development](DEVELOPMENT.md) before applying migrations.
- Back up the database before schema changes and confirm that production schema matches **supabase/schema.sql** plus its applied migration history.

## Release procedure

1. Review the diff and confirm no .env, exported prompt data, database dump, or secrets are staged.
2. Run npm ci, npm test, npm run lint, and npm run build, or confirm the corresponding CI run passes.
3. For database changes, inspect the migration, back up the database, verify which migrations are pending, and validate the resulting schema after deployment.
4. Push the release to main and wait for GitHub Actions and Vercel to finish.
5. Open the production homepage and sign in with a test account.
6. Smoke-test /prompts, /favorites, /settings, and /login by direct navigation and browser reload.
7. Verify create/edit/favorite/delete and relevant search/filter/import/export flows.
8. After a service-worker update, allow the new worker to install/activate before testing reload or offline behavior.
9. Inspect browser console/network errors and confirm the live root references the expected current build assets and /sw.js returns the intended cache version.

## PWA behavior and troubleshooting

The worker installs only after it can cache the app shell, Vite manifest, and all local build assets. This is intentionally strict: a partially cached new release must not activate. After successful precache it skips waiting; activation deletes old app-prefixed caches and claims open clients.

Navigation is network-first with cached /index.html fallback. Static app shell/build assets use network-first fetch with cache fallback. Supabase and other cross-origin fetches are not intercepted. A successful offline UI reload does not mean prompt data can be created/updated offline.

If a user sees a blank page immediately after deployment:
- Confirm / and /sw.js are reachable and the root HTML's JS/CSS hashes correspond to the deployed asset manifest.
- Check whether the service worker is running an old cache or failed to precache a required chunk.
- Inspect Console/Network while online first. Do not merely delete the worker/cache before preserving enough evidence to diagnose a cache-version mismatch.
- After fixing assets, bump the cache name and keep the unit tests in sync with the worker cache constant.

Google Fonts are loaded from external origins. Missing fonts while offline are expected; a failed font request should not break the app shell.

## Rollback

- **Frontend:** use Vercel's deployment history to promote/rollback to the last known-good deployment. Then verify SPA routes and PWA worker/cache behavior.
- **Database:** never assume a frontend rollback reverts a database migration. Use a reviewed reverse migration or restore process after assessing whether new data can be preserved. Restore into a separate project first when possible.
- **Auth configuration:** record the previous provider/redirect settings before changing them; revert only the changed settings rather than recreating users or editing Supabase Auth tables.

See [Backup and Restore](BACKUP_AND_RESTORE.md) for manual prompt/database backups and recovery constraints.
