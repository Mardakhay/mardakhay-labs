import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Boxes, Bot, LoaderCircle, Plus, X } from 'lucide-react'

import { derivePromptTitle } from '../lib/promptFormatting'
import {
  aiTargetOptions,
  promptCategoryOptions,
  type AiTarget,
  type PromptCategory,
} from '../lib/promptMetadata'
import { promptTemplates } from '../lib/promptTemplates'
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
  draftKey?: string
}

type PromptEditorModalProps = {
  initialPrompt: string
  initialTitle: string
  initialAiTarget?: AiTarget
  initialCategory?: PromptCategory
  title: string
  description: string
  submitLabel: string
  titleId: string
  descriptionId: string
  modalRef: RefObject<HTMLDivElement | null>
  draftKey: string
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
  titleId,
  descriptionId,
  modalRef,
  draftKey,
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
  const [hasRestorableDraft, setHasRestorableDraft] = useState(false)
  const canUseTemplates = !initialPrompt.trim()

  const resolvedTitle = useMemo(() => {
    return promptTitle.trim() || derivePromptTitle(promptContent)
  }, [promptContent, promptTitle])

  useEffect(() => {
    try {
      const rawDraft = window.localStorage.getItem(draftKey)
      setHasRestorableDraft(Boolean(rawDraft))
    } catch {
      setHasRestorableDraft(false)
    }
  }, [draftKey])

  useEffect(() => {
    const hasMeaningfulDraft =
      promptTitle.trim() !== initialTitle.trim() ||
      promptContent.trim() !== initialPrompt.trim() ||
      aiTarget !== (initialAiTarget ?? 'none') ||
      category !== (initialCategory ?? 'none')

    try {
      if (hasMeaningfulDraft) {
        window.localStorage.setItem(
          draftKey,
          JSON.stringify({
            title: promptTitle,
            content: promptContent,
            aiTarget,
            category,
          })
        )
      }
    } catch {
      // Draft persistence is best effort only.
    }
  }, [
    aiTarget,
    category,
    draftKey,
    initialAiTarget,
    initialCategory,
    initialPrompt,
    initialTitle,
    promptContent,
    promptTitle,
  ])

  function restoreDraft() {
    try {
      const rawDraft = window.localStorage.getItem(draftKey)
      if (!rawDraft) return
      const draft = JSON.parse(rawDraft) as Partial<PromptFormValues & { aiTarget: AiTarget | 'none'; category: PromptCategory | 'none' }>
      setPromptTitle(draft.title ?? '')
      setPromptContent(draft.content ?? '')
      setAiTarget(draft.aiTarget ?? 'none')
      setCategory(draft.category ?? 'none')
      setHasRestorableDraft(false)
    } catch {
      setHasRestorableDraft(false)
    }
  }

  function applyTemplate(templateId: string) {
    const template = promptTemplates.find((item) => item.id === templateId)
    if (!template) return

    setPromptTitle(template.title)
    setPromptContent(template.content)
    setAiTarget(template.aiTarget ?? 'none')
    setCategory(template.category ?? 'none')
  }

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
      window.localStorage.removeItem(draftKey)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      ref={modalRef}
      role='dialog'
      aria-modal='true'
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className='app-modal-panel flex h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl shadow-black/60 sm:h-auto sm:max-h-[min(92dvh,44rem)] sm:rounded-3xl'
    >
      <div className='flex shrink-0 items-start justify-between gap-4 border-b border-white/5 px-4 py-4 sm:px-6 sm:py-5'>
        <div className='min-w-0'>
          <p className='text-xs uppercase tracking-[0.24em] text-zinc-500 sm:tracking-[0.3em]'>
            Prompt editor
          </p>
          <h2 id={titleId} className='mt-2 text-xl font-semibold tracking-tight sm:text-2xl'>
            {title}
          </h2>
          <p id={descriptionId} className='mt-2 max-w-2xl text-sm leading-6 text-zinc-400'>
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
          {hasRestorableDraft ? (
            <div className='flex flex-col gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 text-sm text-violet-100 sm:flex-row sm:items-center sm:justify-between'>
              <span>A saved draft is available for this editor.</span>
              <button
                type='button'
                onClick={restoreDraft}
                className='rounded-xl border border-violet-400/30 px-3 py-2 font-medium transition-colors hover:bg-violet-500/15'
              >
                Restore draft
              </button>
            </div>
          ) : null}

          {canUseTemplates ? (
            <div>
              <p className='mb-2 text-sm font-medium text-zinc-200'>Templates</p>
              <div className='grid gap-2 sm:grid-cols-2'>
                {promptTemplates.map((template) => (
                  <button
                    key={template.id}
                    type='button'
                    onClick={() => applyTemplate(template.id)}
                    className='rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left transition-colors hover:bg-white/[0.06]'
                  >
                    <span className='block text-sm font-medium text-white'>{template.label}</span>
                    <span className='mt-1 block text-xs leading-5 text-zinc-500'>{template.description}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

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
  draftKey,
}: CreatePromptModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  const titleId = 'prompt-dialog-title'
  const descriptionId = 'prompt-dialog-description'
  const isControlled = open !== undefined
  const modalOpen = isControlled ? open : internalOpen
  const setModalOpen = onOpenChange ?? setInternalOpen
  const resolvedDraftKey = draftKey ?? `mardakhay-labs:draft:${initialTitle || 'new'}`

  useEffect(() => {
    if (!modalOpen) return

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModalOpen(false)
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )

      if (!focusableElements?.length) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow

      const previousElement = previousActiveElementRef.current
      if (previousElement?.isConnected) {
        previousElement.focus()
      }
    }
  }, [modalOpen, setModalOpen])

  return (
    <>
      {!hideTrigger ? (
        <button
          ref={triggerRef}
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
          className='app-modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-2 pt-4 backdrop-blur-sm sm:grid sm:place-items-center sm:px-4 sm:py-4'
          onPointerDown={(event) => {
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
            titleId={titleId}
            descriptionId={descriptionId}
            modalRef={modalRef}
            draftKey={resolvedDraftKey}
            onClose={() => setModalOpen(false)}
            onSave={onSave}
          />
        </div>
      ) : null}
    </>
  )
}

export default CreatePromptModal
