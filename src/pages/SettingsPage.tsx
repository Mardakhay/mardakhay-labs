import { useState } from 'react'
import { Bell, ShieldCheck, UserRound } from 'lucide-react'

import DashboardCard from '../components/DashboardCard'
import { useAuthStore } from '../stores/authStore'

function SettingsPage() {
  const { user } = useAuthStore()

  const [emailAlerts, setEmailAlerts] = useState(true)
  const [inAppAlerts, setInAppAlerts] = useState(true)

  const toggleButtonClass =
    'rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white transition-colors hover:bg-zinc-800'

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
                className={`${toggleButtonClass} min-w-[92px]`}
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
                className={`${toggleButtonClass} min-w-[92px]`}
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

            <div className='rounded-2xl border border-dashed border-zinc-700 px-4 py-4 text-sm leading-6 text-zinc-400'>
              Sign out is available in the sidebar so the security panel stays focused
              on account status instead of duplicating actions.
            </div>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title='Workspace preferences'>
        <div className='grid gap-4 lg:grid-cols-2'>
          <div className='rounded-2xl border border-white/5 bg-white/[0.03] p-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-200'>
                <Bell className='h-4 w-4' />
              </div>
              <div>
                <p className='font-medium'>Notification tone</p>
                <p className='text-sm text-zinc-500'>Quiet, useful, and non-intrusive.</p>
              </div>
            </div>
          </div>

          <div className='rounded-2xl border border-white/5 bg-white/[0.03] p-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-200'>
                <ShieldCheck className='h-4 w-4' />
              </div>
              <div>
                <p className='font-medium'>Workspace mode</p>
                <p className='text-sm text-zinc-500'>Focused and calm by design.</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  )
}

export default SettingsPage
