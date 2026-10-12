import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  UserRound,
} from 'lucide-react'

import { signOut } from '../api/auth'
import { promptsQueryBaseKey } from '../hooks/usePromptsQuery'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/prompts', label: 'Prompts', icon: Library },
  { to: '/favorites', label: 'Favorites', icon: Heart },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, setUser } = useAuthStore()
  const { showNotification } = useNotificationStore()
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement | null>(null)

  const activeRoute =
    navigation.find((item) => item.to === location.pathname)?.label ?? 'Dashboard'

  async function handleLogout() {
    try {
      await signOut()
      queryClient.removeQueries({ queryKey: promptsQueryBaseKey })
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

  useEffect(() => {
    if (!accountMenuOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setAccountMenuOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [accountMenuOpen])

  return (
    <div className='min-h-screen bg-zinc-950 text-white'>
      <div className='flex min-h-screen'>
        <aside className='hidden w-72 shrink-0 flex-col border-r border-white/5 bg-white/[0.035] px-5 py-6 shadow-2xl shadow-black/20 backdrop-blur-xl xl:flex'>
          <div className='flex items-center gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200 shadow-[0_0_40px_rgba(139,92,246,0.14)] ring-1 ring-violet-400/10'>
              <Sparkles className='h-5 w-5' />
            </div>
            <div className='min-w-0'>
              <p className='text-xs uppercase tracking-[0.28em] text-zinc-500'>
                AI Workspace
              </p>
              <h1 className='truncate text-lg font-semibold tracking-tight'>
                Mardakhay Labs
              </h1>
            </div>
          </div>

          <nav className='mt-8 space-y-2'>
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'border-violet-500/30 bg-violet-500/10 text-violet-100 shadow-lg shadow-violet-950/10'
                      : 'border-white/5 bg-transparent text-zinc-300 hover:border-white/10 hover:bg-white/[0.04] hover:text-white'
                  }`
                }
              >
                <Icon className='h-4 w-4 transition-transform duration-200 group-hover:scale-110' />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className='mt-auto pt-6'>
            <div className='app-surface rounded-2xl border border-white/5 p-4'>
              <p className='text-xs uppercase tracking-[0.28em] text-zinc-500'>
                Workspace
              </p>

              <div className='mt-3 flex items-start gap-3'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200'>
                  <Menu className='h-4 w-4' />
                </div>

                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>
                    {user?.email ?? 'Signed in user'}
                  </p>
                  <p className='mt-1 text-xs leading-5 text-zinc-500'>
                    Protected by Supabase Auth
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className='mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200 transition-all duration-200 hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-950/20'
              aria-label='Sign out'
            >
              <LogOut className='h-4 w-4' />
              Sign out
            </button>
          </div>
        </aside>

        <div className='flex min-h-screen flex-1 flex-col'>
          <header className='sticky top-0 z-20 border-b border-white/5 bg-zinc-950/90 px-4 py-3 shadow-lg shadow-black/10 backdrop-blur-xl sm:px-6 sm:py-4 lg:px-8'>
            <div className='flex items-center justify-between gap-3'>
              <div className='flex min-w-0 items-center gap-3'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200 ring-1 ring-violet-400/10 xl:hidden'>
                  <Sparkles className='h-4 w-4' />
                </div>

                <div className='min-w-0'>
                  <p className='truncate text-sm font-semibold tracking-tight text-white xl:hidden'>
                    Mardakhay Labs
                  </p>
                  <p className='hidden text-xs uppercase tracking-[0.28em] text-zinc-500 xl:block'>
                    Workspace
                  </p>
                  <h2 className='truncate text-xs font-medium text-zinc-500 sm:text-2xl sm:font-semibold sm:text-white xl:mt-1 xl:block'>
                    {activeRoute}
                  </h2>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <span className='hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.26em] text-zinc-300 sm:inline-flex'>
                  Protected
                </span>

                <div ref={accountMenuRef} className='relative xl:hidden'>
                  <button
                    type='button'
                    onClick={() => setAccountMenuOpen((current) => !current)}
                    className='inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/[0.07]'
                    aria-haspopup='menu'
                    aria-expanded={accountMenuOpen}
                    aria-label='Open account menu'
                  >
                    <UserRound className='h-4 w-4 text-violet-200' />
                    <span className='hidden max-w-32 truncate sm:inline'>
                      {user?.email ?? 'Account'}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${accountMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {accountMenuOpen ? (
                    <div
                      role='menu'
                      className='app-menu absolute right-0 top-[calc(100%+0.5rem)] w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl'
                    >
                      <div className='px-3 py-3'>
                        <p className='text-xs uppercase tracking-[0.24em] text-zinc-500'>
                          Signed in
                        </p>
                        <p className='mt-1 truncate text-sm font-medium text-white'>
                          {user?.email ?? 'Workspace user'}
                        </p>
                      </div>

                      <button
                        type='button'
                        onClick={() => {
                          setAccountMenuOpen(false)
                          void handleLogout()
                        }}
                        className='flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20'
                        role='menuitem'
                      >
                        <LogOut className='h-4 w-4' />
                        Sign out
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <nav className='mt-3 grid grid-cols-4 gap-2 xl:hidden'>
              {navigation.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `group flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2 text-[11px] font-medium transition-all duration-200 sm:min-h-11 sm:flex-row sm:gap-2 sm:rounded-full sm:text-sm ${
                      isActive
                        ? 'border-violet-500/30 bg-violet-500/10 text-violet-100 shadow-lg shadow-violet-950/10'
                        : 'border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                    }`
                  }
                >
                  <Icon className='h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110' />
                  <span className='truncate'>{label}</span>
                </NavLink>
              ))}
            </nav>
          </header>

          <main className='flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
            <div key={location.pathname} className='app-page mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6'>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default AppLayout
