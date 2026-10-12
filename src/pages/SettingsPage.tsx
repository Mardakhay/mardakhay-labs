import { useState } from 'react'
import { Bell, LogOut, ShieldCheck, UserRound, Workflow, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { signOut } from '../api/auth'
import DashboardCard from '../components/DashboardCard'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'

function SettingsPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const { showNotification } = useNotificationStore()

  const [emailAlerts, setEmailAlerts] = useState(true)
  const [inAppAlerts, setInAppAlerts] = useState(true)

  const buttonClassName =
    'rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white transition-colors hover:bg-zinc-800'

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
      <section className='rounded-2xl border border-white/5 bg-white/[0.03] p-5'>
        <div className='flex items-start gap-4'>
          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200'>
            <UserRound className='h-5 w-5' />
          </div>

          <div className='min-w-0 flex-1'>
            <p className='text-xs uppercase tracking-[0.28em] text-zinc-500'>
              Account
            </p>
            <h2 className='mt-2 text-2xl font-semibold tracking-tight'>
              {user?.email ?? 'Workspace user'}
            </h2>
            <p className='mt-2 max-w-2xl text-sm leading-6 text-zinc-400'>
              Your session is protected by Supabase Auth and routed through the
              authenticated workspace shell.
            </p>
          </div>

          <div className='hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.26em] text-zinc-500 sm:inline-flex'>
            Dark-only
          </div>
        </div>
      </section>

      <div className='grid gap-6 lg:grid-cols-2'>
        <DashboardCard title='Notifications'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4'>
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

            <div className='flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4'>
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
            <div className='flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4'>
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
          <div className='rounded-2xl border border-white/5 bg-white/[0.03] p-4'>
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

          <div className='rounded-2xl border border-white/5 bg-white/[0.03] p-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-200'>
                <Sparkles className='h-4 w-4' />
              </div>
              <div>
                <p className='font-medium'>Dark-only UI</p>
                <p className='text-sm text-zinc-500'>Locked to a consistent product look.</p>
              </div>
            </div>
          </div>

          <div className='rounded-2xl border border-white/5 bg-white/[0.03] p-4'>
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
