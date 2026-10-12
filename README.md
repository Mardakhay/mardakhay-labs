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
VITE_SUPABASE_ANON_KEY=your-anon-key
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
