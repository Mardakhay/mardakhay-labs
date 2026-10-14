# Architecture

This document describes the shipped system and the responsibilities of its main modules.

## System context

Mardakhay Labs is a browser-based React SPA backed by Supabase. Vercel serves the compiled frontend; Supabase Auth manages identity, and PostgreSQL stores prompts. The browser uses a public Supabase publishable/anon key. PostgreSQL grants and row-level security (RLS), not client-side filtering, enforce data access.

    Browser
      ├── React SPA / React Router
      ├── TanStack Query ── Supabase Data API ── PostgreSQL
      ├── Zustand client state
      └── Service Worker ── same-origin app shell/assets
    Vercel
      ├── serves dist/
      └── rewrites SPA routes to /index.html

## Frontend entry and routing

- **src/main.tsx** creates the React root, BrowserRouter, and QueryClient provider, then registers the service worker.
- **src/App.tsx** subscribes to Supabase session changes, applies auth state, clears user-scoped prompt queries when the user changes or signs out, and declares routes.
- Route components are lazy-loaded with React lazy() and Suspense. The user-facing routes are / (Dashboard), /prompts, /favorites, /settings, and /login.
- **src/components/AppLayout.tsx** provides the shared signed-in workspace layout; **ProtectedRoute** prevents unauthenticated access to protected pages.
- **vercel.json** rewrites incoming paths to /index.html. React Router then resolves the route in the browser.

Unknown client routes are redirected to the Dashboard when signed in or Login when signed out.

## Source responsibility map

| Path | Responsibility |
| --- | --- |
| `src/pages/` | Route-level UI and page workflows |
| `src/components/` | Shared layout, prompt cards/detail/editor, confirmation dialogs, dropdowns, notifications, command palette |
| `src/api/auth.ts` | Email/password sign-in, sign-up, confirmation resend, Google OAuth, sign-out |
| `src/api/prompts.ts` | Supabase reads/writes, input normalization, row mapping, import limit enforcement |
| `src/hooks/usePromptsQuery.ts` | User-keyed query and prompt retrieval |
| `src/hooks/usePromptMutations.ts` | CRUD/bulk mutations, optimistic cache changes, rollback, invalidation, activity/notifications |
| `src/stores/authStore.ts` | Authenticated user and initial session loading state |
| `src/stores/notificationStore.ts` | Lightweight cross-page notification state |
| `src/lib/authSession.ts` | Race-safe initial session restoration and auth subscription lifecycle |
| `src/lib/promptCache.ts` | Pure cache transforms and guarded rollback helpers |
| `src/lib/promptMetadata.ts` | Parse/normalize prompt metadata and hashtags |
| `src/lib/promptImportLimits.ts` | Import file size and prompt-count limits |
| `src/lib/activityLog.ts` | User-scoped local activity history |
| `src/lib/focusTrap.ts` | Modal keyboard focus management |
| `src/lib/supabase.ts` | Supabase client and environment validation |
| `supabase/schema.sql` | Current target schema baseline |
| `supabase/migrations/` | Incremental schema changes for databases with migration history |
| `supabase/tests/prompts_security.test.sql` | SQL catalog assertions for the authorization contract |

## State and data flow

### Server state

TanStack Query owns prompt data because the source of truth is Supabase. Prompt query keys include the authenticated user ID. When a session is lost or the user changes, the base prompt queries are removed to prevent a previous user's cached prompts from appearing in the next session.

`usePromptMutations` coordinates writes:
1. Capture the relevant cache state and cancel an overlapping query where necessary.
2. Apply an optimistic update for supported single-item mutations.
3. Send the scoped request to Supabase.
4. On success, reconcile the cache and add local activity/notification feedback.
5. On failure, roll back only if doing so will not overwrite a newer concurrent cache change.
6. Invalidate the user's prompt query to reconcile with database truth.

Bulk operations are implemented as Supabase mutations and followed by cache reconciliation. They are not a distributed transaction across separate API requests.

### Client state

Zustand is intentionally small:
- auth store: user and first-session loading state;
- notification store: visible message and notification variant.

Prompt lists are not duplicated in Zustand. Component-local UI state stays in React. Activity history and edit drafts use local browser persistence with keys scoped to the authenticated user; they are local conveniences, not a server-side audit trail or a backup.

### Authentication lifecycle

`startAuthSessionLifecycle` subscribes to auth changes and restores the existing session. A version counter prevents a slower initial getSession() response from overriding a newer auth event. Cleanup unsubscribes and ignores late async results. **src/App.tsx** removes prompt cache entries when the next user is null or differs from the previous user ID.

Email/password and Google OAuth use Supabase-managed identities. Provider credentials, redirect allow-lists, and email confirmation are configured in the Supabase dashboard.

## Prompt data model

Table: **public.prompts**

| Column | Meaning |
| --- | --- |
| `id` | Identity primary key, generated always |
| `created_at` | Creation instant, `timestamptz`, default `now()` |
| `updated_at` | Last update instant, `timestamptz`, default `now()` and maintained by trigger |
| `title` | Required title; an empty input is replaced by a derived title |
| `content` | Required prompt body |
| `user_id` | Required owner, references `auth.users(id)` with `ON DELETE CASCADE` |
| `is_favorite` | Required favorite state |
| `ai_target` | Optional allow-listed target: ChatGPT, Claude, Gemini, or Grok |
| `category` | Optional allow-listed category |
| `hashtags` | Array of normalized tags derived from content |

RLS is enabled. Four policies restrict SELECT/INSERT/UPDATE/DELETE to the authenticated owner. Table grants independently remove anon access and give authenticated only CRUD; the identity sequence grants only the required USAGE privilege. Check constraints validate metadata values on the server. updated_at is maintained by a trigger whose function uses a fixed search_path.

The production database's created_at column was migrated to timestamptz; existing timestamp-without-time-zone values were interpreted as UTC after confirming the database timezone and insert defaults. The migration is recorded in the production migration history and in the repository.

### Schema and migration rule

**schema.sql** describes the current desired baseline for a newly initialized database. The migration directory contains historical transitions for existing databases. These are not two independent scripts to execute one after the other without migration-history reconciliation: applying a historical migration over the current baseline can duplicate constraints or repeat transitions. Preserve migration history for existing projects and apply only pending versions. For a clean environment that starts from the baseline, reconcile the migration ledger to that baseline before using incremental pushes. See [Development](DEVELOPMENT.md) for the operational caution.

## Prompt import/export

JSON import validates file size, document shape, prompt count, and normalized fields. Current limits are 5 MiB per JSON file and 500 prompts per operation. Import is a content-level migration, not a byte-for-byte database restore: database IDs and timestamps are regenerated, and hashtags are derived again from prompt content. Markdown and JSON exports may contain private prompt content.

## PWA and caching

- **vite.config.ts** emits **asset-manifest.json**.
- **public/sw.js** precaches the HTML shell, web app manifest, icons, and every local JavaScript/CSS/static asset listed in the build manifest, including lazy route chunks.
- Installation fails rather than activating a partially cached release if the complete local asset set cannot be stored.
- Only after successful precaching does the worker call skipWaiting; activation removes older caches with the app-specific prefix and calls clients.claim.
- Same-origin navigation uses network-first behavior with cached /index.html as an offline fallback.
- Cacheable app shell/build assets use network-first behavior with cached fallback. Non-GET methods and third-party origins, including Supabase and Google Fonts, are not intercepted.
- The worker does not make authenticated data available offline. An offline interface is not an offline data-sync feature.

## Hosting

Vercel builds the static Vite output and serves dist/. SPA rewrites keep direct navigation/reloads of client routes working. The web manifest declares standalone display, application icons, and shortcuts for Prompts/Favorites.
