import { useMemo, useState } from 'react'
import { ArrowUpDown, Bot, Boxes, Filter, Plus, Search, Tag } from 'lucide-react'

import CreatePromptModal from '../components/CreatePromptModal'
import DashboardCard from '../components/DashboardCard'
import DropdownMenu from '../components/DropdownMenu'
import PromptCard from '../components/PromptCard'
import { usePromptMutations } from '../hooks/usePromptMutations'
import { usePromptsQuery } from '../hooks/usePromptsQuery'
import {
  aiTargetOptions,
  promptCategoryOptions,
  type AiTarget,
  type PromptCategory,
} from '../lib/promptMetadata'

type SortOrder = 'recent' | 'oldest'
type ViewFilter = 'all' | 'favorites'
type AiTargetFilter = 'all' | AiTarget
type CategoryFilter = 'all' | PromptCategory

function PromptsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent')
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all')
  const [aiTargetFilter, setAiTargetFilter] = useState<AiTargetFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [hashtagFilter, setHashtagFilter] = useState('all')

  const {
    createPromptMutation,
    updatePromptMutation,
    deletePromptMutation,
    favoriteMutation,
  } = usePromptMutations()

  const {
    data: prompts = [],
    isLoading,
    error,
  } = usePromptsQuery()

  const filteredPrompts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const filtered = prompts.filter((prompt) => {
      const combinedText = [
        prompt.title,
        prompt.content,
        prompt.ai_target,
        prompt.category,
        ...prompt.hashtags.map((tag) => `#${tag}`),
      ]
        .filter(Boolean)
        .join('\n')
        .toLowerCase()
      const matchesSearch = !normalizedQuery || combinedText.includes(normalizedQuery)
      const matchesView =
        viewFilter === 'all' || (viewFilter === 'favorites' && prompt.is_favorite)
      const matchesAiTarget =
        aiTargetFilter === 'all' || prompt.ai_target === aiTargetFilter
      const matchesCategory =
        categoryFilter === 'all' || prompt.category === categoryFilter
      const matchesHashtag =
        hashtagFilter === 'all' || prompt.hashtags.includes(hashtagFilter)

      return (
        matchesSearch &&
        matchesView &&
        matchesAiTarget &&
        matchesCategory &&
        matchesHashtag
      )
    })

    return [...filtered].sort((a, b) => {
      const aDate = new Date(a.created_at).getTime()
      const bDate = new Date(b.created_at).getTime()

      return sortOrder === 'recent' ? bDate - aDate : aDate - bDate
    })
  }, [
    aiTargetFilter,
    categoryFilter,
    hashtagFilter,
    prompts,
    searchQuery,
    sortOrder,
    viewFilter,
  ])

  const availableHashtags = useMemo(() => {
    return Array.from(
      new Set(prompts.flatMap((prompt) => prompt.hashtags))
    ).sort((a, b) => a.localeCompare(b))
  }, [prompts])

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
      <section className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between'>
        <div className='max-w-2xl'>
          <p className='text-xs uppercase tracking-[0.22em] text-zinc-500 sm:tracking-[0.28em]'>
            Workspace tools
          </p>
          <h3 className='mt-2 text-2xl font-semibold tracking-tight sm:text-3xl'>
            Prompt library
          </h3>
          <p className='mt-2 text-sm leading-6 text-zinc-400'>
            Search, edit, favorite, and organize your AI prompts in one place.
          </p>
        </div>

        <CreatePromptModal
          triggerLabel='New prompt'
          onSave={(input) => createPromptMutation.mutateAsync(input)}
        />
      </section>

      <div className='grid gap-3 lg:grid-cols-[minmax(0,1.8fr)_repeat(4,minmax(0,0.85fr))]'>
        <label className='flex min-h-12 items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-white'>
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
          icon={Bot}
          label='AI target'
          value={aiTargetFilter}
          onChange={setAiTargetFilter}
          items={[
            {
              value: 'all',
              label: 'All targets',
              description: 'Show prompts for every AI target.',
            },
            ...aiTargetOptions.map((option) => ({
              value: option,
              label: option,
              description: `Prompts intended for ${option}.`,
            })),
          ]}
        />

        <DropdownMenu
          icon={Boxes}
          label='Category'
          value={categoryFilter}
          onChange={setCategoryFilter}
          items={[
            {
              value: 'all',
              label: 'All categories',
              description: 'Show prompts from every category.',
            },
            ...promptCategoryOptions.map((option) => ({
              value: option,
              label: option,
              description: `${option} prompts.`,
            })),
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

      {availableHashtags.length > 0 ? (
        <div className='flex gap-2 overflow-x-auto pb-1'>
          <button
            type='button'
            onClick={() => setHashtagFilter('all')}
            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors ${
              hashtagFilter === 'all'
                ? 'border-violet-500/30 bg-violet-500/10 text-violet-100'
                : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white'
            }`}
          >
            <Tag className='h-3.5 w-3.5' />
            All tags
          </button>

          {availableHashtags.map((tag) => (
            <button
              key={tag}
              type='button'
              onClick={() => setHashtagFilter(tag)}
              className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors ${
                hashtagFilter === tag
                  ? 'border-violet-500/30 bg-violet-500/10 text-violet-100'
                  : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      ) : null}

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
                onDelete={(promptId) => deletePromptMutation.mutate(promptId)}
                onEdit={(promptId, input) =>
                  updatePromptMutation.mutate({ promptId, input })
                }
                onToggleFavorite={(promptId, isFavorite) =>
                  favoriteMutation.mutate({ promptId, isFavorite })
                }
                isDeleting={deletePromptMutation.isPending}
              />
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  )
}

export default PromptsPage
