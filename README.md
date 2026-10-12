# Mardakhay Labs: Technical Specification and Prompt Engineering Workspace

Mardakhay Labs is a high-performance, developer-first prompt engineering workspace designed to centralize, catalog, optimize, and organize prompt assets for generative artificial intelligence workflows. 

Engineered with a focus on stability, security, and exceptional user experience, this application operates as a secure multi-tenant environment. It integrates a responsive dark-mode front-end with an automated PostgreSQL database and authentication engine. The workspace is built to accommodate production-grade prompt management, offering instant keyboard navigation, automatic metadata indexing, portable export capabilities, and real-time synchronization.

---

## Architectural Philosophy and Tech Stack

The architecture of Mardakhay Labs is structured around the principles of low latency, high tactile response, and strict security boundaries. By separating persistent state, client cache, and high-frequency UI transitions, the workspace ensures smooth operation even under extensive data loads.

### Core Technologies and Selection Rationale

#### 1. React 19 and Vite 8
* **Why**: React 19 provides the core component hierarchy with enhanced concurrent rendering, transition APIs, and optimal execution paths. Vite 8 serves as the build tool, enabling sub-second Hot Module Replacement (HMR) during development and compiling optimized, tree-shaken static assets for production deployment.

#### 2. TypeScript 6
* **Why**: Strict compile-time type safety ensures runtime integrity. The application defines unified type contracts for authentication sessions, database schemas, prompt inputs, mutations, and UI state models. This eliminates common interface mismatches and supports structured refactoring.

#### 3. Supabase (PostgreSQL 15 and Auth Go Service)
* **Why**: Supabase acts as the secure backend infrastructure. It provides structured user session management and an enterprise-grade PostgreSQL database. The application leverages native Row Level Security (RLS) and multi-column indexes directly within the database engine to guarantee performant, isolated data access at the query level.

#### 4. TanStack Query v5 (React Query)
* **Why**: TanStack Query serves as the asynchronous server-state synchronization engine. It handles client-side data caching, query invalidation, speculative updates, batching, and automated retry mechanisms. This minimizes server round-trips and keeps the UI perfectly in sync with the PostgreSQL backend.

#### 5. Zustand v5
* **Why**: High-frequency, transient UI states—such as toast notifications, workspace modal visibility, command palette indices, and non-persistent draft backups—are managed outside the React component tree. Zustand provides a lightweight, selector-based, zero-overhead store that avoids unnecessary React re-renders.

#### 6. Tailwind CSS v4 and Custom Design Tokens
* **Why**: Tailwind v4 introduces a streamlined CSS variables-first architecture. It integrates with native CSS `@theme` controls to construct a responsive, high-fidelity design system. Coupled with hardware-accelerated CSS properties (`backdrop-filter` glassmorphism and cubic-bezier spring transitions), the visual environment feels premium and responsive.

---

## Technical Deep Dives

### 1. Secure Authentication and Session Lifecycles
Security is handled through a structured handoff between the Supabase Go-based Auth service and the application client.

* **Session Propagation**: On mounting the application, `App.tsx` establishes a listener via the Supabase Auth API (`onAuthStateChange`). This reactive stream monitors token expiration, silent renewals, and logouts.
* **State Synchronization**: Upon authentication state changes, the system synchronizes the `useAuthStore` (Zustand) and clears the query caches in `useQueryClient` (TanStack Query) using user-scoped key boundaries. This prevents cross-tenant data leaks in memory.
* **Route Guards**: Active routing is guarded by `ProtectedRoute.tsx`. Unauthenticated routing paths are dynamically intercepted at the React Router layer and redirected back to the `/login` gateway with redirection history preserved in the navigation state.

### 2. Optimized Server-State Management and Caching
Client-server data synchronization is decoupled from local view state using a strict cache-key topology.

* **Key Partitioning**: Prompt queries are registered under a unified cache key hierarchy: `['prompts', userId]`. This ensures that when a user logs out, their specific cache slice is completely purged from the engine, preserving host-level client memory isolation.
* **Mutations and Invalidation**: Prompt creation, edits, and deletion are handled via custom hooks wrapping `useMutation` in `src/hooks/usePromptMutations.ts`. On successful network resolution, the mutations trigger a targeted cache invalidation, forcing an asynchronous, non-blocking refetch of the list query.
* **Draft Backups**: To prevent data loss during long prompt composition sessions, the creation and editing workflows utilize a localized draft backup system. Temporary drafts are committed to `localStorage` indexed by the specific prompt ID or creation view identifier, and are automatically cleaned up upon successful database mutation resolution.

### 3. Database Schema and Smart Trigger Mechanics
The workspace database resides in a PostgreSQL 15 environment equipped with row-security policies and auto-indexing.

* **Schema Definition (`supabase/schema.sql`)**:
  ```sql
  create table if not exists public.prompts (
    id bigint generated always as identity primary key,
    created_at timestamptz not null default now(),
    title text not null default '',
    content text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    is_favorite boolean not null default false,
    ai_target text,
    category text,
    hashtags text[] not null default '{}'
  );
  ```
* **Performance Indexing**: To maintain sub-20ms query execution times under heavy data volumes, the system uses targeted multi-column indexes:
  * `prompts_user_id_created_at_idx`: Multi-column index supporting descending chronologically ordered reads within a specific user's tenant space.
  * `prompts_user_id_is_favorite_idx`: Evaluates boolean flags quickly to render starred/pinned prompts.
  * `prompts_user_id_ai_target_idx` and `prompts_user_id_category_idx`: Accelerate category-specific and target-model filtering operations.
* **Metadata Extraction Engines**: The schema features database-side migration logic to extract metadata. For legacy or imported records, the system processes existing contents using regex patterns directly in SQL to identify, clean, and write hashtags (`#tag`) and titles if left unspecified by the user.
* **Row Level Security (RLS)**: Row security is enforced at the database kernel level, ensuring that even if the client-side authentication checks are bypassed, data access is blocked unless the caller matches the verified JWT owner:
  ```sql
  create policy "Users can view their own prompts"
  on public.prompts for select to authenticated
  using (auth.uid() = user_id);
  ```

### 4. High-Tactile User Experience and Interactive Mechanics
The application is designed to behave like a native desktop application, combining instant keyboard access with rich visual feedback.

* **Command Palette (`Ctrl+K`)**: The global search interface (`CommandPalette.tsx`) is mapped to a browser-wide keyboard listener. It gives users immediate, non-mouse access to search through up to 20 cached prompt entries, trigger prompt creation modals, or navigate between the Dashboard, Prompts, Favorites, and Settings views.
* **Glassmorphic Layout System**: The application shell utilizes custom styling variables mapping high-end dark HSL colors:
  * **Surfaces**: Class layers (.app-surface) use a dual linear-gradient background over a dark base, coupled with `backdrop-filter: blur(12px)`. This creates a beautiful glass visual effect when overlapping background elements.
  * **Interactive Transitions**: Buttons and cards transition using a premium cubic-bezier easing curve (`var(--ease-out-soft)`), accompanied by a spring-based scale down (`scale(0.975)`) on click actions to give a tactile feel.
  * **Modern Typography**: The application imports Google Fonts' `Plus Jakarta Sans` for tech-focused headings and UI elements, combined with `Inter` for highly legible, high-density body layout text.

---

## Directory Architecture

The codebase is organized in a highly modular, decoupled structure:

```
mardakhay-labs/
├── .github/                 # CI/CD workflow configurations
├── public/                  # Core static assets and SVG icons
├── supabase/                # PostgreSQL schema definitions and RLS policies
│   └── schema.sql           # Database schema, triggers, and indices
├── src/
│   ├── api/                 # Low-level network interaction layer
│   │   ├── auth.ts          # Supabase authentication API methods
│   │   └── prompts.ts       # Database CRUD operations and data schemas
│   ├── components/          # Reusable UI component modules
│   │   ├── AppLayout.tsx    # Shell component containing sidebar and header
│   │   ├── CommandPalette.tsx # Global keyboard-driven interaction panel
│   │   ├── Notification.tsx # Global dynamic status alert toasts
│   │   ├── PromptCard.tsx   # Detailed display module for prompt resources
│   │   └── ProtectedRoute.tsx # Route safety boundary wrapping
│   ├── hooks/               # Custom React hooks (server state mutations)
│   │   ├── usePromptsQuery.ts # Query wrappers for prompt data fetching
│   │   └── usePromptMutations.ts # Mutation handling for write/delete actions
│   ├── lib/                 # Core functional utility files
│   │   ├── promptFormatting.ts # String manipulation and word counting utilities
│   │   ├── promptExport.ts  # Clipboard interaction and export engines
│   │   └── supabase.ts      # Instantiated Supabase client constructor
│   ├── pages/               # Top-level application view modules
│   │   ├── DashboardPage.tsx # Overview statistics and recent updates
│   │   ├── PromptsPage.tsx  # Dynamic list filtering and search view
│   │   ├── LoginPage.tsx    # Authentication and registration interface
│   │   └── SettingsPage.tsx # Profile and workspace configuration tools
│   ├── stores/              # Zustand localized client state modules
│   │   ├── authStore.ts     # User authentication and loading state
│   │   └── notificationStore.ts # Alert toast enqueue/dequeue controller
│   ├── App.tsx              # Application shell and route orchestrator
│   ├── index.css            # Tailored Tailwind v4 styling design system
│   └── main.tsx             # DOM entry point and React root compiler
├── index.html               # Main HTML entry document and font loading links
├── package.json             # NPM dependencies and script parameters
├── tsconfig.json            # Base compiler configurations
└── vite.config.ts           # Vite compile parameters and plugin setups
```

---

## Local Setup and Installation

Follow these steps to run a local instance of the prompt workspace.

### Prerequisites
* **Node.js**: Version 18.x or higher installed.
* **NPM**: Version 9.x or higher.
* **Supabase Project**: A valid Supabase project set up for hosting the data.

### Installation Procedure

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/mardakhay-labs.git
   cd mardakhay-labs
   ```

2. **Configure Database Schema**:
   * Open your Supabase project dashboard.
   * Navigate to the **SQL Editor** tab.
   * Copy the SQL queries from `supabase/schema.sql` and run them to establish the tables, indices, RLS policies, and triggers.

3. **Establish Local Environment Variables**:
   * Create a new file in the root directory named `.env`:
     ```env
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=your-supabase-anonymous-publishable-key
     ```

4. **Install Dependencies**:
   ```bash
   npm install
   ```

5. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   * Open your browser and navigate to `http://localhost:5173` to access the running workspace.

---

## Scripts and Verification Commands

The project includes pre-configured npm scripts to ensure linting alignment, type safety, and code compilation:

* **Development Run**:
  ```bash
  npm run dev
  ```
  Launches the Vite development environment on port 5173.

* **Codebase Verification**:
  ```bash
  npm run check
  ```
  Executes both the TypeScript compiler type checks and ESLint diagnostics in a combined run to confirm system integrity before committing.

* **Type Safety Check**:
  ```bash
  npx tsc -b
  ```
  Performs strict build checking across TS files without writing output files.

* **Production Compilation**:
  ```bash
  npm run build
  ```
  Type-checks all files, compiles static browser assets, minifies files, and builds a production bundle into the `dist/` directory.

* **Code Linting**:
  ```bash
  npm run lint
  ```
  Runs ESLint across all component files to enforce strict formatting guidelines, clean scoping, and optimal React hooks dependency declarations.
