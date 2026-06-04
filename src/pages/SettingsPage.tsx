import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, Clipboard, Hash, ShieldCheck, UserRound } from 'lucide-react'

import DashboardCard from '../components/DashboardCard'
import { usePromptsQuery } from '../hooks/usePromptsQuery'
import { useAuthStore } from '../stores/authStore'

function formatDate(dateValue?: string) {
  if (!dateValue) return 'No prompts yet'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateValue))
}

function SettingsPage() {
  const { user } = useAuthStore()
  const [copiedEmail, setCopiedEmail] = useState(false)
  const copyTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  const {
    data: prompts = [],
    isLoading,
    error,
  } = usePromptsQuery()

  const workspaceStats = useMemo(() => {
    const favoriteCount = prompts.filter((prompt) => prompt.is_favorite).length
    const aiTargetCount = prompts.filter((prompt) => prompt.ai_target).length
    const categoryCount = prompts.filter((prompt) => prompt.category).length
    const tagCount = new Set(prompts.flatMap((prompt) => prompt.hashtags)).size
    const latestPromptDate = prompts[0]?.created_at

    return [
      {
        label: 'Total prompts',
        value: prompts.length,
        note: 'Synced from Supabase',
      },
      {
        label: 'Favorites',
        value: favoriteCount,
        note: 'Starred prompt assets',
      },
      {
        label: 'AI targets',
        value: aiTargetCount,
        note: 'Model-specific prompts',
      },
      {
        label: 'Categories',
        value: categoryCount,
        note: 'Organized prompt types',
      },
      {
        label: 'Hashtags',
        value: tagCount,
        note: 'Lightweight organization',
      },
      {
        label: 'Latest save',
        value: formatDate(latestPromptDate),
        note: latestPromptDate ? 'Most recent prompt activity' : 'Nothing saved yet',
      },
    ] as const
  }, [prompts])

  async function handleCopyEmail() {
    if (!user?.email) return

    try {
      await navigator.clipboard.writeText(user.email)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = user.email
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    setCopiedEmail(true)

    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current)
    }

    copyTimeoutRef.current = window.setTimeout(() => {
      setCopiedEmail(false)
    }, 1600)
  }

  return (
    <div className='space-y-5'>
      <section className='rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 sm:p-5'>
        <div className='flex items-start gap-4'>
          <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-sky-500/10 text-violet-200 ring-1 ring-white/[0.06]'>
            <UserRound className='h-4.5 w-4.5' />
          </div>

          <div className='min-w-0 flex-1'>
            <p className='text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500 sm:tracking-[0.28em]'>
              Account
            </p>
            <h2 className='mt-2 truncate text-xl font-semibold tracking-tight text-zinc-100 sm:text-[22px]'>
              {user?.email ?? 'Workspace user'}
            </h2>
            <p className='mt-2 max-w-2xl text-[13px] leading-6 text-zinc-400'>
              Review your account status and workspace usage from one calm control
              center.
            </p>

            <div className='mt-4 flex flex-wrap items-center gap-2.5'>
              <button
                type='button'
                onClick={() => void handleCopyEmail()}
                disabled={!user?.email}
                className='inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-[13px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
              >
                {copiedEmail ? (
                  <Clipboard className='h-3.5 w-3.5 text-emerald-400' />
                ) : (
                  <Clipboard className='h-3.5 w-3.5' />
                )}
                {copiedEmail ? 'Copied email' : 'Copy email'}
              </button>

              <span className='inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[11px] font-medium text-zinc-400'>
                <ShieldCheck className='h-3 w-3 text-violet-300' />
                Session restored on refresh
              </span>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className='rounded-3xl border border-red-500/20 bg-red-950/80 p-6 text-red-100'>
          {error.message}
        </div>
      ) : null}

      <DashboardCard title='Workspace snapshot'>
        <div className='grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3'>
          {workspaceStats.map((stat) => (
            <div
              key={stat.label}
              className='rounded-xl border border-white/[0.04] bg-white/[0.015] p-3.5'
            >
              <p className='text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-500'>
                {stat.label}
              </p>
              <p className='mt-2.5 text-lg font-semibold tracking-tight text-zinc-100'>
                {isLoading ? '...' : stat.value}
              </p>
              <p className='mt-1.5 text-[13px] leading-6 text-zinc-500'>{stat.note}</p>
            </div>
          ))}
        </div>
      </DashboardCard>

      <div className='grid gap-5 lg:grid-cols-2'>
        <DashboardCard title='Security'>
          <div className='space-y-3'>
            <div className='flex items-start gap-3.5 rounded-xl border border-white/[0.04] bg-white/[0.015] px-4 py-3.5'>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-400'>
                <ShieldCheck className='h-4 w-4' />
              </div>
              <div>
                <p className='text-[13px] font-medium text-zinc-200'>Authentication status</p>
                <p className='text-[13px] text-zinc-500'>
                  Supabase Auth keeps this workspace session isolated and synced.
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3.5 rounded-xl border border-white/[0.04] bg-white/[0.015] px-4 py-3.5'>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-400'>
                <CalendarDays className='h-4 w-4' />
              </div>
              <div>
                <p className='text-[13px] font-medium text-zinc-200'>Recent activity</p>
                <p className='text-[13px] text-zinc-500'>
                  Latest prompt saves and metadata updates appear in the workspace
                  views, keeping Settings focused on account state.
                </p>
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title='Organization layer'>
          <div className='space-y-3'>
            <div className='flex items-start gap-3.5 rounded-xl border border-white/[0.04] bg-white/[0.015] px-4 py-3.5'>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-400'>
                <Hash className='h-4 w-4' />
              </div>
              <div>
                <p className='text-[13px] font-medium text-zinc-200'>Hashtags</p>
                <p className='text-[13px] text-zinc-500'>
                  Tags are extracted dynamically from prompt content without extra
                  schema complexity.
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3.5 rounded-xl border border-white/[0.04] bg-white/[0.015] px-4 py-3.5'>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-400'>
                <Clipboard className='h-4 w-4' />
              </div>
              <div>
                <p className='text-[13px] font-medium text-zinc-200'>Copy workflow</p>
                <p className='text-[13px] text-zinc-500'>
                  Prompt copy stays fast and clean, with metadata hidden from the
                  copied output.
                </p>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  )
}

export default SettingsPage
