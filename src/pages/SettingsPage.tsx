import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Clipboard, Hash, ShieldCheck, UserRound } from 'lucide-react'

import { getPrompts, type Prompt } from '../api/prompts'
import DashboardCard from '../components/DashboardCard'
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
  } = useQuery<Prompt[], Error>({
    queryKey: ['prompts'],
    queryFn: getPrompts,
  })

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
    <div className='space-y-6'>
      <section className='rounded-2xl border border-white/5 bg-white/[0.03] p-4 sm:p-5'>
        <div className='flex items-start gap-4'>
          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200'>
            <UserRound className='h-5 w-5' />
          </div>

          <div className='min-w-0 flex-1'>
            <p className='text-xs uppercase tracking-[0.22em] text-zinc-500 sm:tracking-[0.28em]'>
              Account
            </p>
            <h2 className='mt-2 truncate text-xl font-semibold tracking-tight sm:text-2xl'>
              {user?.email ?? 'Workspace user'}
            </h2>
            <p className='mt-2 max-w-2xl text-sm leading-6 text-zinc-400'>
              Review your account status and workspace usage from one calm control
              center.
            </p>

            <div className='mt-4 flex flex-wrap items-center gap-3'>
              <button
                type='button'
                onClick={() => void handleCopyEmail()}
                disabled={!user?.email}
                className='inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {copiedEmail ? (
                  <Clipboard className='h-4 w-4 text-emerald-300' />
                ) : (
                  <Clipboard className='h-4 w-4' />
                )}
                {copiedEmail ? 'Copied email' : 'Copy email'}
              </button>

              <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300'>
                <ShieldCheck className='h-3.5 w-3.5 text-violet-200' />
                Session restored on refresh
              </span>
            </div>
          </div>
        </div>
      </section>

      <DashboardCard title='Workspace snapshot'>
        <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          {workspaceStats.map((stat) => (
            <div
              key={stat.label}
              className='rounded-2xl border border-white/5 bg-white/[0.03] p-4'
            >
              <p className='text-xs uppercase tracking-[0.24em] text-zinc-500'>
                {stat.label}
              </p>
              <p className='mt-3 text-xl font-semibold tracking-tight text-white'>
                {isLoading ? '…' : stat.value}
              </p>
              <p className='mt-2 text-sm leading-6 text-zinc-500'>{stat.note}</p>
            </div>
          ))}
        </div>
      </DashboardCard>

      <div className='grid gap-6 lg:grid-cols-2'>
        <DashboardCard title='Security'>
          <div className='space-y-4'>
            <div className='flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4'>
              <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200'>
                <ShieldCheck className='h-5 w-5' />
              </div>
              <div>
                <p className='font-medium'>Authentication status</p>
                <p className='text-sm text-zinc-500'>
                  Supabase Auth keeps this workspace session isolated and synced.
                </p>
              </div>
            </div>

            <div className='flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4'>
              <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200'>
                <CalendarDays className='h-5 w-5' />
              </div>
              <div>
                <p className='font-medium'>Recent activity</p>
                <p className='text-sm text-zinc-500'>
                  Latest prompt saves and metadata updates appear in the workspace
                  views, keeping Settings focused on account state.
                </p>
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title='Organization layer'>
          <div className='space-y-4'>
            <div className='flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4'>
              <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200'>
                <Hash className='h-5 w-5' />
              </div>
              <div>
                <p className='font-medium'>Hashtags</p>
                <p className='text-sm text-zinc-500'>
                  Tags are extracted dynamically from prompt content without extra
                  schema complexity.
                </p>
              </div>
            </div>

            <div className='flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4'>
              <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200'>
                <Clipboard className='h-5 w-5' />
              </div>
              <div>
                <p className='font-medium'>Copy workflow</p>
                <p className='text-sm text-zinc-500'>
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
