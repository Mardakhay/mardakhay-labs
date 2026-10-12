import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Clipboard, Code as Code2, Download, File as FileJson, FileText, Star, X } from 'lucide-react'

import type { Prompt, PromptInput } from '../api/prompts'
import {
  copyText,
  downloadTextFile,
  promptToJson,
  promptToMarkdown,
} from '../lib/promptExport'
import CreatePromptModal from './CreatePromptModal'
import HighlightedText from './HighlightedText'

type PromptDetailPanelProps = {
  prompt: Prompt | null
  searchQuery?: string
  onClose: () => void
  onEdit: (promptId: number, input: PromptInput) => void | Promise<void>
  onToggleFavorite: (promptId: number, isFavorite: boolean) => void
}

function PromptDetailPanel({
  prompt,
  searchQuery = '',
  onClose,
  onEdit,
  onToggleFavorite,
}: PromptDetailPanelProps) {
  const [showEditor, setShowEditor] = useState(false)
  const [copiedMode, setCopiedMode] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const copyTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!prompt) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, prompt])

  if (!prompt) return null
  const portalTarget =
    typeof document !== 'undefined'
      ? document.body
      : null
  
  if (!portalTarget) return null

  async function handleCopy(label: string, value: string) {
    await copyText(value)
    setCopiedMode(label)

    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current)
    }

    copyTimeoutRef.current = window.setTimeout(() => {
      setCopiedMode(null)
    }, 1400)
  }

  const markdown = promptToMarkdown(prompt)
  const json = promptToJson(prompt)
  const createdLabel = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(prompt.created_at))

  return createPortal(
    <div
      className='app-modal-backdrop fixed inset-0 z-[100] grid place-items-center bg-black/70 px-4 py-4 backdrop-blur-sm'
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <aside
        ref={modalRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby='prompt-detail-title'
        className='app-modal-panel flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0c] text-white shadow-2xl shadow-black/60 max-h-[min(92vh,680px)] sm:max-h-[92vh]'
      >
        <div className='flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.04] px-4 py-4 sm:gap-4 sm:px-6 sm:py-5'>
          <div className='min-w-0'>
            <p className='text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-500'>
              Prompt detail
            </p>
            <h2
              id='prompt-detail-title'
              className='mt-1 text-lg font-semibold tracking-tight text-zinc-100 sm:mt-2 sm:text-xl'
            >
              <HighlightedText text={prompt.title} query={searchQuery} />
            </h2>
            <p className='mt-1 text-[13px] text-zinc-500 sm:mt-2'>{createdLabel}</p>
          </div>

          <button
            ref={closeButtonRef}
            type='button'
            onClick={onClose}
            className='flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 text-zinc-400 transition-colors hover:text-zinc-200 sm:min-h-10 sm:min-w-10'
            aria-label='Close prompt detail'
          >
            <X className='h-3.5 w-3.5' />
          </button>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5'>
          <div className='mb-4 flex flex-wrap gap-1.5 sm:mb-5 sm:gap-2'>
            {prompt.ai_target ? (
              <span className='rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-0.5 text-[10px] text-zinc-400 sm:px-3 sm:py-1 sm:text-[11px]'>
                {prompt.ai_target}
              </span>
            ) : null}
            {prompt.category ? (
              <span className='rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-0.5 text-[10px] text-zinc-400 sm:px-3 sm:py-1 sm:text-[11px]'>
                {prompt.category}
              </span>
            ) : null}
            {prompt.hashtags.map((tag) => (
              <span
                key={tag}
                className='rounded-md border border-violet-500/15 bg-violet-500/[0.06] px-2.5 py-0.5 text-[10px] text-violet-300 sm:px-3 sm:py-1 sm:text-[11px]'
              >
                #{tag}
              </span>
            ))}
          </div>

          <pre className='whitespace-pre-wrap rounded-xl border border-white/[0.04] bg-white/[0.015] p-3.5 text-[13px] leading-7 text-zinc-300 sm:p-4'>
            <HighlightedText text={prompt.content} query={searchQuery} />
          </pre>
        </div>

        <div className='shrink-0 border-t border-white/[0.04] px-4 py-3 sm:px-6 sm:py-4'>
          <div className='grid grid-cols-3 gap-1.5'>
            <button
              type='button'
              onClick={() => void handleCopy('prompt', prompt.content)}
              className='inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white sm:min-h-10 sm:gap-2 sm:px-3 sm:text-[13px]'
            >
              {copiedMode === 'prompt' ? (
                <Check className='h-3.5 w-3.5 text-emerald-300 sm:h-4 sm:w-4' />
              ) : (
                <Clipboard className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
              )}
              Prompt
            </button>
            <button
              type='button'
              onClick={() => void handleCopy('markdown', markdown)}
              className='inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white sm:min-h-10 sm:gap-2 sm:px-3 sm:text-[13px]'
            >
              {copiedMode === 'markdown' ? (
                <Check className='h-3.5 w-3.5 text-emerald-300 sm:h-4 sm:w-4' />
              ) : (
                <FileText className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
              )}
              Markdown
            </button>
            <button
              type='button'
              onClick={() => void handleCopy('json', json)}
              className='inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white sm:min-h-10 sm:gap-2 sm:px-3 sm:text-[13px]'
            >
              {copiedMode === 'json' ? (
                <Check className='h-3.5 w-3.5 text-emerald-300 sm:h-4 sm:w-4' />
              ) : (
                <FileJson className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
              )}
              JSON
            </button>
          </div>

          <div className='mt-1.5 grid grid-cols-2 gap-1.5 sm:mt-2 sm:grid-cols-4'>
            <button
              type='button'
              onClick={() => onToggleFavorite(prompt.id, prompt.is_favorite)}
              className='inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-violet-500/15 bg-violet-500/[0.06] px-2 text-[11px] font-medium text-violet-300 transition-colors hover:bg-violet-500/15 sm:min-h-10 sm:gap-2 sm:px-3 sm:text-[13px]'
            >
              <Star
                className={`h-3.5 w-3.5 ${prompt.is_favorite ? 'fill-current text-violet-300' : ''} sm:h-4 sm:w-4`}
              />
              Favorite
            </button>
            <button
              type='button'
              onClick={() => setShowEditor(true)}
              className='inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white sm:min-h-10 sm:gap-2 sm:px-3 sm:text-[13px]'
            >
              <Code2 className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
              Edit
            </button>
            <button
              type='button'
              onClick={() => downloadTextFile(`${prompt.title || 'prompt'}.md`, markdown)}
              className='inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white sm:min-h-10 sm:gap-2 sm:px-3 sm:text-[13px]'
            >
              <Download className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
              MD
            </button>
            <button
              type='button'
              onClick={() =>
                downloadTextFile(
                  `${prompt.title || 'prompt'}.json`,
                  json,
                  'application/json'
                )
              }
              className='inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white sm:min-h-10 sm:gap-2 sm:px-3 sm:text-[13px]'
            >
              <Download className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
              JSON
            </button>
          </div>
        </div>
      </aside>

      <CreatePromptModal
        open={showEditor}
        onOpenChange={setShowEditor}
        hideTrigger
        initialTitle={prompt.title}
        initialPrompt={prompt.content}
        initialAiTarget={prompt.ai_target}
        initialCategory={prompt.category}
        title='Edit prompt'
        description='Refine the title and content, then save the updated version back to your workspace.'
        submitLabel='Save changes'
        onSave={(input) => onEdit(prompt.id, input)}
      />
    </div>,
    portalTarget
  )
}

export default PromptDetailPanel
