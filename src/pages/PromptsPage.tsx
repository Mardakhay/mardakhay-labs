import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Filter, Plus, Search, ArrowUpDown } from 'lucide-react'

import {
  createPrompt,
  deletePrompt,
  getPrompts,
  togglePromptFavorite,
  updatePrompt,
  type Prompt,
  type PromptInput,
} from '../api/prompts'
import CreatePromptModal from '../components/CreatePromptModal'
import DashboardCard from '../components/DashboardCard'
import DropdownMenu from '../components/DropdownMenu'
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

  async function handleAddPrompt(input: PromptInput) {
    await createPromptMutation.mutateAsync(input)
  }

  function handleUpdatePrompt(promptId: number, input: PromptInput) {
    updatePromptMutation.mutate({ promptId, input })
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
      const combinedText = `${prompt.title}\n${prompt.content}`.toLowerCase()
      const matchesSearch = !normalizedQuery || combinedText.includes(normalizedQuery)
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
      <section className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-5 lg:flex-row lg:items-end lg:justify-between'>
        <div className='max-w-2xl'>
          <p className='text-xs uppercase tracking-[0.28em] text-zinc-500'>
            Workspace tools
          </p>
          <h3 className='mt-2 text-2xl font-semibold tracking-tight sm:text-3xl'>
            Prompt library
          </h3>
          <p className='mt-2 text-sm leading-6 text-zinc-400'>
            Search, edit, favorite, and organize your AI prompts in one place.
          </p>
        </div>

        <CreatePromptModal triggerLabel='New prompt' onSave={handleAddPrompt} />
      </section>

      <div className='grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,0.85fr)_minmax(0,0.85fr)]'>
        <label className='flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-white'>
          <Search className='h-4 w-4 shrink-0 text-zinc-500' />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder='Search prompts...'
            className='w-full bg-transparent text-sm outline-none placeholder:text-zinc-500'
          />
        </label>

        <DropdownMenu
          icon={Filter}
          label='Filter prompts'
          value={viewFilter}
          onChange={setViewFilter}
          items={[
            {
              value: 'all',
              label: 'All prompts',
              description: 'Show every prompt in the library.',
            },
            {
              value: 'favorites',
              label: 'Favorites only',
              description: 'Show only starred prompts.',
            },
          ]}
        />

        <DropdownMenu
          icon={ArrowUpDown}
          label='Sort prompts'
          value={sortOrder}
          onChange={setSortOrder}
          items={[
            {
              value: 'recent',
              label: 'Most recent',
              description: 'Show the newest prompts first.',
            },
            {
              value: 'oldest',
              label: 'Oldest first',
              description: 'Show the earliest prompts first.',
            },
          ]}
        />
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
