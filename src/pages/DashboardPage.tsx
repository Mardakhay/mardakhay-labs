import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Activity,
  ArrowRight,
  Clock3,
  Sparkles,
  TerminalSquare,
  Wand2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import {
  createPrompt,
  getPrompts,
  togglePromptFavorite,
  type Prompt,
  type PromptInput,
  updatePrompt,
} from '../api/prompts'
import CreatePromptModal from '../components/CreatePromptModal'
import DashboardCard from '../components/DashboardCard'
import PromptCard from '../components/PromptCard'
import { togglePromptFavoriteInList } from '../lib/promptCache'
import { useNotificationStore } from '../stores/notificationStore'

type PromptCacheContext = {
  previousPrompts?: Prompt[]
}

function DashboardPage() {
  const navigate = useNavigate()
  const { showNotification } = useNotificationStore()
  const queryClient = useQueryClient()

  const {
    data: prompts = [],
    isLoading,
    error,
  } = useQuery<Prompt[], Error>({
    queryKey: ['prompts'],
    queryFn: getPrompts,
  })

  const createPromptMutation = useMutation({
    mutationFn: createPrompt,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['prompts'] })
      showNotification('Prompt added successfully!', 'success')
    },
    onError: (mutationError: Error) => {
      showNotification(mutationError.message || 'Failed to create prompt.', 'error')
    },
  })

  const updatePromptMutation = useMutation({
    mutationFn: ({ promptId, input }: { promptId: number; input: PromptInput }) =>
      updatePrompt(promptId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['prompts'] })
      showNotification('Prompt updated successfully!', 'success')
    },
    onError: (mutationError: Error) => {
      showNotification(mutationError.message || 'Failed to update prompt.', 'error')
    },
  })

  const favoriteMutation = useMutation<
    Prompt,
    Error,
    { promptId: number; isFavorite: boolean },
    PromptCacheContext
  >({
    mutationFn: ({ promptId, isFavorite }) => togglePromptFavorite(promptId, isFavorite),
    onMutate: async ({ promptId }) => {
      await queryClient.cancelQueries({ queryKey: ['prompts'] })
      const previousPrompts = queryClient.getQueryData<Prompt[]>(['prompts'])

      queryClient.setQueryData<Prompt[]>(['prompts'], (current) =>
        togglePromptFavoriteInList(current, promptId)
      )

      return { previousPrompts }
    },
    onError: (mutationError: Error, _variables, context) => {
      if (context?.previousPrompts) {
        queryClient.setQueryData(['prompts'], context.previousPrompts)
      }

      showNotification(mutationError.message || 'Failed to update prompt.', 'error')
    },
    onSuccess: () => {
      showNotification('Prompt favorites updated.', 'success')
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['prompts'] })
    },
  })

  async function handleAddPrompt(input: PromptInput) {
    await createPromptMutation.mutateAsync(input)
  }

  function handleUpdatePrompt(promptId: number, input: PromptInput) {
    updatePromptMutation.mutate({ promptId, input })
  }

  function handleToggleFavorite(promptId: number, isFavorite: boolean) {
    favoriteMutation.mutate({ promptId, isFavorite })
  }

  if (isLoading) {
    return (
      <div className='rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8 text-white'>
        <div className='animate-pulse space-y-4'>
          <div className='h-6 w-40 rounded-full bg-white/10' />
          <div className='h-10 w-72 rounded-2xl bg-white/10' />
          <div className='grid gap-4 lg:grid-cols-3'>
            <div className='h-32 rounded-2xl bg-white/10' />
            <div className='h-32 rounded-2xl bg-white/10' />
            <div className='h-32 rounded-2xl bg-white/10' />
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
      value: latestPrompt ? 'Fresh' : '—',
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
      <section className='relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-zinc-950 via-zinc-950 to-violet-950/10 p-4 text-white shadow-sm sm:p-6'>
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
              with fast search, favorites, and a calm product-first dashboard.
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

            <CreatePromptModal triggerLabel='New prompt' onSave={handleAddPrompt} />
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
                  onEdit={handleUpdatePrompt}
                  onToggleFavorite={handleToggleFavorite}
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

            {recentPrompts.length > 0 ? (
              recentPrompts.map((prompt, index) => (
                <div
                  key={prompt.id}
                  className='flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 p-4'
                >
                  <div className='mt-0.5 rounded-full bg-violet-500/10 p-2 text-violet-200'>
                    <Clock3 className='h-4 w-4' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium'>
                      {index === 0 ? 'Latest prompt saved' : 'Prompt stored'}
                    </p>
                    <p className='truncate text-sm text-zinc-400'>
                      {prompt.title.trim() || prompt.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className='rounded-2xl border border-dashed border-zinc-700 px-5 py-8 text-sm text-zinc-400'>
                No activity yet. Add prompts to populate this section.
              </div>
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  )
}

export default DashboardPage
