<<<<<<< HEAD
import { type KeyboardEvent as ReactKeyboardEvent, useState } from 'react'
import { CalendarDays, Hash, Star, StarOff, Trash2 } from 'lucide-react'

import type { Prompt, PromptInput } from '../api/prompts'
import { countPromptWords, derivePromptTitle, formatPromptPreview } from '../lib/promptFormatting'
=======
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
>>>>>>> d18cb156e4a41dcf62e912a71ef33355dc372bdb
import ConfirmModal from './ConfirmModal'
import CreatePromptModal from './CreatePromptModal'

type PromptCardProps = {
  prompt: Prompt
  onDelete?: (promptId: number) => void
  onToggleFavorite?: (promptId: number, isFavorite: boolean) => void
  onEdit?: (promptId: number, input: PromptInput) => void | Promise<void>
  compact?: boolean
}

function PromptCard({
  prompt,
  onDelete,
  onToggleFavorite,
  onEdit,
  compact = false,
}: PromptCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
<<<<<<< HEAD
  const [showEditor, setShowEditor] = useState(false)
=======

  const cardClassName = 'border-zinc-800/70 bg-zinc-900/80 text-white shadow-sm'
  const badgeClassName = 'border-zinc-700 bg-zinc-800/70 text-zinc-300'
  const previewClassName = 'text-zinc-300'
  const metaClassName = 'text-zinc-500'
>>>>>>> d18cb156e4a41dcf62e912a71ef33355dc372bdb

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

  function handleCardKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (!onEdit) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openEditor()
    }
  }

  return (
    <>
      <article
<<<<<<< HEAD
        role={onEdit ? 'button' : undefined}
        tabIndex={onEdit ? 0 : undefined}
        onClick={openEditor}
        onKeyDown={handleCardKeyDown}
        className={`group rounded-2xl border border-zinc-800/80 bg-zinc-900/85 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${compact ? 'p-4' : 'p-5'} ${prompt.is_favorite ? 'ring-1 ring-violet-500/20' : ''} ${onEdit ? 'cursor-pointer' : ''}`}
=======
        className={`group rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-lg ${compact ? 'p-4' : 'p-5'} ${cardClassName} ${prompt.is_favorite ? 'ring-1 ring-violet-500/20' : ''}`}
>>>>>>> d18cb156e4a41dcf62e912a71ef33355dc372bdb
      >
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0 flex-1'>
            <div className='mb-3 flex flex-wrap items-center gap-2'>
<<<<<<< HEAD
              <span className='inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-300'>
=======
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.24em] ${badgeClassName}`}>
>>>>>>> d18cb156e4a41dcf62e912a71ef33355dc372bdb
                <Hash className='h-3.5 w-3.5' />
                Prompt
              </span>

<<<<<<< HEAD
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
=======
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
>>>>>>> d18cb156e4a41dcf62e912a71ef33355dc372bdb
            </div>

            <h3 className={`font-semibold tracking-tight ${compact ? 'text-sm' : 'text-base sm:text-lg'}`}>
              {promptTitle}
            </h3>

<<<<<<< HEAD
            <p className={`mt-3 whitespace-pre-wrap text-sm ${compact ? 'leading-5 text-zinc-300/90' : 'leading-6 text-zinc-300'}`}>
              {promptPreview}
            </p>

            <div className='mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500'>
=======
            <p className={`mt-3 whitespace-pre-wrap text-sm ${compact ? 'leading-5 text-zinc-300/90' : 'leading-6 ' + previewClassName}`}>
              {promptPreview}
            </p>

            <div className={`mt-4 flex flex-wrap items-center gap-3 text-xs ${metaClassName}`}>
>>>>>>> d18cb156e4a41dcf62e912a71ef33355dc372bdb
              <span className='inline-flex items-center gap-1.5'>
                <CalendarDays className='h-3.5 w-3.5' />
                {createdLabel}
              </span>
            </div>
          </div>

          <button
<<<<<<< HEAD
            type='button'
            onClick={(event) => {
              event.stopPropagation()
              onToggleFavorite?.(prompt.id, prompt.is_favorite)
            }}
=======
            onClick={() => onToggleFavorite?.(prompt.id, prompt.is_favorite)}
>>>>>>> d18cb156e4a41dcf62e912a71ef33355dc372bdb
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

<<<<<<< HEAD
        <div className='mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4'>
          <p className='text-xs text-zinc-500'>Click the card to edit the prompt.</p>

          <div className='flex items-center gap-2'>
            {onEdit ? (
              <button
                type='button'
                onClick={(event) => {
                  event.stopPropagation()
                  openEditor()
                }}
                className='inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800'
              >
                Edit
              </button>
=======
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
>>>>>>> d18cb156e4a41dcf62e912a71ef33355dc372bdb
            ) : null}

            {onDelete ? (
              <button
<<<<<<< HEAD
                type='button'
                onClick={(event) => {
                  event.stopPropagation()
                  setShowDeleteConfirm(true)
                }}
                className='inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20'
=======
                onClick={() => setShowDeleteConfirm(true)}
                className='inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20'
>>>>>>> d18cb156e4a41dcf62e912a71ef33355dc372bdb
              >
                <Trash2 className='h-4 w-4' />
                Delete
              </button>
            ) : null}
          </div>
        </div>
      </article>

<<<<<<< HEAD
      {onEdit ? (
        <CreatePromptModal
          open={showEditor}
          onOpenChange={setShowEditor}
          hideTrigger
          initialTitle={prompt.title}
          initialPrompt={prompt.content}
          title='Edit prompt'
          description='Refine the title and content, then save the updated version back to your workspace.'
          submitLabel='Save changes'
          onSave={(input) => onEdit(prompt.id, input)}
        />
      ) : null}

=======
>>>>>>> d18cb156e4a41dcf62e912a71ef33355dc372bdb
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
