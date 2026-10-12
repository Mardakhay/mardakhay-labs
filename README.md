# Mardakhay Labs

Mardakhay Labs is a modern AI prompt management platform built with React, TypeScript, and Supabase.

It provides a secure, user-scoped workspace for creating, organizing, searching, favoriting, importing, and exporting prompts while keeping data isolated through Supabase Authentication and PostgreSQL Row Level Security (RLS).

## Features

### Prompt Management
- Create, edit, and delete prompts
- Automatic title generation
- Favorite important prompts
- Rich prompt content support
- Prompt metadata support

### Organization & Discovery
- Instant search
- Filter by AI target
- Filter by category
- Filter by favorites
- Hashtag-based organization
- Bulk selection and actions

### Import & Export
- JSON export
- Markdown export
- JSON import
- Metadata preservation during import/export

### Workspace Experience
- Dashboard overview
- Activity tracking
- Keyboard shortcuts
- Optimistic UI updates
- Persistent draft support
- Responsive interface

### Security
- Supabase Authentication
- User-scoped data access
- PostgreSQL Row Level Security (RLS)
- User-scoped activity history
- User-scoped local persistence

### Authentication provider configuration

Email/password and Google are separate Supabase Auth providers. Keep the Email provider enabled when configuring Google; adding OAuth does not require replacing password sign-in.

For a production deployment, verify the following in the Supabase Dashboard:

- **Authentication → Sign In / Providers:** Email/password is enabled and Google is configured with valid provider credentials.
- **Authentication → URL Configuration:** the production HTTPS origin is the Site URL, and the exact app origin(s) used by sign-in and email confirmation are allow-listed Redirect URLs.
- **Legacy email accounts:** users whose accounts require email confirmation must confirm that address before password sign-in can succeed.
- **Identity linking:** Supabase can automatically link OAuth identities when the provider supplies the same verified email as an existing account. Do not merge users based only on an unverified email, write directly to `auth.users`, or create a second application-level identity table.

The client uses `signInWithPassword()` for the email/password flow and Supabase-managed OAuth/session handling for Google. If password sign-in fails despite valid credentials, check provider settings and the Auth user's confirmation/identity state before changing application data.

## Tech Stack

### Frontend
- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- TanStack Query 5
- Zustand 5
- React Router 7

### Backend
- Supabase
- PostgreSQL
- Supabase Auth

### Tooling
- ESLint
- Vitest
- GitHub Actions

## Quality Assurance

The project includes:

- TypeScript type checking
- ESLint linting
- Vitest unit tests
- GitHub Actions CI

Current test coverage focuses on:

- Prompt formatting
- Prompt metadata
- Import/export utilities
- Prompt cache and optimistic update helpers

## Getting Started

### Installation

```bash
git clone https://github.com/Mardakhay/mardakhay-labs.git
cd mardakhay-labs
npm install
```

### Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### Database Setup

Apply the SQL schema located in:

```text
supabase/schema.sql
```

### Development

```bash
npm run dev
```

### Tests

```bash
npm test
```

### Production Build

```bash
npm run build
```

## Backup and Recovery

For a low-cost manual backup routine, prompt JSON export instructions, and optional Supabase CLI schema/data dumps, see [Backup and Restore](docs/BACKUP_AND_RESTORE.md). Backups may contain private prompt content and should be stored outside Git.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run preview`
- `npm run check`

## Project Structure

```text
src/
├── api/
├── components/
├── hooks/
├── lib/
├── pages/
├── stores/
└── types/
```

## Roadmap

Potential future enhancements:

- Prompt collections
- Prompt version history
- Team workspaces
- AI-powered prompt search
