import { useState } from 'react'
import { Bell, LogOut, Moon, ShieldCheck, UserRound, Workflow } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { signOut } from '../api/auth'
import DashboardCard from '../components/DashboardCard'
import { useTheme } from '../context/useTheme'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'

function SettingsPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const { user, setUser } = useAuthStore()
  const { showNotification } = useNotificationStore()

  const [emailAlerts, setEmailAlerts] = useState(true)
  const [inAppAlerts, setInAppAlerts] = useState(true)

  const buttonClassName = isDark
    ? 'rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white transition-colors hover:bg-zinc-800'
    : 'rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-950 transition-colors hover:bg-zinc-100'

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
    <div className='space-y-6'>
      <DashboardCard title='Profile settings'>
        <div className='grid gap-4 lg:grid-cols-[1.4fr_1fr]'>
          <div
            className={`rounded-3xl border p-5 ${
              isDark ? 'border-white/5 bg-white/5' : 'border-zinc-200 bg-zinc-50'
            }`}
          >
            <div className='flex items-start gap-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200'>
                <UserRound className='h-5 w-5' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className={`text-sm uppercase tracking-[0.28em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Account
                </p>
                <h3 className='mt-2 text-2xl font-semibold tracking-tight'>
                  {user?.email ?? 'Workspace user'}
                </h3>
                <p className={`mt-2 text-sm leading-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Your session is protected by Supabase Auth and routed through the
                  authenticated workspace shell.
                </p>
              </div>
            </div>
          </div>

          <div
            className={`rounded-3xl border p-5 ${
              isDark ? 'border-white/5 bg-white/5' : 'border-zinc-200 bg-zinc-50'
            }`}
          >
            <p className={`text-sm uppercase tracking-[0.28em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Workspace
            </p>
            <div className='mt-4 space-y-3 text-sm'>
              <div className='flex items-center justify-between gap-3'>
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Theme</span>
                <button onClick={toggleTheme} className={buttonClassName}>
                  {isDark ? 'Dark mode' : 'Light mode'}
                </button>
              </div>

              <div className='flex items-center justify-between gap-3'>
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Workspace state</span>
                <span className='inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-200'>
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>

      <div className='grid gap-6 lg:grid-cols-2'>
        <DashboardCard title='Notifications'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-4'>
              <div>
                <p className='font-medium'>Email alerts</p>
                <p className='text-sm text-zinc-500'>
                  Receive product updates and account activity summaries.
                </p>
              </div>

              <button
                onClick={() => setEmailAlerts((current) => !current)}
                className={`${buttonClassName} min-w-[92px]`}
              >
                {emailAlerts ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className='flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-4'>
              <div>
                <p className='font-medium'>In-app alerts</p>
                <p className='text-sm text-zinc-500'>
                  Show real-time prompt creation and sync notifications.
                </p>
              </div>

              <button
                onClick={() => setInAppAlerts((current) => !current)}
                className={`${buttonClassName} min-w-[92px]`}
              >
                {inAppAlerts ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title='Security'>
          <div className='space-y-4'>
            <div className='flex items-start gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-4'>
              <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200'>
                <ShieldCheck className='h-5 w-5' />
              </div>
              <div>
                <p className='font-medium'>Authentication status</p>
                <p className='text-sm text-zinc-500'>
                  Session-based access is active and protected.
                </p>
              </div>
            </div>

            <div className='flex flex-wrap gap-3'>
              <button
                onClick={handleLogout}
                className='inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-400'
              >
                <LogOut className='h-4 w-4' />
                Sign out
              </button>

              <button className={buttonClassName}>
                Manage session
              </button>
            </div>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title='Workspace preferences'>
        <div className='grid gap-4 lg:grid-cols-3'>
          <div className={`rounded-2xl border p-4 ${isDark ? 'border-white/5 bg-white/5' : 'border-zinc-200 bg-zinc-50'}`}>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-200'>
                <Workflow className='h-4 w-4' />
              </div>
              <div>
                <p className='font-medium'>Workflow tone</p>
                <p className='text-sm text-zinc-500'>Fast, focused, and minimal.</p>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-4 ${isDark ? 'border-white/5 bg-white/5' : 'border-zinc-200 bg-zinc-50'}`}>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-200'>
                <Moon className='h-4 w-4' />
              </div>
              <div>
                <p className='font-medium'>Theme engine</p>
                <p className='text-sm text-zinc-500'>Persistent across refreshes.</p>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-4 ${isDark ? 'border-white/5 bg-white/5' : 'border-zinc-200 bg-zinc-50'}`}>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-200'>
                <Bell className='h-4 w-4' />
              </div>
              <div>
                <p className='font-medium'>Notifications</p>
                <p className='text-sm text-zinc-500'>Toast-based workspace updates.</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  )
}

export default SettingsPage
