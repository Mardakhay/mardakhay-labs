import { useEffect, useMemo, useState } from 'react'
import { LoaderCircle, Plus, X } from 'lucide-react'

import { derivePromptTitle } from '../lib/promptFormatting'

type PromptFormValues = {
  title: string
  content: string
}

type CreatePromptModalProps = {
  onSave: (values: PromptFormValues) => Promise<void> | void
  triggerLabel?: string
  compact?: boolean
  initialPrompt?: string
  initialTitle?: string
  title?: string
  description?: string
  submitLabel?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideTrigger?: boolean
}

type PromptEditorModalProps = {
  initialPrompt: string
  initialTitle: string
  title: string
  description: string
  submitLabel: string
  onClose: () => void
  onSave: (values: PromptFormValues) => Promise<void> | void
}

function PromptEditorModal({
  initialPrompt,
  initialTitle,
  title,
  description,
  submitLabel,
  onClose,
  onSave,
}: PromptEditorModalProps) {
  const [promptTitle, setPromptTitle] = useState(initialTitle)
  const [promptContent, setPromptContent] = useState(initialPrompt)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resolvedTitle = useMemo(() => {
    return promptTitle.trim() || derivePromptTitle(promptContent)
  }, [promptContent, promptTitle])

  async function handleSubmit() {
    if (!promptContent.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      await onSave({
        title: resolvedTitle,
        content: promptContent,
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex w-full max-w-2xl max-h-[min(92vh,44rem)] flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl shadow-black/60'>
      <div className='flex items-start justify-between gap-4 border-b border-white/5 px-6 py-5'>
        <div className='min-w-0'>
          <p className='text-xs uppercase tracking-[0.3em] text-zinc-500'>
            Prompt editor
          </p>
          <h2 className='mt-2 text-2xl font-semibold tracking-tight'>{title}</h2>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-zinc-400'>
            {description}
          </p>
        </div>

        <button
          onClick={onClose}
          className='rounded-full border border-zinc-700 bg-zinc-900 p-2 text-zinc-300 transition-colors hover:text-white'
          aria-label='Close dialog'
        >
          <X className='h-4 w-4' />
        </button>
      </div>

      <div className='flex-1 overflow-y-auto px-6 py-6'>
        <div className='space-y-5'>
          <div>
            <label className='block text-sm font-medium text-zinc-200'>
              Prompt title
            </label>
            <input
              value={promptTitle}
              onChange={(event) => setPromptTitle(event.target.value)}
              placeholder='Summarize the prompt in a short title'
              className='mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-violet-500'
            />
            <p className='mt-2 text-xs leading-5 text-zinc-500'>
              Leave it blank to auto-generate the title from the first line.
            </p>
          </div>

          <div>
            <label className='block text-sm font-medium text-zinc-200'>
              Prompt content
            </label>
            <textarea
              placeholder='Describe the prompt, task, instruction, or workflow...'
              value={promptContent}
              onChange={(event) => setPromptContent(event.target.value)}
              rows={10}
              className='mt-2 h-64 w-full resize-none rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-violet-500'
            />
          </div>
        </div>
      </div>

      <div className='flex items-center justify-between gap-4 border-t border-white/5 px-6 py-5'>
        <p className='text-xs uppercase tracking-[0.26em] text-zinc-500'>
          Escape closes this dialog
        </p>

        <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
          <button
            onClick={onClose}
            className='rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800'
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className='inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60'
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className='h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function CreatePromptModal({
  onSave,
  triggerLabel = 'New prompt',
  compact = false,
  initialPrompt = '',
  initialTitle = '',
  title = 'Create prompt',
  description = 'Add a new AI prompt to your workspace library.',
  submitLabel = 'Create prompt',
  open,
  onOpenChange,
  hideTrigger = false,
}: CreatePromptModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const modalOpen = isControlled ? open : internalOpen
  const setModalOpen = onOpenChange ?? setInternalOpen

  useEffect(() => {
    if (!modalOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [modalOpen, setModalOpen])

  return (
    <>
      {!hideTrigger ? (
        <button
          onClick={() => setModalOpen(true)}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
            compact
              ? 'border border-zinc-700 bg-zinc-900 text-white hover:border-zinc-500 hover:bg-zinc-800'
              : 'bg-white text-zinc-950 hover:bg-zinc-200'
          }`}
        >
          <Plus className='h-4 w-4' />
          {triggerLabel}
        </button>
      ) : null}

      {modalOpen ? (
        <div
          className='fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-4 backdrop-blur-sm'
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false)
            }
          }}
        >
          <PromptEditorModal
            key={`${initialTitle}::${initialPrompt}`}
            initialPrompt={initialPrompt}
            initialTitle={initialTitle}
            title={title}
            description={description}
            submitLabel={submitLabel}
            onClose={() => setModalOpen(false)}
            onSave={onSave}
          />
        </div>
      ) : null}
    </>
  )
}

export default CreatePromptModal
