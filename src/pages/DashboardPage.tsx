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

import { createPrompt, getPrompts, type Prompt, updatePrompt } from '../api/prompts'
import CreatePromptModal from '../components/CreatePromptModal'
import DashboardCard from '../components/DashboardCard'
import PromptCard from '../components/PromptCard'
import { useNotificationStore } from '../stores/notificationStore'

function DashboardPage() {
  const navigate = useNavigate()
  const isDark = true
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
    mutationFn: ({ promptId, content }: { promptId: number; content: string }) =>
      updatePrompt(promptId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['prompts'] })
      showNotification('Prompt updated successfully!', 'success')
    },
    onError: (mutationError: Error) => {
      showNotification(mutationError.message || 'Failed to update prompt.', 'error')
    },
  })

  async function handleAddPrompt(prompt: string) {
    await createPromptMutation.mutateAsync(prompt)
  }

  function handleUpdatePrompt(promptId: number, content: string) {
    updatePromptMutation.mutate({ promptId, content })
  }

  if (isLoading) {
    return (
      <div
        className={`rounded-3xl border p-8 ${
          isDark
            ? 'border-zinc-800 bg-zinc-950/80 text-white'
            : 'border-zinc-200 bg-white text-zinc-950 shadow-sm'
        }`}
      >
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
      <section
        className={`relative overflow-hidden rounded-3xl border p-6 ${
          isDark
            ? 'border-white/5 bg-gradient-to-br from-zinc-950 via-zinc-950 to-violet-950/20 text-white shadow-2xl shadow-black/30'
            : 'border-zinc-200 bg-gradient-to-br from-white via-white to-violet-50/70 text-zinc-950 shadow-xl shadow-zinc-950/5'
        }`}
      >
        <div className='absolute inset-0 opacity-50'>
          <div className='absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl' />
          <div className='absolute bottom-0 left-1/2 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl' />
        </div>

        <div className='relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
          <div className='max-w-2xl'>
            <span className='inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-violet-100'>
              <Sparkles className='h-3.5 w-3.5' />
              AI Prompt Workspace
            </span>

            <h2 className='mt-4 text-3xl font-semibold tracking-tight sm:text-4xl'>
              Build, save, and manage your prompt library.
            </h2>

            <p className={`mt-3 max-w-xl text-sm leading-6 sm:text-base ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
              Mardakhay Labs keeps your prompts organized in a secure cloud workspace
              with fast search, favorites, and a clean AI-first dashboard.
            </p>

            <div className='mt-5 flex flex-wrap gap-2'>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-zinc-300'
                    : 'border-zinc-200 bg-white text-zinc-600'
                }`}
              >
                <Clock3 className='h-3.5 w-3.5' />
                Real-time ready
              </span>

              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-zinc-300'
                    : 'border-zinc-200 bg-white text-zinc-600'
                }`}
              >
                <Wand2 className='h-3.5 w-3.5' />
                Prompt generation flow
              </span>

              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-zinc-300'
                    : 'border-zinc-200 bg-white text-zinc-600'
                }`}
              >
                <TerminalSquare className='h-3.5 w-3.5' />
                Protected by auth
              </span>
            </div>
          </div>

          <div className='relative flex flex-wrap gap-3'>
            <button
              onClick={() => navigate('/prompts')}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                isDark
                  ? 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                  : 'border border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              Open prompt library
              <ArrowRight className='h-4 w-4' />
            </button>

            <CreatePromptModal
              triggerLabel='New prompt'
              onAddPrompt={handleAddPrompt}
            />
          </div>
        </div>
      </section>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {metricCards.map((metric) => (
          <DashboardCard key={metric.label} title={metric.label}>
            <p className={`text-4xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              {metric.value}
            </p>
            <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {metric.note}
            </p>
          </DashboardCard>
        ))}
      </div>

      <div className='grid gap-6 lg:grid-cols-[1.7fr_1fr]'>
        <DashboardCard title='Recent prompts'>
          {recentPrompts.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-zinc-700/60 px-5 py-10 text-center text-zinc-400'>
              Your workspace is empty. Create the first prompt to get started.
            </div>
          ) : (
            <div className='space-y-4'>
              {recentPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} compact onEdit={handleUpdatePrompt} />
              ))}
            </div>
          )}
        </DashboardCard>

        <DashboardCard title='Activity'>
          <div className='space-y-4'>
            <div className={`rounded-2xl border p-4 ${isDark ? 'border-white/5 bg-white/5' : 'border-zinc-200 bg-zinc-50'}`}>
              <div className='flex items-center gap-3'>
                <div className='rounded-xl bg-violet-500/15 p-2 text-violet-200'>
                  <Activity className='h-4 w-4' />
                </div>
                <div>
                  <p className='text-sm font-medium'>Workspace sync</p>
                  <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Your prompts are live in Supabase and scoped to your account.
                  </p>
                </div>
              </div>
            </div>

            {recentPrompts.length > 0 ? (
              recentPrompts.map((prompt, index) => (
                <div
                  key={prompt.id}
                  className={`flex items-start gap-3 rounded-2xl border p-4 ${
                    isDark ? 'border-white/5 bg-white/5' : 'border-zinc-200 bg-zinc-50'
                  }`}
                >
                  <div className='mt-0.5 rounded-full bg-violet-500/10 p-2 text-violet-200'>
                    <Clock3 className='h-4 w-4' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium'>
                      {index === 0 ? 'Latest prompt saved' : 'Prompt stored'}
                    </p>
                    <p className={`truncate text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {prompt.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className={`rounded-2xl border border-dashed px-5 py-8 text-sm ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>
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
