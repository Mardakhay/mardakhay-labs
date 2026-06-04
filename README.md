# Mardakhay Labs

Mardakhay Labs is a secure AI prompt workspace for creating, organizing, editing, searching, and exporting prompts in a user-scoped environment backed by Supabase Auth and PostgreSQL.

The current app is a React + TypeScript frontend with a polished dashboard, a searchable prompt library, favorites, import/export tools, activity tracking, and an account/settings area. Access is protected by Supabase Auth and reinforced with row-level security in the database.

## Highlights

- Sign in and sign out with Supabase Auth.
- Protected routes for the dashboard, prompt library, favorites, and settings.
- Create, edit, delete, favorite, and bulk-manage prompts.
- Search prompts by title, content, AI target, category, and hashtags.
- Filter by favorites, AI target, category, and tag.
- Sort prompts by newest or oldest.
- Select multiple prompts for bulk actions.
- Import prompts from JSON.
- Export prompts to JSON or Markdown.
- Open prompt details in a centered modal.
- Copy prompt content, Markdown, or JSON with one click.
- Use keyboard shortcuts for faster navigation.
- Track workspace activity for create, update, favorite, import, export, delete, and tag-rename actions.
- View workspace stats in Dashboard and Settings.

## Tech Stack

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- TanStack Query 5
- Zustand 5
- Supabase JS 2
- React Router 7
- lucide-react

## Core Pages

### Dashboard
The dashboard gives a quick workspace overview, recent prompts, and recent activity. It also provides a fast entry point to create a new prompt or jump into the library.

### Prompts
The prompt library is the main working area. It supports:

- Text search
- Favorite-only browsing
- AI target filtering
- Category filtering
- Hashtag filtering
- Bulk selection and bulk actions
- Import and export
- Tag renaming across prompts
- Prompt detail inspection and inline editing

### Favorites
A focused view for starred prompts.

### Settings
The settings area shows account information, security context, and workspace statistics such as prompt counts, favorites, AI targets, categories, hashtags, and the most recent save.

## Keyboard Shortcuts

- `Ctrl/Cmd + K` opens the command palette.
- `n` opens the new prompt modal.
- `/` focuses prompt search in the library.
- `Enter` opens a prompt detail card when the card is focused or hovered.
- `Esc` closes modals and menus.

## Data Model

The main table is `public.prompts` in `supabase/schema.sql`.

Important fields:

- `id`
- `created_at`
- `title`
- `content`
- `user_id`
- `is_favorite`
- `ai_target`
- `category`
- `hashtags`

The database also includes indexes for user, favorites, AI target, and category lookups.

## Security

- Every prompt row is tied to a signed-in Supabase user.
- Row-level security limits select, insert, update, and delete actions to `auth.uid() = user_id`.
- Prompt data is filtered and cached per user in the client.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Apply the database schema

Run the SQL from `supabase/schema.sql` and any files in `supabase/migrations/` in the Supabase SQL Editor.

### 4. Start the development server

```bash
npm run dev
```

## Scripts

- `npm run dev` — start the Vite development server
- `npm run build` — run TypeScript and create a production build
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build locally
- `npm run check` — run the full validation pipeline (`build` + `lint`)

## Prompt Import and Export

Prompts can be exported as:

- JSON
- Markdown

Imports currently accept JSON prompt payloads. Prompt metadata such as AI target and category is preserved where available.

## Project Structure

```text
mardakhay-labs/
├── public/
├── supabase/
│   └── schema.sql
├── src/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── stores/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Notes

- The app expects valid Supabase environment variables at startup.
- Prompt data access is enforced at the database layer with RLS.
- Hashtags and metadata are derived from prompt content and stored in the database for filtering and organization.
