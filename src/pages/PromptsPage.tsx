import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowUpDown, Bot, Boxes, Download, ListFilter as Filter, File as FileJson, FileText, Plus, Search, Star, Tag, Trash2, Upload } from 'lucide-react'

import type { Prompt } from '../api/prompts'
import CreatePromptModal from '../components/CreatePromptModal'
import DashboardCard from '../components/DashboardCard'
import DropdownMenu from '../components/DropdownMenu'
import PromptCard from '../components/PromptCard'
import PromptDetailPanel from '../components/PromptDetailPanel'
import { usePromptMutations } from '../hooks/usePromptMutations'
import { usePromptsQuery } from '../hooks/usePromptsQuery'
import { addActivity } from '../lib/activityLog'
import {
  downloadTextFile,
  parsePromptImport,
  promptsToJson,
  promptsToMarkdown,
} from '../lib/promptExport'
import {
  aiTargetOptions,
  promptCategoryOptions,
  type AiTarget,
  type PromptCategory,
} from '../lib/promptMetadata'
import { useNotificationStore } from '../stores/notificationStore'

type SortOrder = 'recent' | 'oldest'
type ViewFilter = 'all' | 'favorites'
type AiTargetFilter = 'all' | AiTarget
type CategoryFilter = 'all' | PromptCategory

function replaceHashtag(content: string, fromTag: string, toTag: string) {
  const escapedTag = fromTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`(^|\\s)#${escapedTag}\\b`, 'gi')
  return content.replace(pattern, (_match, prefix: string) => `${prefix}#${toTag}`)
}

function PromptsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { showNotification } = useNotificationStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent')
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all')
  const [aiTargetFilter, setAiTargetFilter] = useState<AiTargetFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [hashtagFilter, setHashtagFilter] = useState('all')
  const [selectedPromptIds, setSelectedPromptIds] = useState<number[]>([])
  const [localDetailPromptId, setLocalDetailPromptId] = useState<number | null>(null)
  const [bulkCategory, setBulkCategory] = useState<PromptCategory | 'none'>('none')
  const [renameTagFrom, setRenameTagFrom] = useState('')
  const [renameTagTo, setRenameTagTo] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

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

  const urlDetailId = (() => {
    const id = Number(searchParams.get('prompt'))
    return Number.isFinite(id) && id > 0 ? id : null
  })()
  const detailPromptId = urlDetailId ?? localDetailPromptId

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === '/' && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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

  const tagCounts = useMemo(() => {
    return availableHashtags.map((tag) => ({
      tag,
      count: prompts.filter((prompt) => prompt.hashtags.includes(tag)).length,
    }))
  }, [availableHashtags, prompts])

  const selectedPrompts = useMemo(() => {
    return prompts.filter((prompt) => selectedPromptIds.includes(prompt.id))
  }, [prompts, selectedPromptIds])

  const detailPrompt = prompts.find((prompt) => prompt.id === detailPromptId) ?? null
  const allFilteredSelected =
    filteredPrompts.length > 0 &&
    filteredPrompts.every((prompt) => selectedPromptIds.includes(prompt.id))

  function toggleSelectPrompt(promptId: number, selected: boolean) {
    setSelectedPromptIds((current) =>
      selected
        ? Array.from(new Set([...current, promptId]))
        : current.filter((id) => id !== promptId)
    )
  }

  function toggleSelectAll() {
    setSelectedPromptIds((current) => {
      if (allFilteredSelected) {
        return current.filter((id) => !filteredPrompts.some((prompt) => prompt.id === id))
      }

      return Array.from(new Set([...current, ...filteredPrompts.map((prompt) => prompt.id)]))
    })
  }

  function clearFilters() {
    setSearchQuery('')
    setViewFilter('all')
    setAiTargetFilter('all')
    setCategoryFilter('all')
    setHashtagFilter('all')
  }

  function closeDetail() {
    setLocalDetailPromptId(null)
    setSearchParams({})
  }

  async function importPrompts(file: File) {
    const raw = await file.text()
    const promptInputs = parsePromptImport(raw)

    for (const input of promptInputs) {
      await createPromptMutation.mutateAsync(input)
    }

    addActivity('Imported prompts', `${promptInputs.length} prompt${promptInputs.length === 1 ? '' : 's'}`)
    showNotification(`Imported ${promptInputs.length} prompt${promptInputs.length === 1 ? '' : 's'}.`, 'success')
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      await importPrompts(file)
    } catch (importError) {
      showNotification(
        importError instanceof Error ? importError.message : 'Failed to import prompts.',
        'error'
      )
    }
  }

  function exportPrompts(format: 'json' | 'markdown', promptsToExport: Prompt[]) {
    if (promptsToExport.length === 0) {
      showNotification('Select at least one prompt to export.', 'info')
      return
    }

    if (format === 'json') {
      downloadTextFile('mardakhay-prompts.json', promptsToJson(promptsToExport), 'application/json')
    } else {
      downloadTextFile('mardakhay-prompts.md', promptsToMarkdown(promptsToExport), 'text/markdown')
    }

    addActivity('Exported prompts', `${promptsToExport.length} prompt${promptsToExport.length === 1 ? '' : 's'}`)
  }

  function bulkFavorite() {
    selectedPrompts
      .filter((prompt) => !prompt.is_favorite)
      .forEach((prompt) => favoriteMutation.mutate({ promptId: prompt.id, isFavorite: false }))
    setSelectedPromptIds([])
  }

  function bulkDelete() {
    selectedPrompts.forEach((prompt) => deletePromptMutation.mutate(prompt.id))
    setSelectedPromptIds([])
  }

  function applyBulkCategory() {
    selectedPrompts.forEach((prompt) => {
      updatePromptMutation.mutate({
        promptId: prompt.id,
        input: {
          title: prompt.title,
          content: prompt.content,
          aiTarget: prompt.ai_target,
          category: bulkCategory === 'none' ? undefined : bulkCategory,
        },
      })
    })
    setSelectedPromptIds([])
  }

  function renameTag() {
    const fromTag = renameTagFrom.trim().replace(/^#/, '').toLowerCase()
    const toTag = renameTagTo.trim().replace(/^#/, '').toLowerCase()

    if (!fromTag || !toTag || fromTag === toTag) {
      showNotification('Enter two different tags to rename.', 'info')
      return
    }

    const affectedPrompts = prompts.filter((prompt) => prompt.hashtags.includes(fromTag))

    if (affectedPrompts.length === 0) {
      showNotification(`No prompts contain #${fromTag}.`, 'info')
      return
    }

    affectedPrompts.forEach((prompt) => {
      updatePromptMutation.mutate({
        promptId: prompt.id,
        input: {
          title: prompt.title,
          content: replaceHashtag(prompt.content, fromTag, toTag),
          aiTarget: prompt.ai_target,
          category: prompt.category,
        },
      })
    })

    setRenameTagFrom('')
    setRenameTagTo('')
    addActivity('Renamed tag', `#${fromTag} to #${toTag}`)
    showNotification(`Renamed #${fromTag} in ${affectedPrompts.length} prompt${affectedPrompts.length === 1 ? '' : 's'}.`, 'success')
  }

  if (isLoading) {
    return (
      <DashboardCard title='Loading prompts'>
        <div className='space-y-4'>
          <div className='skeleton-shimmer h-12 rounded-2xl bg-white/5' />
          <div className='grid gap-4 lg:grid-cols-2'>
            <div className='skeleton-shimmer h-56 rounded-3xl bg-white/5' />
            <div className='skeleton-shimmer h-56 rounded-3xl bg-white/5' />
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
      <section className='app-surface flex flex-col gap-4 rounded-xl border border-white/[0.04] p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between'>
        <div className='max-w-2xl'>
          <p className='text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500 sm:tracking-[0.28em]'>
            Workspace tools
          </p>
          <h3 className='mt-2 text-xl font-semibold tracking-tight text-zinc-100 sm:text-[22px]'>
            Prompt library
          </h3>
          <p className='mt-2 text-[13px] leading-6 text-zinc-400'>
            Search, edit, favorite, organize, import, and export your AI prompts.
          </p>
        </div>

        <div className='grid gap-2 sm:flex'>
          <button
            type='button'
            onClick={() => fileInputRef.current?.click()}
            className='inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 text-[13px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white'
          >
            <Upload className='h-3.5 w-3.5' />
            Import
          </button>
          <button
            type='button'
            onClick={() => exportPrompts('json', filteredPrompts)}
            className='inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 text-[13px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white'
          >
            <Download className='h-3.5 w-3.5' />
            Export all
          </button>
          <CreatePromptModal
            triggerLabel='New prompt'
            draftKey='mardakhay-labs:draft:new-library'
            onSave={(input) => createPromptMutation.mutateAsync(input)}
          />
        </div>
        <input
          ref={fileInputRef}
          type='file'
          accept='application/json,.json'
          onChange={(event) => void handleImportFile(event)}
          className='hidden'
        />
      </section>

      <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.8fr)_repeat(4,minmax(0,0.85fr))]'>
        <label className='flex min-h-10 items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 text-white sm:col-span-2 lg:col-span-1'>
          <Search className='h-3.5 w-3.5 shrink-0 text-zinc-500' />
          <input
            ref={searchInputRef}
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

          {tagCounts.map(({ tag, count }) => (
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
              <span className='text-zinc-500'>{count}</span>
            </button>
          ))}
        </div>
      ) : null}

      <DashboardCard title='Bulk actions'>
        <div className='grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center'>
          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={toggleSelectAll}
              className='min-h-10 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-white transition-colors hover:bg-zinc-800'
            >
              {allFilteredSelected ? 'Clear visible' : 'Select visible'}
            </button>
            <button
              type='button'
              onClick={bulkFavorite}
              disabled={selectedPrompts.length === 0}
              className='inline-flex min-h-10 items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 text-sm text-violet-100 transition-colors hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <Star className='h-4 w-4' />
              Favorite
            </button>
            <button
              type='button'
              onClick={bulkDelete}
              disabled={selectedPrompts.length === 0}
              className='inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 text-sm text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <Trash2 className='h-4 w-4' />
              Delete
            </button>
            <button
              type='button'
              onClick={() => exportPrompts('json', selectedPrompts)}
              disabled={selectedPrompts.length === 0}
              className='inline-flex min-h-10 items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <FileJson className='h-4 w-4' />
              JSON
            </button>
            <button
              type='button'
              onClick={() => exportPrompts('markdown', selectedPrompts)}
              disabled={selectedPrompts.length === 0}
              className='inline-flex min-h-10 items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <FileText className='h-4 w-4' />
              Markdown
            </button>
          </div>

          <div className='flex flex-wrap gap-2'>
            <DropdownMenu
              icon={Boxes}
              label='Bulk category'
              value={bulkCategory}
              onChange={setBulkCategory}
              className='min-w-48'
              items={[
                { value: 'none', label: 'No category', description: 'Clear category.' },
                ...promptCategoryOptions.map((option) => ({ value: option, label: option })),
              ]}
            />
            <button
              type='button'
              onClick={applyBulkCategory}
              disabled={selectedPrompts.length === 0}
              className='min-h-12 rounded-xl bg-white px-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50'
            >
              Apply
            </button>
          </div>
        </div>
        <p className='mt-3 text-xs uppercase tracking-[0.22em] text-zinc-500'>
          {selectedPrompts.length} selected
        </p>
      </DashboardCard>

      <DashboardCard title='Tag management'>
        <div className='grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]'>
          <input
            value={renameTagFrom}
            onChange={(event) => setRenameTagFrom(event.target.value)}
            placeholder='Old tag'
            className='min-h-12 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 text-sm outline-none placeholder:text-zinc-500 focus:border-violet-500'
          />
          <input
            value={renameTagTo}
            onChange={(event) => setRenameTagTo(event.target.value)}
            placeholder='New tag'
            className='min-h-12 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 text-sm outline-none placeholder:text-zinc-500 focus:border-violet-500'
          />
          <button
            type='button'
            onClick={renameTag}
            className='min-h-12 rounded-xl bg-white px-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200'
          >
            Rename tag
          </button>
        </div>
      </DashboardCard>

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
            <button
              type='button'
              onClick={clearFilters}
              className='mt-4 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-800'
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className='grid gap-4 xl:grid-cols-2'>
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                selectable
                selected={selectedPromptIds.includes(prompt.id)}
                onSelectChange={toggleSelectPrompt}
                searchQuery={searchQuery}
                onOpenDetail={(nextPrompt) => {
                  setLocalDetailPromptId(nextPrompt.id)
                  setSearchParams({ prompt: String(nextPrompt.id) })
                }}
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

      <PromptDetailPanel
        prompt={detailPrompt}
        searchQuery={searchQuery}
        onClose={closeDetail}
        onEdit={(promptId, input) => updatePromptMutation.mutate({ promptId, input })}
        onToggleFavorite={(promptId, isFavorite) => favoriteMutation.mutate({ promptId, isFavorite })}
      />
    </div>
  )
}

export default PromptsPage
