import { useEffect, useRef, useState } from 'react'
import {
  Bot,
  Boxes,
  CalendarDays,
  Check,
  Clipboard,
  Hash,
  Maximize2,
  Star,
  StarOff,
  Tag,
  Trash2,
} from 'lucide-react'

import type { Prompt, PromptInput } from '../api/prompts'
import { countPromptWords, derivePromptTitle, formatPromptPreview } from '../lib/promptFormatting'
import { copyText } from '../lib/promptExport'
import ConfirmModal from './ConfirmModal'
import CreatePromptModal from './CreatePromptModal'
import HighlightedText from './HighlightedText'

type PromptCardProps = {
  prompt: Prompt
  onDelete?: (promptId: number) => void
  onToggleFavorite?: (promptId: number, isFavorite: boolean) => void
  onEdit?: (promptId: number, input: PromptInput) => void | Promise<void>
  onOpenDetail?: (prompt: Prompt) => void
  selectable?: boolean
  selected?: boolean
  onSelectChange?: (promptId: number, selected: boolean) => void
  searchQuery?: string
  isDeleting?: boolean
  compact?: boolean
}

function PromptCard({
  prompt,
  onDelete,
  onToggleFavorite,
  onEdit,
  onOpenDetail,
  selectable = false,
  selected = false,
  onSelectChange,
  searchQuery = '',
  isDeleting = false,
  compact = false,
}: PromptCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  const promptTitle = prompt.title.trim() || derivePromptTitle(prompt.content)
  const promptPreview = formatPromptPreview(prompt.content, compact ? 88 : 190)
  const wordCount = countPromptWords(prompt.content)
  const createdLabel = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: compact ? undefined : 'short',
  }).format(new Date(prompt.created_at))

  function openEditor() {
    if (!onEdit) return
    setShowEditor(true)
  }

  async function handleCopy() {
    await copyText(prompt.content)
    setCopied(true)

    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current)
    }

    copyTimeoutRef.current = window.setTimeout(() => {
      setCopied(false)
    }, 1600)
  }

  return (
    <>
      <article
        className={`app-surface group rounded-2xl border border-zinc-800/80 text-white transition-all duration-200 hover:-translate-y-0.5 ${compact ? 'p-4' : 'p-4 sm:p-5'} ${prompt.is_favorite ? 'ring-1 ring-violet-500/20' : ''} ${selected ? 'border-violet-500/40 ring-1 ring-violet-500/30' : ''}`}
      >
        <div className='flex items-start justify-between gap-3 sm:gap-4'>
          {selectable ? (
            <label className='mt-1 flex h-5 w-5 shrink-0 items-center justify-center'>
              <input
                type='checkbox'
                checked={selected}
                onChange={(event) => onSelectChange?.(prompt.id, event.target.checked)}
                className='h-4 w-4 accent-violet-500'
                aria-label={`Select ${promptTitle}`}
              />
            </label>
          ) : null}

          <div className='min-w-0 flex-1'>
            <div className='mb-3 flex flex-wrap items-center gap-2'>
              <span className='inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-300'>
                <Hash className='h-3.5 w-3.5' />
                Prompt
              </span>

              {!compact ? (
                <span className='inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-300'>
                  {wordCount} words
                </span>
              ) : null}

              {prompt.is_favorite ? (
                <span className='inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-violet-200'>
                  Favorite
                </span>
              ) : null}

              {prompt.ai_target ? (
                <span className='inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800/70 px-2.5 py-1 text-[11px] font-medium text-zinc-300'>
                  <Bot className='h-3.5 w-3.5' />
                  {prompt.ai_target}
                </span>
              ) : null}

              {prompt.category ? (
                <span className='inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800/70 px-2.5 py-1 text-[11px] font-medium text-zinc-300'>
                  <Boxes className='h-3.5 w-3.5' />
                  {prompt.category}
                </span>
              ) : null}
            </div>

            {onOpenDetail ? (
              <button
                type='button'
                onClick={() => onOpenDetail(prompt)}
                className='block max-w-full text-left'
              >
                <h3 className={`font-semibold tracking-tight transition-colors group-hover:text-violet-50 ${compact ? 'text-sm' : 'text-base sm:text-lg'}`}>
                  <HighlightedText text={promptTitle} query={searchQuery} />
                </h3>
              </button>
            ) : (
              <h3 className={`font-semibold tracking-tight transition-colors group-hover:text-violet-50 ${compact ? 'text-sm' : 'text-base sm:text-lg'}`}>
                <HighlightedText text={promptTitle} query={searchQuery} />
              </h3>
            )}

            <p className={`mt-3 whitespace-pre-wrap text-sm ${compact ? 'leading-5 text-zinc-300/90' : 'leading-6 text-zinc-300'}`}>
              <HighlightedText text={promptPreview} query={searchQuery} />
            </p>

            <div className='mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500'>
              <span className='inline-flex items-center gap-1.5'>
                <CalendarDays className='h-3.5 w-3.5' />
                {createdLabel}
              </span>

              {prompt.hashtags.slice(0, compact ? 2 : 4).map((tag) => (
                <span key={tag} className='inline-flex items-center gap-1.5'>
                  <Tag className='h-3.5 w-3.5' />
                  <HighlightedText text={`#${tag}`} query={searchQuery} />
                </span>
              ))}
            </div>
          </div>

          <button
            type='button'
            onClick={() => onToggleFavorite?.(prompt.id, prompt.is_favorite)}
            className={`shrink-0 self-start inline-flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 ${
              prompt.is_favorite
                ? 'border-violet-500/30 bg-violet-500/10 text-violet-200 shadow-[0_0_28px_rgba(139,92,246,0.16)] hover:bg-violet-500/20'
                : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-white'
            }`}
            aria-label={prompt.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={prompt.is_favorite}
          >
            {prompt.is_favorite ? (
              <Star className='h-4 w-4 fill-current' />
            ) : (
              <StarOff className='h-4 w-4' />
            )}
          </button>
        </div>

        <div className='mt-4 flex items-center justify-end gap-2 border-t border-white/5 pt-4'>
          <div className='grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:items-center'>
            <button
              type='button'
              onClick={() => void handleCopy()}
              className='inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800'
              aria-label='Copy prompt content'
              title='Copy prompt content'
            >
              {copied ? (
                <Check className='h-4 w-4 text-emerald-300' />
              ) : (
                <Clipboard className='h-4 w-4' />
              )}
              <span className='hidden sm:inline'>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {onOpenDetail ? (
              <button
                type='button'
                onClick={() => onOpenDetail(prompt)}
                className='inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800'
                title='Open prompt detail'
              >
                <Maximize2 className='h-4 w-4' />
                <span className='hidden sm:inline'>Open</span>
              </button>
            ) : null}

            {onEdit ? (
              <button
                type='button'
                onClick={openEditor}
                className='inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800'
                title='Edit prompt'
              >
                Edit
              </button>
            ) : null}

            {onDelete ? (
              <button
                type='button'
                onClick={() => setShowDeleteConfirm(true)}
                className='inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200 transition-all duration-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60'
                title='Delete prompt'
                disabled={isDeleting}
              >
                <Trash2 className='h-4 w-4' />
                <span className='hidden sm:inline'>Delete</span>
              </button>
            ) : null}
          </div>
        </div>
      </article>

      {onEdit ? (
        <CreatePromptModal
          open={showEditor}
          onOpenChange={setShowEditor}
          hideTrigger
          initialTitle={prompt.title}
          initialPrompt={prompt.content}
          initialAiTarget={prompt.ai_target}
          initialCategory={prompt.category}
          draftKey={`mardakhay-labs:draft:edit-${prompt.id}`}
          title='Edit prompt'
          description='Refine the title and content, then save the updated version back to your workspace.'
          submitLabel='Save changes'
          onSave={(input) => onEdit(prompt.id, input)}
        />
      ) : null}

      <ConfirmModal
        open={showDeleteConfirm}
        title='Delete prompt'
        description='This action permanently removes the prompt from your workspace.'
        confirmLabel='Delete prompt'
        isLoading={isDeleting}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onDelete?.(prompt.id)
          setShowDeleteConfirm(false)
        }}
      />
    </>
  )
}

export default PromptCard
