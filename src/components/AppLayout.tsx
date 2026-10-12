import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  ScrollText,
  Settings2,
  Sparkles,
  Star,
  SunMedium,
} from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

import { signOut } from '../api/auth'
import { useTheme } from '../context/useTheme'
import { useAuthStore } from '../stores/authStore'

type AppLayoutProps = {
  children: ReactNode
}

const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/prompts',
    label: 'Prompts',
    icon: ScrollText,
  },
  {
    to: '/favorites',
    label: 'Favorites',
    icon: Star,
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: Settings2,
  },
]

const routeMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Dashboard',
    description: 'Monitor your prompt workspace at a glance.',
  },
  '/prompts': {
    title: 'Prompts',
    description: 'Search, create, pin, and manage your prompt library.',
  },
  '/favorites': {
    title: 'Favorites',
    description: 'All of your saved prompt ideas in one place.',
  },
  '/settings': {
    title: 'Settings',
    description: 'Personalize your workspace and account preferences.',
  },
}

function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { clearUserEmail, userEmail } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const currentMeta = useMemo(() => {
    return routeMeta[location.pathname] ?? routeMeta['/']
  }, [location.pathname])

  useEffect(() => {
    if (!mobileMenuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [mobileMenuOpen])

  async function handleLogout() {
    try {
      await signOut()
    } finally {
      clearUserEmail()
      navigate('/login')
    }
  }

  const shellClassName = isDark
    ? 'bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.08),_transparent_28%),linear-gradient(180deg,_#09090b_0%,_#09090b_100%)] text-white'
    : 'bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.08),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#f4f4f5_100%)] text-zinc-950'

  const sidebarClassName = isDark
    ? 'border-white/5 bg-zinc-950/90 backdrop-blur-xl'
    : 'border-zinc-200/80 bg-white/90 backdrop-blur-xl'

  const mobileSidebarClassName = isDark
    ? 'border-zinc-800 bg-zinc-950'
    : 'border-zinc-200 bg-white'

  const topbarClassName = isDark
    ? 'border-white/5 bg-zinc-950/70 text-white'
    : 'border-zinc-200/80 bg-white/70 text-zinc-950'

  const navLinkClassName = (isActive: boolean) => {
    if (isDark) {
      return `group flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
        isActive
          ? 'bg-white/8 text-white ring-1 ring-white/10'
          : 'text-zinc-400 hover:bg-white/5 hover:text-white'
      }`
    }

    return `group flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
      isActive
        ? 'bg-zinc-100 text-zinc-950 ring-1 ring-zinc-200'
        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
    }`
  }

  const initials = (userEmail ?? 'ML')
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase()

  const workspaceBadgeClassName = isDark
    ? 'border-violet-500/20 bg-violet-500/10 text-violet-100'
    : 'border-violet-200 bg-violet-50 text-violet-700'

  return (
    <div className={`min-h-screen transition-colors ${shellClassName}`}>
      <aside className={`fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r ${sidebarClassName} md:flex`}>
        <div className='flex h-full flex-col p-6'>
          <div className='mb-8'>
            <div className='flex items-center gap-3'>
              <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500 text-white shadow-lg shadow-violet-500/20'>
                <Sparkles className='h-5 w-5' />
              </div>
              <div>
                <h1 className='text-xl font-semibold tracking-tight'>Mardakhay Labs</h1>
                <p className='text-xs uppercase tracking-[0.28em] text-zinc-500'>
                  AI SaaS Platform
                </p>
              </div>
            </div>

            <span
              className={`mt-4 inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] ${workspaceBadgeClassName}`}
            >
              Production workspace
            </span>
          </div>

          <nav className='flex-1 space-y-2'>
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => navLinkClassName(isActive)}
                >
                  <Icon className='h-4 w-4 shrink-0' />
                  <span className='text-sm font-medium'>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          <div
            className={`rounded-2xl border p-4 ${
              isDark
                ? 'border-white/5 bg-white/5'
                : 'border-zinc-200 bg-zinc-50'
            }`}
          >
            <p className='text-xs uppercase tracking-[0.28em] text-zinc-500'>
              Signed in as
            </p>
            <p className='mt-2 truncate text-sm font-medium'>{userEmail ?? 'Workspace user'}</p>

            <div className='mt-4 flex gap-2'>
              <button
                onClick={toggleTheme}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isDark
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                    : 'bg-white text-zinc-950 hover:bg-zinc-100'
                }`}
              >
                {isDark ? <SunMedium className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
                {isDark ? 'Light' : 'Dark'}
              </button>

              <button
                onClick={handleLogout}
                className='flex items-center justify-center rounded-xl bg-red-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-400'
              >
                <LogOut className='h-4 w-4' />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className='min-h-screen md:pl-72'>
        <header className={`sticky top-0 z-30 border-b backdrop-blur-xl ${topbarClassName}`}>
          <div className='flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8'>
            <div className='flex min-w-0 items-center gap-3'>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border md:hidden ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-white'
                    : 'border-zinc-200 bg-white text-zinc-950'
                }`}
                aria-label='Open navigation'
              >
                <Menu className='h-5 w-5' />
              </button>

              <div className='min-w-0'>
                <p className='text-[11px] font-semibold uppercase tracking-[0.32em] text-zinc-500'>
                  Mardakhay Labs
                </p>
                <h2 className='mt-1 truncate text-xl font-semibold tracking-tight sm:text-2xl'>
                  {currentMeta.title}
                </h2>
                <p className='mt-1 hidden text-sm text-zinc-500 sm:block'>
                  {currentMeta.description}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <button
                onClick={toggleTheme}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                    : 'border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-100'
                }`}
                aria-label='Toggle theme'
              >
                {isDark ? (
                  <SunMedium className='h-5 w-5' />
                ) : (
                  <Moon className='h-5 w-5' />
                )}
              </button>

              <button
                className={`hidden h-11 w-11 items-center justify-center rounded-xl border transition-colors sm:inline-flex ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                    : 'border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-100'
                }`}
                aria-label='Notifications'
              >
                <Bell className='h-5 w-5' />
              </button>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-semibold uppercase tracking-[0.2em] ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-white'
                    : 'border-zinc-200 bg-white text-zinc-950'
                }`}
                title={userEmail ?? 'Workspace user'}
              >
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className='px-4 py-6 sm:px-6 lg:px-8'>
          <div className='mx-auto w-full max-w-7xl'>{children}</div>
        </main>
      </div>

      {mobileMenuOpen && (
        <div
          className='fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden'
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setMobileMenuOpen(false)
            }
          }}
        >
          <aside
            className={`absolute left-0 top-0 flex h-full w-[85vw] max-w-sm flex-col border-r ${mobileSidebarClassName}`}
          >
            <div className='flex items-center justify-between border-b border-white/5 p-5'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500 text-white'>
                  <Sparkles className='h-5 w-5' />
                </div>
                <div>
                  <h1 className='text-lg font-semibold'>Mardakhay Labs</h1>
                  <p className='text-xs uppercase tracking-[0.24em] text-zinc-500'>
                    AI SaaS Platform
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-xl border p-2 ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-white'
                    : 'border-zinc-200 bg-white text-zinc-950'
                }`}
                aria-label='Close navigation'
              >
                <PanelLeftClose className='h-4 w-4' />
              </button>
            </div>

            <div className='flex h-full flex-col p-5'>
              <nav className='space-y-2'>
                {navItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => navLinkClassName(isActive)}
                    >
                      <Icon className='h-4 w-4 shrink-0' />
                      <span className='text-sm font-medium'>{item.label}</span>
                    </NavLink>
                  )
                })}
              </nav>

              <div
                className={`mt-auto rounded-2xl border p-4 ${
                  isDark
                    ? 'border-white/5 bg-white/5'
                    : 'border-zinc-200 bg-zinc-50'
                }`}
              >
                <p className='text-xs uppercase tracking-[0.28em] text-zinc-500'>
                  Signed in as
                </p>
                <p className='mt-2 truncate text-sm font-medium'>{userEmail ?? 'Workspace user'}</p>

                <div className='mt-4 grid grid-cols-2 gap-2'>
                  <button
                    onClick={toggleTheme}
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      isDark
                        ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                        : 'bg-white text-zinc-950 hover:bg-zinc-100'
                    }`}
                  >
                    {isDark ? <SunMedium className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
                    {isDark ? 'Light' : 'Dark'}
                  </button>

                  <button
                    onClick={handleLogout}
                    className='flex items-center justify-center gap-2 rounded-xl bg-red-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-400'
                  >
                    <LogOut className='h-4 w-4' />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

export default AppLayout
