import { Activity, ArrowRight, Clock3, Sparkles, SquareTerminal as TerminalSquare, Wand as Wand2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'


import CreatePromptModal from '../components/CreatePromptModal'
import DashboardCard from '../components/DashboardCard'
import PromptCard from '../components/PromptCard'
import PromptDetailPanel from '../components/PromptDetailPanel'
import { useActivityLog } from '../hooks/useActivityLog'
import { buildUserScopedStorageKey } from '../lib/storageKeys'
import { useAuthStore } from '../stores/authStore'
import { usePromptMutations } from '../hooks/usePromptMutations'
import { usePromptsQuery } from '../hooks/usePromptsQuery'

function getLatestPromptDate(prompts: Array<{ created_at: string; updated_at?: string }>) {
  return prompts.reduce<string | undefined>((latest, prompt) => {
    const promptDate = prompt.updated_at ?? prompt.created_at

    if (!latest) return promptDate

    return new Date(promptDate).getTime() > new Date(latest).getTime()
      ? promptDate
      : latest
  }, undefined)
}

function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const activityEntries = useActivityLog()
  const [detailPromptId, setDetailPromptId] = useState<number | null>(null)
  const {
    createPromptMutation,
    updatePromptMutation,
    favoriteMutation,
  } = usePromptMutations()

  const {
    data: prompts = [],
    isLoading,
    error,
  } = usePromptsQuery()

  if (isLoading) {
    return (
      <div className='rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8 text-white'>
        <div className='animate-pulse space-y-4'>
          <div className='skeleton-shimmer h-6 w-40 rounded-full bg-white/10' />
          <div className='skeleton-shimmer h-10 w-72 rounded-2xl bg-white/10' />
          <div className='grid gap-4 lg:grid-cols-3'>
            <div className='skeleton-shimmer h-32 rounded-2xl bg-white/10' />
            <div className='skeleton-shimmer h-32 rounded-2xl bg-white/10' />
            <div className='skeleton-shimmer h-32 rounded-2xl bg-white/10' />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='rounded-3xl border border-red-500/20 bg-red-950/80 p-6 text-red-100'>
        {error.message}
      </div>
    )
  }

  const totalPrompts = prompts.length
  const favoritePrompts = prompts.filter((prompt) => prompt.is_favorite).length
  const latestPromptDate = getLatestPromptDate(prompts)
  const recentPrompts = prompts.slice(0, 3)
  const detailPrompt = prompts.find((prompt) => prompt.id === detailPromptId) ?? null

  const metricCards = [
    {
      label: 'Total prompts',
      value: totalPrompts,
      note: 'Synced from Supabase',
    },
    {
      label: 'Favorites',
      value: favoritePrompts,
      note: 'Pinned prompt assets',
    },
    {
      label: 'Latest update',
      value: latestPromptDate ? new Date(latestPromptDate).toLocaleDateString('en', {
        month: 'short',
        day: 'numeric',
      }) : '-',
      note: latestPromptDate ? 'Most recent prompt activity' : 'No activity yet',
    },
    {
      label: 'Workspace',
      value: 'Live',
      note: 'Protected by auth & RLS',
    },
  ]

  return (
    <div className='space-y-5'>
      <section className='app-surface relative overflow-hidden rounded-xl border border-white/[0.04] p-4 text-white sm:p-6'>
        <div className='relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
          <div className='max-w-2xl'>
            <span className='inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-300 sm:tracking-[0.28em]'>
              <Sparkles className='h-3 w-3 text-violet-300' />
              AI Prompt Workspace
            </span>

            <h2 className='mt-3 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-[28px]'>
              Build, save, and manage your prompt library.
            </h2>

            <p className='mt-2.5 max-w-xl text-[13px] leading-6 text-zinc-400'>
              Mardakhay Labs keeps your prompts organized in a secure cloud workspace
              with fast search, favorites, templates, and portable exports.
            </p>

            <div className='mt-4 flex flex-wrap gap-2'>
              <span className='inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[11px] font-medium text-zinc-400'>
                <Clock3 className='h-3 w-3' />
                Stable sync
              </span>

              <span className='inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[11px] font-medium text-zinc-400'>
                <Wand2 className='h-3 w-3' />
                Prompt tools
              </span>

              <span className='inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[11px] font-medium text-zinc-400'>
                <TerminalSquare className='h-3 w-3' />
                Protected by auth
              </span>
            </div>
          </div>

          <div className='relative grid gap-2.5 sm:flex sm:flex-wrap lg:justify-end'>
            <button
              onClick={() => navigate('/prompts')}
              className='inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-[13px] font-medium text-zinc-200 transition-colors hover:bg-white/[0.05]'
            >
              Open prompt library
              <ArrowRight className='h-3.5 w-3.5' />
            </button>

            <CreatePromptModal
              triggerLabel='New prompt'
              draftKey={buildUserScopedStorageKey('draft:new-dashboard', user?.id)}
              onSave={(input) => createPromptMutation.mutateAsync(input)}
            />
          </div>
        </div>
      </section>

      <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        {metricCards.map((metric) => (
          <DashboardCard key={metric.label} title={metric.label}>
            <p className='text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl'>
              {metric.value}
            </p>
            <p className='mt-1.5 text-[13px] text-zinc-500'>{metric.note}</p>
          </DashboardCard>
        ))}
      </div>

      <div className='grid gap-5 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,0.85fr)]'>
        <DashboardCard title='Recent prompts'>
          {recentPrompts.length === 0 ? (
            <div className='rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] px-5 py-10 text-center text-zinc-500'>
              Your workspace is empty. Create the first prompt to get started.
            </div>
          ) : (
            <div className='space-y-3'>
              {recentPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  compact
                  onOpenDetail={(nextPrompt) => setDetailPromptId(nextPrompt.id)}
                  onEdit={(promptId, input) =>
                    updatePromptMutation.mutate({ promptId, input })
                  }
                  onToggleFavorite={(promptId, isFavorite) =>
                    favoriteMutation.mutate({ promptId, isFavorite })
                  }
                />
              ))}
            </div>
          )}
        </DashboardCard>

        <DashboardCard title='Activity'>
          <div className='space-y-3'>
            <div className='rounded-xl border border-white/[0.04] bg-white/[0.02] p-4'>
              <div className='flex items-center gap-3'>
                <div className='rounded-lg bg-white/[0.04] p-2 text-zinc-400'>
                  <Activity className='h-4 w-4' />
                </div>
                <div>
                  <p className='text-[13px] font-medium text-zinc-200'>Workspace sync</p>
                  <p className='text-[13px] text-zinc-500'>
                    Your prompts are live in Supabase and scoped to your account.
                  </p>
                </div>
              </div>
            </div>

            {activityEntries.length > 0 ? (
              activityEntries.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className='flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3.5'
                >
                  <div className='mt-0.5 rounded-md bg-white/[0.04] p-1.5 text-zinc-400'>
                    <Clock3 className='h-3.5 w-3.5' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-[13px] font-medium text-zinc-200'>{entry.action}</p>
                    <p className='truncate text-[13px] text-zinc-500'>{entry.detail}</p>
                    <p className='mt-1 text-[11px] text-zinc-600'>
                      {new Intl.DateTimeFormat('en', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      }).format(new Date(entry.createdAt))}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className='rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] px-5 py-8 text-[13px] text-zinc-500'>
                Activity appears here after you create, update, favorite, import, export, or delete prompts.
              </div>
            )}
          </div>
        </DashboardCard>
      </div>

      <PromptDetailPanel
        prompt={detailPrompt}
        onClose={() => setDetailPromptId(null)}
        onEdit={(promptId, input) =>
          updatePromptMutation.mutate({ promptId, input })
        }
        onToggleFavorite={(promptId, isFavorite) =>
          favoriteMutation.mutate({ promptId, isFavorite })
        }
      />
    </div>
  )
}

export default DashboardPage
