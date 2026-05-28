import { useEffect, useMemo, useState } from 'react'
import { Boxes, Bot, LoaderCircle, Plus, X } from 'lucide-react'

import { derivePromptTitle } from '../lib/promptFormatting'
import {
  aiTargetOptions,
  promptCategoryOptions,
  type AiTarget,
  type PromptCategory,
} from '../lib/promptMetadata'
import DropdownMenu from './DropdownMenu'

type PromptFormValues = {
  title: string
  content: string
  aiTarget?: AiTarget
  category?: PromptCategory
}

type CreatePromptModalProps = {
  onSave: (values: PromptFormValues) => Promise<void> | void
  triggerLabel?: string
  compact?: boolean
  initialPrompt?: string
  initialTitle?: string
  initialAiTarget?: AiTarget
  initialCategory?: PromptCategory
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
  initialAiTarget?: AiTarget
  initialCategory?: PromptCategory
  title: string
  description: string
  submitLabel: string
  onClose: () => void
  onSave: (values: PromptFormValues) => Promise<void> | void
}

function PromptEditorModal({
  initialPrompt,
  initialTitle,
  initialAiTarget,
  initialCategory,
  title,
  description,
  submitLabel,
  onClose,
  onSave,
}: PromptEditorModalProps) {
  const [promptTitle, setPromptTitle] = useState(initialTitle)
  const [promptContent, setPromptContent] = useState(initialPrompt)
  const [aiTarget, setAiTarget] = useState<AiTarget | 'none'>(
    initialAiTarget ?? 'none'
  )
  const [category, setCategory] = useState<PromptCategory | 'none'>(
    initialCategory ?? 'none'
  )
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
        aiTarget: aiTarget === 'none' ? undefined : aiTarget,
        category: category === 'none' ? undefined : category,
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl shadow-black/60 sm:h-auto sm:max-h-[min(92dvh,44rem)] sm:rounded-3xl'>
      <div className='flex shrink-0 items-start justify-between gap-4 border-b border-white/5 px-4 py-4 sm:px-6 sm:py-5'>
        <div className='min-w-0'>
          <p className='text-xs uppercase tracking-[0.24em] text-zinc-500 sm:tracking-[0.3em]'>
            Prompt editor
          </p>
          <h2 className='mt-2 text-xl font-semibold tracking-tight sm:text-2xl'>
            {title}
          </h2>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-zinc-400'>
            {description}
          </p>
        </div>

        <button
          onClick={onClose}
          className='flex min-h-11 min-w-11 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 p-2 text-zinc-300 transition-colors hover:text-white'
          aria-label='Close dialog'
        >
          <X className='h-4 w-4' />
        </button>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6'>
        <div className='space-y-5'>
          <div>
            <label className='block text-sm font-medium text-zinc-200'>
              Prompt title
            </label>
            <input
              autoFocus
              value={promptTitle}
              onChange={(event) => setPromptTitle(event.target.value)}
              placeholder='Summarize the prompt in a short title'
              className='mt-2 min-h-12 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-violet-500'
            />
            <p className='mt-2 text-xs leading-5 text-zinc-500'>
              Leave it blank to auto-generate the title from the first line.
            </p>
          </div>

          <div className='grid gap-3 sm:grid-cols-2'>
            <DropdownMenu
              icon={Bot}
              label='AI target'
              value={aiTarget}
              onChange={setAiTarget}
              items={[
                {
                  value: 'none',
                  label: 'No target',
                  description: 'Keep this prompt provider-neutral.',
                },
                ...aiTargetOptions.map((option) => ({
                  value: option,
                  label: option,
                  description: `Intended for ${option}.`,
                })),
              ]}
            />

            <DropdownMenu
              icon={Boxes}
              label='Category'
              value={category}
              onChange={setCategory}
              items={[
                {
                  value: 'none',
                  label: 'No category',
                  description: 'Leave this prompt uncategorized.',
                },
                ...promptCategoryOptions.map((option) => ({
                  value: option,
                  label: option,
                  description: `${option} workspace prompt.`,
                })),
              ]}
            />
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
              className='mt-2 h-[42dvh] min-h-52 w-full resize-none rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-violet-500 sm:h-64'
            />
          </div>
        </div>
      </div>

      <div className='flex shrink-0 flex-col gap-4 border-t border-white/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5'>
        <p className='hidden text-xs uppercase tracking-[0.26em] text-zinc-500 sm:block'>
          Escape closes this dialog
        </p>

        <div className='grid gap-3 sm:flex sm:justify-end'>
          <button
            onClick={onClose}
            className='min-h-12 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800'
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className='inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60'
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
  initialAiTarget,
  initialCategory,
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
          className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 sm:w-auto ${
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
          className='fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-2 pt-4 backdrop-blur-sm sm:grid sm:place-items-center sm:px-4 sm:py-4'
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
            initialAiTarget={initialAiTarget}
            initialCategory={initialCategory}
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
