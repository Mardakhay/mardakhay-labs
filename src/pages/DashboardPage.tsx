import {
  Activity,
  ArrowRight,
  Clock3,
  Sparkles,
  TerminalSquare,
  Wand2,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import CreatePromptModal from '../components/CreatePromptModal'
import DashboardCard from '../components/DashboardCard'
import PromptCard from '../components/PromptCard'
import PromptDetailPanel from '../components/PromptDetailPanel'
import { useActivityLog } from '../hooks/useActivityLog'
import { usePromptMutations } from '../hooks/usePromptMutations'
import { usePromptsQuery } from '../hooks/usePromptsQuery'

function DashboardPage() {
  const navigate = useNavigate()
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
  const latestPrompt = prompts[0]
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
      value: latestPrompt ? 'Fresh' : '-',
      note: latestPrompt
        ? new Date(latestPrompt.created_at).toLocaleDateString('en', {
            month: 'short',
            day: 'numeric',
          })
        : 'No activity yet',
    },
    {
      label: 'Workspace',
      value: 'Live',
      note: 'Protected by auth & RLS',
    },
  ]

  return (
    <div className='space-y-6'>
      <section className='app-surface relative overflow-hidden rounded-2xl border border-white/5 p-4 text-white sm:p-6'>
        <div className='relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
          <div className='max-w-2xl'>
            <span className='inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-violet-100 sm:tracking-[0.28em]'>
              <Sparkles className='h-3.5 w-3.5' />
              AI Prompt Workspace
            </span>

            <h2 className='mt-4 text-2xl font-semibold tracking-tight sm:text-3xl'>
              Build, save, and manage your prompt library.
            </h2>

            <p className='mt-3 max-w-xl text-sm leading-6 text-zinc-300'>
              Mardakhay Labs keeps your prompts organized in a secure cloud workspace
              with fast search, favorites, templates, and portable exports.
            </p>

            <div className='mt-4 flex flex-wrap gap-2'>
              <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300'>
                <Clock3 className='h-3.5 w-3.5' />
                Stable sync
              </span>

              <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300'>
                <Wand2 className='h-3.5 w-3.5' />
                Prompt tools
              </span>

              <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300'>
                <TerminalSquare className='h-3.5 w-3.5' />
                Protected by auth
              </span>
            </div>
          </div>

          <div className='relative grid gap-3 sm:flex sm:flex-wrap lg:justify-end'>
            <button
              onClick={() => navigate('/prompts')}
              className='inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10'
            >
              Open prompt library
              <ArrowRight className='h-4 w-4' />
            </button>

            <CreatePromptModal
              triggerLabel='New prompt'
              draftKey='mardakhay-labs:draft:new-dashboard'
              onSave={(input) => createPromptMutation.mutateAsync(input)}
            />
          </div>
        </div>
      </section>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {metricCards.map((metric) => (
          <DashboardCard key={metric.label} title={metric.label}>
            <p className='text-3xl font-semibold tracking-tight text-white sm:text-4xl'>
              {metric.value}
            </p>
            <p className='mt-2 text-sm text-zinc-400'>{metric.note}</p>
          </DashboardCard>
        ))}
      </div>

      <div className='grid gap-6 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,0.85fr)]'>
        <DashboardCard title='Recent prompts'>
          {recentPrompts.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-zinc-700/60 px-5 py-10 text-center text-zinc-400'>
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
            <div className='rounded-2xl border border-white/5 bg-white/5 p-4'>
              <div className='flex items-center gap-3'>
                <div className='rounded-xl bg-violet-500/15 p-2 text-violet-200'>
                  <Activity className='h-4 w-4' />
                </div>
                <div>
                  <p className='text-sm font-medium'>Workspace sync</p>
                  <p className='text-sm text-zinc-400'>
                    Your prompts are live in Supabase and scoped to your account.
                  </p>
                </div>
              </div>
            </div>

            {activityEntries.length > 0 ? (
              activityEntries.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className='flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 p-4'
                >
                  <div className='mt-0.5 rounded-full bg-violet-500/10 p-2 text-violet-200'>
                    <Clock3 className='h-4 w-4' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium'>{entry.action}</p>
                    <p className='truncate text-sm text-zinc-400'>{entry.detail}</p>
                    <p className='mt-1 text-xs text-zinc-600'>
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
              <div className='rounded-2xl border border-dashed border-zinc-700 px-5 py-8 text-sm text-zinc-400'>
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
