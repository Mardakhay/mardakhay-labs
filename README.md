# Mardakhay Labs

Mardakhay Labs is a prompt management workspace for creating, organizing, editing, searching, and exporting AI prompts in a secure multi-tenant environment.

It is built as a React + TypeScript frontend with Supabase Auth and PostgreSQL, including row-level security (RLS) and user-scoped caching.

## What It Does

- Authenticate users with Supabase Auth.
- Store prompts per user with strict tenant isolation.
- Create, edit, delete, favorite, and bulk-manage prompts.
- Search and filter by text, AI target, category, favorites, and hashtags.
- Import/export prompts as JSON and Markdown.
- Open prompt details in a centered modal with keyboard and mouse support.
- Use keyboard shortcuts for fast navigation (for example `Ctrl/Cmd + K`, `n`, `/`).

## Current UX Behavior

- Desktop sidebar is fixed and remains visible while content scrolls.
- Prompt detail and editor modals are centered and remain fixed while open.
- Prompt detail can be opened by:
  - Clicking the prompt card
  - Pressing `Enter` while the card is focused
  - Pressing `Enter` while the pointer hovers the card

## Tech Stack

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- TanStack Query 5
- Zustand 5
- Supabase JS 2

## Data Model and Security

Database schema is in [`supabase/schema.sql`](supabase/schema.sql).

Primary table: `public.prompts`
- `id`, `created_at`, `title`, `content`, `user_id`
- `is_favorite`, `ai_target`, `category`, `hashtags`

Security and performance:
- RLS policies for select/insert/update/delete using `auth.uid() = user_id`
- Indexes for user/time, favorite, AI target, and category

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

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env` in project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Apply database schema

Run SQL from `supabase/schema.sql` in your Supabase SQL Editor.

### 4. Start development server

```bash
npm run dev
```

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Type-check and production build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally
- `npm run check` - Build + lint

## Notes

- The app expects valid Supabase environment variables at startup.
- Prompt data access is enforced at the database level via RLS.
