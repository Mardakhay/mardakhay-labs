import { useMemo } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  Star,
  Settings2,
  Layers3,
} from 'lucide-react'

import { signOut } from '../api/auth'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/prompts', label: 'Prompts', icon: Layers3 },
  { to: '/favorites', label: 'Favorites', icon: Star },
  { to: '/settings', label: 'Settings', icon: Settings2 },
] as const

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const { showNotification } = useNotificationStore()

  const activeRoute = useMemo(() => {
    return navigation.find((item) => item.to === location.pathname)?.label ?? 'Dashboard'
  }, [location.pathname])

  async function handleLogout() {
    try {
      await signOut()
      setUser(null)
      showNotification('You have been signed out.', 'success')
      navigate('/login', { replace: true })
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Failed to sign out.',
        'error'
      )
    }
  }

  return (
    <div className='min-h-screen bg-zinc-950 text-white'>
      <div className='flex min-h-screen'>
        <aside className='hidden w-72 flex-col border-r border-white/5 bg-white/5 p-6 xl:flex'>
          <div className='flex items-center gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200'>
              <Sparkles className='h-5 w-5' />
            </div>
            <div>
              <p className='text-xs uppercase tracking-[0.28em] text-zinc-500'>
                AI Workspace
              </p>
              <h1 className='text-lg font-semibold tracking-tight'>
                Mardakhay Labs
              </h1>
            </div>
          </div>

          <div className='mt-8 rounded-3xl border border-white/5 bg-white/5 p-4'>
            <p className='text-xs uppercase tracking-[0.28em] text-zinc-500'>
              Navigation
            </p>

            <nav className='mt-4 space-y-2'>
              {navigation.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-violet-500/30 bg-violet-500/10 text-violet-100'
                        : 'border-white/5 bg-white/0 text-zinc-300 hover:border-white/10 hover:bg-white/5'
                    }`
                  }
                >
                  <span>{label}</span>
                  <span className='text-[11px] uppercase tracking-[0.28em] text-zinc-500'>
                    {label === 'Dashboard' ? 'Home' : 'View'}
                  </span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className='mt-auto space-y-4 pt-6'>
            <div className='rounded-3xl border border-white/5 bg-white/5 p-4'>
              <p className='text-xs uppercase tracking-[0.28em] text-zinc-500'>
                Workspace
              </p>
              <div className='mt-3 flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200'>
                  <Menu className='h-4 w-4' />
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>
                    {user?.email ?? 'Signed in user'}
                  </p>
                  <p className='text-xs text-zinc-500'>Protected by Supabase Auth</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className='inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20'
              aria-label='Sign out'
            >
              <LogOut className='h-4 w-4' />
              Sign out
            </button>
          </div>
        </aside>

        <div className='flex min-h-screen flex-1 flex-col'>
          <header className='sticky top-0 z-20 border-b border-white/5 bg-zinc-950/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-xs uppercase tracking-[0.28em] text-zinc-500'>
                  Workspace
                </p>
                <h2 className='mt-1 text-xl font-semibold tracking-tight sm:text-2xl'>
                  {activeRoute}
                </h2>
              </div>

              <span className='hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.26em] text-zinc-300 sm:inline-flex'>
                Protected
              </span>
            </div>

            <nav className='mt-4 flex gap-2 overflow-x-auto pb-1 xl:hidden'>
              {navigation.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-violet-500/30 bg-violet-500/10 text-violet-100'
                        : 'border-white/10 bg-white/5 text-zinc-300'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </header>

          <main className='flex-1 px-4 py-6 sm:px-6 lg:px-8'>
            <div className='mx-auto flex w-full max-w-7xl flex-col gap-6'>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default AppLayout
