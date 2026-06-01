# Mardakhay Labs

Modern AI workspace for organizing prompts and creative workflows.

## Setup

1. Create a Supabase project.
2. Run the SQL from `supabase/schema.sql`.
3. Add a `.env` file with your Supabase URL and publishable key.
4. Run `npm install` and `npm run dev`.

## Scripts

- `npm run dev` starts the Vite dev server.
- `npm run build` type-checks and builds the app.
- `npm run lint` runs ESLint.
- `npm run check` runs build and lint together.

## Notes

- The app uses Supabase JS for auth and prompt persistence.
- Dashboard and prompts are powered by React Query with user-scoped cache keys.
- Prompt metadata is stored in Supabase columns and rendered from the content layer.
