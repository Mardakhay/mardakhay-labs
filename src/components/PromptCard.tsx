import { useState } from 'react'
import {
  CalendarDays,
  Hash,
  MoreVertical,
  Star,
  StarOff,
  Trash2,
} from 'lucide-react'

import type { Prompt } from '../api/prompts'
import ConfirmModal from './ConfirmModal'
import CreatePromptModal from './CreatePromptModal'

type PromptCardProps = {
  prompt: Prompt
  onDelete?: (promptId: number) => void
  onToggleFavorite?: (promptId: number, isFavorite: boolean) => void
  onEdit?: (promptId: number, content: string) => void | Promise<void>
  compact?: boolean
}

function formatPromptTitle(content: string) {
  const firstLine = content.trim().split('\n')[0] ?? ''
  if (!firstLine) return 'Untitled prompt'
  return firstLine.length > 58 ? `${firstLine.slice(0, 58)}…` : firstLine
}

function formatPromptPreview(content: string, compact = false) {
  const maxLength = compact ? 72 : 180
  const clean = content.trim().replace(/\s+/g, ' ')
  if (clean.length <= maxLength) return clean
  return `${clean.slice(0, maxLength)}…`
}

function PromptCard({
  prompt,
  onDelete,
  onToggleFavorite,
  onEdit,
  compact = false,
}: PromptCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const cardClassName = 'border-zinc-800/70 bg-zinc-900/80 text-white shadow-sm'
  const badgeClassName = 'border-zinc-700 bg-zinc-800/70 text-zinc-300'
  const previewClassName = 'text-zinc-300'
  const metaClassName = 'text-zinc-500'

  const wordCount = prompt.content.trim().split(/\s+/).filter(Boolean).length
  const promptTitle = formatPromptTitle(prompt.content)
  const promptPreview = formatPromptPreview(prompt.content, compact)
  const createdLabel = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: compact ? undefined : 'short',
  }).format(new Date(prompt.created_at))

  return (
    <>
      <article
        className={`group rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-lg ${compact ? 'p-4' : 'p-5'} ${cardClassName} ${prompt.is_favorite ? 'ring-1 ring-violet-500/20' : ''}`}
      >
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0 flex-1'>
            <div className='mb-3 flex flex-wrap items-center gap-2'>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.24em] ${badgeClassName}`}>
                <Hash className='h-3.5 w-3.5' />
                Prompt
              </span>

              {!compact && (
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.24em] ${badgeClassName}`}>
                  {wordCount} words
                </span>
              )}

              {prompt.is_favorite && (
                <span className='inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-violet-200'>
                  Favorite
                </span>
              )}
            </div>

            <h3 className={`font-semibold tracking-tight ${compact ? 'text-sm' : 'text-base sm:text-lg'}`}>
              {promptTitle}
            </h3>

            <p className={`mt-3 whitespace-pre-wrap text-sm ${compact ? 'leading-5 text-zinc-300/90' : 'leading-6 ' + previewClassName}`}>
              {promptPreview}
            </p>

            <div className={`mt-4 flex flex-wrap items-center gap-3 text-xs ${metaClassName}`}>
              <span className='inline-flex items-center gap-1.5'>
                <CalendarDays className='h-3.5 w-3.5' />
                {createdLabel}
              </span>
            </div>
          </div>

          <button
            onClick={() => onToggleFavorite?.(prompt.id, prompt.is_favorite)}
            className={`rounded-full border p-2 transition-all ${
              prompt.is_favorite
                ? 'border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20'
                : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-white'
            }`}
            aria-label={prompt.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {prompt.is_favorite ? (
              <Star className='h-4 w-4 fill-current' />
            ) : (
              <StarOff className='h-4 w-4' />
            )}
          </button>
        </div>

        <div className={`mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4 ${compact ? 'text-xs' : ''}`}>
          <div className={`flex items-center gap-2 text-xs ${metaClassName}`}>
            <MoreVertical className='h-4 w-4' />
            AI prompt asset
          </div>

          <div className='flex items-center gap-2'>
            {onEdit ? (
              <CreatePromptModal
                triggerLabel='Edit'
                compact
                initialPrompt={prompt.content}
                title='Edit Prompt'
                description='Refine this prompt and save the updated version back to your workspace.'
                submitLabel='Save changes'
                onAddPrompt={(nextContent) => onEdit(prompt.id, nextContent)}
              />
            ) : null}

            {onDelete ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className='inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20'
              >
                <Trash2 className='h-4 w-4' />
                Delete
              </button>
            ) : null}
          </div>
        </div>
      </article>

      <ConfirmModal
        open={showDeleteConfirm}
        title='Delete prompt'
        description='This action permanently removes the prompt from your workspace.'
        confirmLabel='Delete prompt'
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
