import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { RefObject } from 'react'
import { Boxes, Bot, LoaderCircle, Plus, X } from 'lucide-react'

import { derivePromptTitle } from '../lib/promptFormatting'
import { buildUserScopedStorageKey } from '../lib/storageKeys'
import { useAuthStore } from '../stores/authStore'
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

type PromptSaveHandler = (values: PromptFormValues) => Promise<unknown> | unknown

type CreatePromptModalProps = {
  onSave: PromptSaveHandler
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
  onSave: PromptSaveHandler
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
  const [hasRestorableDraft, setHasRestorableDraft] = useState(() => {
    try {
      return Boolean(window.localStorage.getItem(draftKey))
    } catch {
      return false
    }
  })
  const canUseTemplates = !initialPrompt.trim()

  const resolvedTitle = useMemo(() => {
    return promptTitle.trim() || derivePromptTitle(promptContent)
  }, [promptContent, promptTitle])

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
      const draft = JSON.parse(
        rawDraft
      ) as Partial<
        PromptFormValues & {
          aiTarget: AiTarget | 'none'
          category: PromptCategory | 'none'
        }
      >
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
      className='app-modal-panel flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0c] text-white shadow-2xl shadow-black/60 max-h-[min(92vh,680px)] sm:max-h-[92vh]'
    >
      <div className='flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.04] px-4 py-3 sm:gap-4 sm:px-6 sm:py-5'>
        <div className='min-w-0'>
          <p className='text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-500 sm:tracking-[0.3em]'>
            Prompt editor
          </p>
          <h2
            id={titleId}
            className='mt-1 text-lg font-semibold tracking-tight text-zinc-100 sm:mt-2 sm:text-xl'
          >
            {title}
          </h2>
          <p
            id={descriptionId}
            className='mt-1 text-sm leading-5 text-zinc-400 sm:mt-2 sm:leading-6'
          >
            {description}
          </p>
        </div>

        <button
          onClick={onClose}
          className='flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 text-zinc-400 transition-colors hover:text-zinc-200 sm:min-h-10 sm:min-w-10'
          aria-label='Close dialog'
        >
          <X className='h-4 w-4' />
        </button>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6'>
        <div className='space-y-5'>
          {hasRestorableDraft ? (
            <div className='flex flex-col gap-2 rounded-xl border border-violet-500/15 bg-violet-500/[0.06] p-3 text-[13px] text-violet-200 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-4'>
              <span>A saved draft is available for this editor.</span>
              <button
                type='button'
                onClick={restoreDraft}
                className='rounded-xl border border-violet-400/30 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-violet-500/15 sm:py-2'
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
                    <span className='block text-sm font-medium text-white'>
                      {template.label}
                    </span>
                    <span className='mt-1 block text-xs leading-5 text-zinc-500'>
                      {template.description}
                    </span>
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
              className='mt-2 min-h-12 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[13px] text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-violet-500/40'
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
              className='mt-2 min-h-40 w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[13px] leading-6 text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-violet-500/40 sm:min-h-52 sm:h-64'
            />
          </div>
        </div>
      </div>

      <div className='flex shrink-0 flex-col gap-3 border-t border-white/[0.04] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4 sm:gap-4'>
        <p className='hidden text-[10px] uppercase tracking-[0.26em] text-zinc-600 sm:block'>
          Escape closes this dialog
        </p>

        <div className='grid grid-cols-2 gap-2 sm:flex sm:justify-end sm:gap-2'>
          <button
            onClick={onClose}
            className='min-h-9 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-[13px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white sm:min-h-10 sm:py-2.5'
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className='inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-violet-500 to-violet-600 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_0_0_1px_rgba(139,92,246,0.3),0_2px_8px_rgba(139,92,246,0.15)] transition-all hover:from-violet-400 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10 sm:py-2.5'
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
  const dialogId = useId()
  const titleId = `${dialogId}-title`
  const descriptionId = `${dialogId}-description`
  const isControlled = open !== undefined
  const modalOpen = isControlled ? open : internalOpen
  const setModalOpen = onOpenChange ?? setInternalOpen
  const { user } = useAuthStore()
  const resolvedDraftKey = buildUserScopedStorageKey(
    draftKey ?? `mardakhay-labs:draft:${initialTitle || 'new'}`,
    user?.id
  )

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

  const portalTarget = typeof document !== 'undefined' ? document.body : null
  if (!portalTarget) return null

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

      {modalOpen
        ? createPortal(
            <div
              className='app-modal-backdrop fixed inset-0 z-[110] grid place-items-center bg-black/70 px-4 py-4 backdrop-blur-sm'
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
            </div>,
            portalTarget
          )
        : null}
    </>
  )
}

export default CreatePromptModal
