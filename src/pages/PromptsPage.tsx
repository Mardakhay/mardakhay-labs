import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowUpDown, Filter, Search, Plus } from 'lucide-react'

import {
  createPrompt,
  deletePrompt,
  getPrompts,
  togglePromptFavorite,
  updatePrompt,
  type Prompt,
} from '../api/prompts'
import CreatePromptModal from '../components/CreatePromptModal'
import DashboardCard from '../components/DashboardCard'
import PromptCard from '../components/PromptCard'
import { useNotificationStore } from '../stores/notificationStore'

type SortOrder = 'recent' | 'oldest'
type ViewFilter = 'all' | 'favorites'

function PromptsPage() {
  const { showNotification } = useNotificationStore()
  const queryClient = useQueryClient()

  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent')
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all')

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

  const deletePromptMutation = useMutation({
    mutationFn: deletePrompt,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['prompts'] })
      showNotification('Prompt deleted successfully!', 'success')
    },
    onError: (mutationError: Error) => {
      showNotification(mutationError.message || 'Failed to delete prompt.', 'error')
    },
  })

  const favoriteMutation = useMutation({
    mutationFn: ({
      promptId,
      isFavorite,
    }: {
      promptId: number
      isFavorite: boolean
    }) => togglePromptFavorite(promptId, isFavorite),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['prompts'] })
      showNotification('Prompt favorites updated.', 'success')
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

  function handleDeletePrompt(promptId: number) {
    deletePromptMutation.mutate(promptId)
  }

  function handleToggleFavorite(promptId: number, isFavorite: boolean) {
    favoriteMutation.mutate({ promptId, isFavorite })
  }

  const filteredPrompts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const filtered = prompts.filter((prompt) => {
      const matchesSearch =
        !normalizedQuery || prompt.content.toLowerCase().includes(normalizedQuery)

      const matchesView =
        viewFilter === 'all' || (viewFilter === 'favorites' && prompt.is_favorite)

      return matchesSearch && matchesView
    })

    return [...filtered].sort((a, b) => {
      const aDate = new Date(a.created_at).getTime()
      const bDate = new Date(b.created_at).getTime()

      return sortOrder === 'recent' ? bDate - aDate : aDate - bDate
    })
  }, [prompts, searchQuery, sortOrder, viewFilter])

  if (isLoading) {
    return (
      <DashboardCard title='Loading prompts'>
        <div className='space-y-4'>
          <div className='h-12 rounded-2xl bg-white/5 animate-pulse' />
          <div className='grid gap-4 lg:grid-cols-2'>
            <div className='h-56 rounded-3xl bg-white/5 animate-pulse' />
            <div className='h-56 rounded-3xl bg-white/5 animate-pulse' />
          </div>
        </div>
      </DashboardCard>
    )
  }

  if (error) {
    return (
      <div className='rounded-3xl border border-red-500/20 bg-red-950/80 p-6 text-red-100'>
        {error.message}
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <DashboardCard title='Prompt library'>
        <div className='flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between'>
          <div className='max-w-2xl'>
            <p className='text-sm uppercase tracking-[0.28em] text-zinc-500'>
              Workspace tools
            </p>
            <h3 className='mt-2 text-2xl font-semibold tracking-tight sm:text-3xl'>
              Manage your prompt assets with search, filters, and favorites.
            </h3>
            <p className='mt-2 text-sm leading-6 text-zinc-400'>
              Build a reusable prompt library for workflows, experiments, and AI output
              that stays in sync with your Supabase data layer.
            </p>
          </div>

          <CreatePromptModal triggerLabel='New prompt' onAddPrompt={handleAddPrompt} />
        </div>
      </DashboardCard>

      <div className='grid gap-4 lg:grid-cols-[1.4fr_auto_auto]'>
        <label className='flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 text-white'>
          <Search className='h-4 w-4 shrink-0 text-zinc-500' />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder='Search prompts...'
            className='w-full bg-transparent text-sm outline-none placeholder:text-zinc-500'
          />
        </label>

        <div className='flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 text-white'>
          <Filter className='h-4 w-4 shrink-0 text-zinc-500' />
          <select
            value={viewFilter}
            onChange={(event) => setViewFilter(event.target.value as ViewFilter)}
            className='bg-transparent text-sm outline-none'
          >
            <option value='all'>All prompts</option>
            <option value='favorites'>Favorites</option>
          </select>
        </div>

        <div className='flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 text-white'>
          <ArrowUpDown className='h-4 w-4 shrink-0 text-zinc-500' />
          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            className='bg-transparent text-sm outline-none'
          >
            <option value='recent'>Most recent</option>
            <option value='oldest'>Oldest first</option>
          </select>
        </div>
      </div>

      <DashboardCard title={`Prompts (${filteredPrompts.length})`}>
        {filteredPrompts.length === 0 ? (
          <div className='rounded-2xl border border-dashed border-zinc-700 px-6 py-12 text-center text-zinc-400'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-200'>
              <Plus className='h-5 w-5' />
            </div>
            <p className='text-base font-medium text-inherit'>
              No prompts match your current search.
            </p>
            <p className='mt-2 text-sm text-inherit'>
              Clear the filters or create a new prompt to populate the library.
            </p>
          </div>
        ) : (
          <div className='grid gap-4 xl:grid-cols-2'>
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onDelete={handleDeletePrompt}
                onEdit={handleUpdatePrompt}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  )
}

export default PromptsPage
