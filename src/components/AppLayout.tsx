import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { signOut } from '../api/auth'
import Notification from './Notification'
import { useTheme } from '../context/ThemeContext'
import { useAuthStore } from '../stores/authStore'

type AppLayoutProps = {
  children: ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const { clearUserEmail } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const shellClassName = isDark
    ? 'bg-zinc-950 text-white'
    : 'bg-zinc-50 text-zinc-950'

  const sidebarClassName = isDark
    ? 'border-zinc-800 bg-zinc-950'
    : 'border-zinc-200 bg-white'

  const navLinkClassName = (isActive: boolean) => {
    if (isDark) {
      return `block rounded-lg px-4 py-2 transition-colors ${
        isActive
          ? 'bg-zinc-800 text-white'
          : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
      }`
    }

    return `block rounded-lg px-4 py-2 transition-colors ${
      isActive
        ? 'bg-zinc-200 text-zinc-950'
        : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
    }`
  }

  async function handleLogout() {
    try {
      await signOut()
    } finally {
      clearUserEmail()
      navigate('/login')
    }
  }

  return (
    <div className={`flex min-h-screen transition-colors ${shellClassName}`}>
      <Notification />

      <aside className={`w-64 border-r p-6 ${sidebarClassName}`}>
        <h1 className='mb-8 text-2xl font-bold'>Mardakhay Labs</h1>

        <nav className='space-y-2'>
          <NavLink to='/' className={({ isActive }) => navLinkClassName(isActive)}>
            Dashboard
          </NavLink>

          <NavLink
            to='/prompts'
            className={({ isActive }) => navLinkClassName(isActive)}
          >
            Prompts
          </NavLink>

          <NavLink
            to='/favorites'
            className={({ isActive }) => navLinkClassName(isActive)}
          >
            Favorites
          </NavLink>

          <NavLink
            to='/settings'
            className={({ isActive }) => navLinkClassName(isActive)}
          >
            Settings
          </NavLink>
        </nav>

        <button
          onClick={toggleTheme}
          className={`mt-6 w-full rounded-lg px-4 py-2 transition-colors ${
            isDark
              ? 'bg-zinc-800 text-white hover:bg-zinc-700'
              : 'bg-zinc-200 text-zinc-950 hover:bg-zinc-300'
          }`}
        >
          {isDark ? 'Light theme' : 'Dark theme'}
        </button>

        <button
          onClick={handleLogout}
          className={`mt-3 w-full rounded-lg px-4 py-2 transition-colors ${
            isDark
              ? 'bg-red-500 text-white hover:bg-red-400'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          Logout
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
