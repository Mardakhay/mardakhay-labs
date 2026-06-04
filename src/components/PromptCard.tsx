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
  Tag,
  Trash2,
} from 'lucide-react'

import type { Prompt, PromptInput } from '../api/prompts'
import { buildUserScopedStorageKey } from '../lib/storageKeys'
import { useAuthStore } from '../stores/authStore'
import {
  countPromptWords,
  derivePromptTitle,
  formatPromptPreview,
} from '../lib/promptFormatting'
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

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable
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
  const { user } = useAuthStore()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isPointerOver, setIsPointerOver] = useState(false)
  const copyTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!onOpenDetail || !isPointerOver) return

    function handleWindowKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Enter') return
      if (event.repeat || event.defaultPrevented) return
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
      if (isTypingTarget(event.target)) return

      event.preventDefault()
      onOpenDetail?.(prompt)
    }

    window.addEventListener('keydown', handleWindowKeyDown)
    return () => window.removeEventListener('keydown', handleWindowKeyDown)
  }, [isPointerOver, onOpenDetail, prompt])

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

  function openDetail() {
    onOpenDetail?.(prompt)
  }

  function isInteractiveTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false

    return Boolean(
      target.closest('button, a, input, textarea, select, label, [data-no-open-detail]')
    )
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
        role={onOpenDetail ? 'button' : undefined}
        tabIndex={onOpenDetail ? 0 : undefined}
        aria-label={onOpenDetail ? `Open prompt ${promptTitle}` : undefined}
        onMouseEnter={onOpenDetail ? () => setIsPointerOver(true) : undefined}
        onMouseLeave={onOpenDetail ? () => setIsPointerOver(false) : undefined}
        onClick={
          onOpenDetail
            ? (event) => {
                if (!isInteractiveTarget(event.target)) {
                  openDetail()
                }
              }
            : undefined
        }
        onKeyDown={
          onOpenDetail
            ? (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return
                if (isInteractiveTarget(event.target)) return
                event.preventDefault()
                openDetail()
              }
            : undefined
        }
        className={`app-surface group rounded-xl border border-white/[0.04] text-white transition-all duration-200 hover:-translate-y-px ${onOpenDetail ? 'cursor-pointer' : ''} ${compact ? 'p-3.5' : 'p-3.5 sm:p-4'} ${prompt.is_favorite ? 'ring-1 ring-violet-500/20' : ''} ${selected ? 'border-violet-500/40 ring-1 ring-violet-500/30' : ''}`}
      >
        <div className='flex items-start justify-between gap-3 sm:gap-4'>
          {selectable ? (
            <label className='mt-1 flex h-5 w-5 shrink-0 items-center justify-center'>
              <input
                type='checkbox'
                checked={selected}
                onChange={(event) =>
                  onSelectChange?.(prompt.id, event.target.checked)
                }
                className='h-4 w-4 accent-violet-500'
                aria-label={`Select ${promptTitle}`}
              />
            </label>
          ) : null}

          <div className='min-w-0 flex-1'>
            <div className='mb-2.5 flex flex-wrap items-center gap-1.5'>
              <span className='inline-flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400'>
                <Hash className='h-3 w-3' />
                Prompt
              </span>

              {!compact ? (
                <span className='inline-flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400'>
                  {wordCount} words
                </span>
              ) : null}

              {prompt.is_favorite ? (
                <span className='inline-flex items-center gap-1 rounded-md border border-violet-500/20 bg-violet-500/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-violet-300'>
                  Favorite
                </span>
              ) : null}

              {prompt.ai_target ? (
                <span className='inline-flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] font-medium text-zinc-400'>
                  <Bot className='h-3 w-3' />
                  {prompt.ai_target}
                </span>
              ) : null}

              {prompt.category ? (
                <span className='inline-flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] font-medium text-zinc-400'>
                  <Boxes className='h-3 w-3' />
                  {prompt.category}
                </span>
              ) : null}
            </div>

            {onOpenDetail ? (
              <button
                type='button'
                onClick={openDetail}
                className='block max-w-full text-left'
              >
                <h3
                  className={`font-semibold tracking-tight transition-colors group-hover:text-violet-50 ${compact ? 'text-[13px]' : 'text-[15px] sm:text-base'}`}
                >
                  <HighlightedText text={promptTitle} query={searchQuery} />
                </h3>
              </button>
            ) : (
              <h3
                className={`font-semibold tracking-tight transition-colors group-hover:text-violet-50 ${compact ? 'text-[13px]' : 'text-[15px] sm:text-base'}`}
              >
                <HighlightedText text={promptTitle} query={searchQuery} />
              </h3>
            )}

            <p
              className={`mt-2 whitespace-pre-wrap text-[13px] ${compact ? 'leading-5 text-zinc-400' : 'leading-6 text-zinc-400'}`}
            >
              <HighlightedText text={promptPreview} query={searchQuery} />
            </p>

            <div className='mt-3 flex flex-wrap items-center gap-2.5 text-[11px] text-zinc-500'>
              <span className='inline-flex items-center gap-1.5'>
                <CalendarDays className='h-3 w-3' />
                {createdLabel}
              </span>

              {prompt.hashtags.slice(0, compact ? 2 : 4).map((tag) => (
                <span key={tag} className='inline-flex items-center gap-1.5'>
                  <Tag className='h-3 w-3' />
                  <HighlightedText text={`#${tag}`} query={searchQuery} />
                </span>
              ))}
            </div>
          </div>

          <button
            type='button'
            onClick={() => onToggleFavorite?.(prompt.id, prompt.is_favorite)}
            className={`shrink-0 self-start inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 sm:h-10 sm:w-10 ${
              prompt.is_favorite
                ? 'border-violet-500/20 bg-violet-500/[0.08] text-violet-300 shadow-[0_0_16px_rgba(139,92,246,0.1)] hover:bg-violet-500/15'
                : 'border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:border-white/[0.1] hover:text-zinc-200'
            }`}
            aria-label={
              prompt.is_favorite ? 'Remove from favorites' : 'Add to favorites'
            }
            aria-pressed={prompt.is_favorite}
          >
            <Star className={`h-4 w-4 ${prompt.is_favorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className='mt-3 flex items-center justify-end gap-2 border-t border-white/[0.04] pt-3 sm:pt-3.5'>
          <div className='flex w-full flex-wrap items-center gap-1.5'>
            <button
              type='button'
              onClick={() => void handleCopy()}
              className='inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[12px] font-medium text-zinc-300 transition-all duration-200 hover:bg-white/[0.05] hover:text-white sm:min-h-9 sm:gap-2 sm:px-3 sm:text-[13px]'
              aria-label='Copy prompt content'
              title='Copy prompt content'
            >
              {copied ? (
                <Check className='h-3.5 w-3.5 text-emerald-400' />
              ) : (
                <Clipboard className='h-3.5 w-3.5' />
              )}
              <span className='hidden sm:inline'>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {onOpenDetail ? (
              <button
                type='button'
                onClick={openDetail}
                className='inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[12px] font-medium text-zinc-300 transition-all duration-200 hover:bg-white/[0.05] hover:text-white sm:min-h-9 sm:gap-2 sm:px-3 sm:text-[13px]'
                title='Open prompt detail'
              >
                <Maximize2 className='h-3.5 w-3.5' />
                <span className='hidden sm:inline'>Open</span>
              </button>
            ) : null}

            {onEdit ? (
              <button
                type='button'
                onClick={openEditor}
                className='inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[12px] font-medium text-zinc-300 transition-all duration-200 hover:bg-white/[0.05] hover:text-white sm:min-h-9 sm:gap-2 sm:px-3 sm:text-[13px]'
                title='Edit prompt'
              >
                Edit
              </button>
            ) : null}

            {onDelete ? (
              <button
                type='button'
                onClick={() => setShowDeleteConfirm(true)}
                className='ml-auto inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-2.5 py-1.5 text-[12px] font-medium text-red-300 transition-all duration-200 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-9 sm:gap-2 sm:px-3 sm:text-[13px]'
                title='Delete prompt'
                disabled={isDeleting}
              >
                <Trash2 className='h-3.5 w-3.5' />
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
          draftKey={buildUserScopedStorageKey(`draft:edit-${prompt.id}`, user?.id)}
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
