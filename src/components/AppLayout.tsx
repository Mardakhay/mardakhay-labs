import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

type AppLayoutProps = {
  children: ReactNode
}

function AppLayout({
  children,
}: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <aside className="w-64 border-r border-zinc-800 p-6">
        <h1 className="mb-8 text-2xl font-bold">
          Mardakhay Labs
        </h1>

        <nav className="space-y-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 transition-colors ${
                isActive
                  ? 'bg-zinc-800'
                  : 'hover:bg-zinc-900'
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/prompts"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 transition-colors ${
                isActive
                  ? 'bg-zinc-800'
                  : 'hover:bg-zinc-900'
              }`
            }
          >
            Prompts
          </NavLink>

          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 transition-colors ${
                isActive
                  ? 'bg-zinc-800'
                  : 'hover:bg-zinc-900'
              }`
            }
          >
            Favorites
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 transition-colors ${
                isActive
                  ? 'bg-zinc-800'
                  : 'hover:bg-zinc-900'
              }`
            }
          >
            Settings
          </NavLink>
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <h2 className="mb-6 text-3xl font-bold">
          Mardakhay Labs
        </h2>

        {children}
      </main>
    </div>
  )
}

export default AppLayout