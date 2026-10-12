import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

import Notification from './Notification'
import { useTheme } from '../context/ThemeContext'

type AppLayoutProps = {
  children: ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div
      className={`flex min-h-screen transition-colors ${
        theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-white text-black'
      }`}
    >
      <Notification />

      <aside className='w-64 border-r border-zinc-800 p-6'>
        <h1 className='mb-8 text-2xl font-bold'>Mardakhay Labs</h1>

        <nav className='space-y-2'>
          <NavLink
            to='/'
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 transition-colors ${
                isActive ? 'bg-zinc-800' : 'hover:bg-zinc-900'
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to='/prompts'
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 transition-colors ${
                isActive ? 'bg-zinc-800' : 'hover:bg-zinc-900'
              }`
            }
          >
            Prompts
          </NavLink>

          <NavLink
            to='/favorites'
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 transition-colors ${
                isActive ? 'bg-zinc-800' : 'hover:bg-zinc-900'
              }`
            }
          >
            Favorites
          </NavLink>

          <NavLink
            to='/settings'
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 transition-colors ${
                isActive ? 'bg-zinc-800' : 'hover:bg-zinc-900'
              }`
            }
          >
            Settings
          </NavLink>
        </nav>

        <button
          onClick={toggleTheme}
          className='mt-6 w-full rounded-lg bg-zinc-800 px-4 py-2 transition-colors hover:bg-zinc-700'
        >
          {theme === 'dark' ? 'Light theme' : 'Dark theme'}
        </button>
      </aside>

      <main className='flex-1 p-10'>
        <h2 className='mb-6 text-3xl font-bold'>Mardakhay Labs</h2>
        {children}
      </main>
    </div>
  )
}

export default AppLayout
