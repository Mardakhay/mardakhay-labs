# Mardakhay Labs

**A calm, personal workspace for creating, organizing, and reusing AI prompts.**

Production: [www.mardakhay-labs.xyz](https://www.mardakhay-labs.xyz/) · Source: [GitHub](https://github.com/Mardakhay/mardakhay-labs)

Mardakhay Labs is a responsive, installable single-page application for maintaining a user-owned prompt library. It combines prompt editing and discovery workflows with Supabase authentication, PostgreSQL row-level security, optimistic UI updates, import/export, and offline app-shell support.

## What it does

- **Create and edit prompts:** derive a title when needed, preserve prompt text, and attach supported AI-target/category metadata and hashtags.
- **Find and organize:** search the library, filter by target/category/favorites, and navigate Dashboard, Prompts, Favorites, and Settings.
- **Work in batches:** select prompts and apply supported bulk actions, including favorites, deletion, and category updates.
- **Move data in and out:** import/export JSON and export prompt content as Markdown. JSON import is limited to 500 prompts and 5 MiB per file.
- **Recover drafts:** preserve editing drafts without mixing drafts between prompts or users.
- **Stay responsive:** layouts are checked on desktop and on a real iPhone 17 Pro Max in Safari.
- **Install as a PWA:** the service worker precaches the app shell and all compiled route chunks. After a successful install/update, the interface can load after an offline reload; remote APIs and external fonts still require connectivity.

## Technology

| Area | Tools |
| --- | --- |
| UI | React 19, TypeScript 6, Tailwind CSS 4 |
| Build | Vite 8 |
| Routing | React Router 7 |
| Server state | TanStack Query 5 |
| Small client state | Zustand 5 |
| Backend | Supabase Auth, PostgreSQL, Row Level Security |
| Verification | Vitest, ESLint, TypeScript build, GitHub Actions |
| Hosting | Vercel |

## Run locally

### Requirements

- Node.js 24.x (CI and the production hosting environment use Node 24)
- npm
- A Supabase project with the application schema and Auth providers configured

Install and start the app:

    git clone https://github.com/Mardakhay/mardakhay-labs.git
    cd mardakhay-labs
    npm ci
    npm run dev

Create a local **.env** file in the repository root:

    VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
    VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY

The application also accepts the legacy `VITE_SUPABASE_ANON_KEY` variable as a fallback. Prefer the publishable key for new configuration. These browser-side values are not database secrets; never put a service-role key or database password in a Vite environment variable.

Vite prints the local address, normally http://localhost:5173.

## Supabase setup

1. Create a Supabase project and configure Authentication → Sign In / Providers.
2. Enable the Email provider. Configure Google OAuth separately if that sign-in option should be available.
3. Set the production Site URL and allow-list the exact local/production redirect URLs under Authentication → URL Configuration.
4. Set the two public environment variables above in the local environment and in the hosting project's environment configuration.
5. For a fresh database, use **supabase/schema.sql** as the current baseline and reconcile the migration history before using the migration workflow. For an existing database, preserve its migration history and apply only migrations that are not yet recorded as applied. Do not blindly execute the historical migration files over the current baseline; several historical migrations intentionally transition older schemas and are not a second initialization script.
6. Confirm sign-up/email confirmation, password sign-in, sign-out, and Google OAuth (if enabled) in a non-production account before changing provider settings in production.

The schema and database lifecycle are described in [Architecture](docs/ARCHITECTURE.md), [Security](docs/SECURITY.md), and [Deployment](docs/DEPLOYMENT.md).

## Quality checks

Run all checks before merging or deploying:

    npm ci
    npm test
    npm run lint
    npm run build

Useful scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Vite development server |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run lint` | Run ESLint |
| `npm run build` | Type-check and create the production build |
| `npm run preview` | Serve the production build locally |
| `npm run check` | Run the build and lint checks |

GitHub Actions runs tests, lint, and production build on pushes to main and pull requests. A separate scheduled workflow reports dependency audit findings.

## Architecture at a glance

- Pages and components render the workspace and interaction flows.
- TanStack Query owns remote prompt data and its cache; query keys include the authenticated user ID.
- Zustand stores only lightweight cross-page client state (current auth user/loading state and notifications).
- API modules call Supabase and also scope mutations to the current user; PostgreSQL RLS and table grants remain the real authorization boundary.
- SQL schema, migrations, and catalog assertions live under **supabase/**.
- Vite emits an asset manifest that the service worker uses to precache all built JavaScript/CSS, including lazy route chunks.
- Vercel rewrites SPA route requests to the app entry point so a direct open/reload of a client route does not return a platform 404.

See [Architecture](docs/ARCHITECTURE.md) for runtime/data flows and source map.

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — modules, routing, auth/session lifecycle, query/cache behavior, data model, and PWA mechanics.
- [Development](docs/DEVELOPMENT.md) — local setup, checks, database workflow, and maintenance practices.
- [Security](docs/SECURITY.md) — authorization model, secrets, provider configuration, and known configuration limitations.
- [Deployment and operations](docs/DEPLOYMENT.md) — Vercel/Supabase release steps, smoke tests, and rollback guidance.
- [Performance baseline](docs/PERFORMANCE.md) — production bundle measurements and the distinction between build size and Lighthouse/Core Web Vitals.
- [Backup and restore](docs/BACKUP_AND_RESTORE.md) — prompt exports, database dumps, and safe recovery.

## Production and known boundaries

The current production app has passed the repository CI checks, direct-route smoke checks, PWA Offline + Reload confirmation, and a user-confirmed mobile layout check on iPhone 17 Pro Max/Safari. Production prompt creation timestamps were normalized to PostgreSQL **timestamptz**, with existing values interpreted as UTC.

The production build baseline is documented in [Performance](docs/PERFORMANCE.md). A Lighthouse run and field Core Web Vitals data were not available in the automated environment used for this handoff; no Lighthouse score is claimed.

- Offline mode covers the cached interface and build assets, not creating/updating prompts without network access.
- Google Fonts are fetched from third-party origins and are unavailable when offline unless the browser already has them cached.
- Supabase Auth password policy and leaked-password protection are dashboard/plan settings, not fully defined by the frontend. See [Security](docs/SECURITY.md).
