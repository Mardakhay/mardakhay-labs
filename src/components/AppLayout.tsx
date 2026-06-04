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
import { usePromptMutations } from '../hooks/usePromptMutations'
import { promptsQueryBaseKey, usePromptsQuery } from '../hooks/usePromptsQuery'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'
import CommandPalette from './CommandPalette'
import CreatePromptModal from './CreatePromptModal'

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/prompts', label: 'Prompts', icon: Library },
  { to: '/favorites', label: 'Favorites', icon: Heart },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable
}

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, setUser } = useAuthStore()
  const { showNotification } = useNotificationStore()
  const { createPromptMutation } = usePromptMutations()
  const { data: prompts = [] } = usePromptsQuery()
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
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
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen(true)
        return
      }

      if (!isTypingTarget(event.target) && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        setCreateOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
    <div className='min-h-screen bg-[#030305] text-white'>
      <aside className='fixed inset-y-0 left-0 z-30 hidden w-[272px] flex-col justify-between border-r border-white/[0.04] bg-white/[0.02] px-5 py-6 backdrop-blur-2xl xl:flex'>
        <div>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-sky-500/10 text-violet-200 ring-1 ring-white/[0.06]'>
              <Sparkles className='h-[18px] w-[18px]' />
            </div>
            <div className='min-w-0'>
              <p className='text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-500'>
                AI Workspace
              </p>
              <h1 className='truncate text-[15px] font-semibold tracking-tight text-zinc-100'>
                Mardakhay Labs
              </h1>
            </div>
          </div>

          <button
            type='button'
            onClick={() => setCommandOpen(true)}
            className='mt-5 flex min-h-10 items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-left text-[13px] text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300'
          >
            <span>Search commands</span>
            <span className='rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-zinc-500'>/</span>
          </button>

          <nav className='mt-5 space-y-1'>
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white/[0.06] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)]'
                      : 'text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200'
                  }`
                }
              >
                <Icon className={`h-[15px] w-[15px] transition-colors duration-200 ${location.pathname === to ? 'text-violet-300' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className='space-y-3'>
          <div className='rounded-xl border border-white/[0.04] bg-white/[0.02] p-3.5'>
            <div className='flex items-center gap-3'>
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-zinc-400'>
                <Menu className='h-3.5 w-3.5' />
              </div>

              <div className='min-w-0 flex-1'>
                <p className='truncate text-[13px] font-medium text-zinc-200'>
                  {user?.email ?? 'Signed in user'}
                </p>
                <p className='mt-0.5 text-[11px] text-zinc-500'>
                  Protected by Supabase Auth
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className='inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-2.5 text-[13px] font-medium text-zinc-400 transition-all duration-200 hover:border-red-500/20 hover:bg-red-500/[0.06] hover:text-red-200'
            aria-label='Sign out'
          >
            <LogOut className='h-3.5 w-3.5' />
            Sign out
          </button>
        </div>
      </aside>

      <div className='min-h-screen xl:pl-[272px]'>
        <div className='flex min-h-screen flex-1 flex-col'>
          <header className='sticky top-0 z-20 border-b border-white/[0.04] bg-[#030305]/80 px-4 py-3 backdrop-blur-2xl sm:px-6 sm:py-4 lg:px-8'>
            <div className='flex items-center justify-between gap-3'>
              <div className='flex min-w-0 items-center gap-3'>
                <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-sky-500/10 text-violet-200 ring-1 ring-white/[0.06] xl:hidden'>
                  <Sparkles className='h-4 w-4' />
                </div>

                <div className='min-w-0'>
                  <p className='truncate text-[15px] font-semibold tracking-tight text-zinc-100 xl:hidden'>
                    Mardakhay Labs
                  </p>
                  <p className='hidden text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-500 xl:block'>
                    Workspace
                  </p>
                  <h2 className='truncate text-[11px] font-medium text-zinc-500 sm:text-[22px] sm:font-semibold sm:text-zinc-100 sm:tracking-tight xl:mt-1 xl:block'>
                    {activeRoute}
                  </h2>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <span className='hidden items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-400 sm:inline-flex'>
                  <span className='h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' />
                  Protected
                </span>

                <div ref={accountMenuRef} className='relative xl:hidden'>
                  <button
                    type='button'
                    onClick={() => setAccountMenuOpen((current) => !current)}
                    className='inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 text-[13px] font-medium text-zinc-200 transition-all duration-200 hover:bg-white/[0.05]'
                    aria-haspopup='menu'
                    aria-expanded={accountMenuOpen}
                    aria-label='Open account menu'
                  >
                    <UserRound className='h-3.5 w-3.5 text-violet-300' />
                    <span className='hidden max-w-32 truncate sm:inline'>
                      {user?.email ?? 'Account'}
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${accountMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {accountMenuOpen ? (
                    <div
                      role='menu'
                      className='app-menu absolute right-0 top-[calc(100%+0.5rem)] w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0c]/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-xl'
                    >
                      <div className='px-3 py-3'>
                        <p className='text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-500'>
                          Signed in
                        </p>
                        <p className='mt-1 truncate text-[13px] font-medium text-zinc-200'>
                          {user?.email ?? 'Workspace user'}
                        </p>
                      </div>

                      <button
                        type='button'
                        onClick={() => {
                          setAccountMenuOpen(false)
                          void handleLogout()
                        }}
                        className='flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 text-[13px] font-medium text-red-300 transition-colors hover:bg-red-500/15'
                        role='menuitem'
                      >
                        <LogOut className='h-3.5 w-3.5' />
                        Sign out
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <nav className='mt-3 grid grid-cols-4 gap-1.5 xl:hidden'>
              {navigation.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `group flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-[11px] font-medium transition-all duration-200 sm:min-h-10 sm:flex-row sm:gap-2 sm:rounded-lg sm:text-[13px] ${
                      isActive
                        ? 'border-white/[0.06] bg-white/[0.06] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)]'
                        : 'border-transparent bg-transparent text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200'
                    }`
                  }
                >
                  <Icon className={`h-3.5 w-3.5 shrink-0 transition-colors duration-200 ${location.pathname === to ? 'text-violet-300' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
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

      <CommandPalette
        open={commandOpen}
        prompts={prompts}
        onClose={() => setCommandOpen(false)}
        onCreatePrompt={() => setCreateOpen(true)}
        onNavigate={(path) => navigate(path)}
        onOpenPrompt={(promptId) => navigate(`/prompts?prompt=${promptId}`)}
      />

      <CreatePromptModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        hideTrigger
        draftKey='mardakhay-labs:draft:new-global'
        onSave={(input) => createPromptMutation.mutateAsync(input)}
      />
    </div>
  )
}

export default AppLayout
