import { useEffect, useState } from 'react'
import { LoaderCircle, Plus, X } from 'lucide-react'

import { useTheme } from '../context/useTheme'

type CreatePromptModalProps = {
  onAddPrompt: (prompt: string) => Promise<void> | void
  triggerLabel?: string
  compact?: boolean
  initialPrompt?: string
  title?: string
  description?: string
  submitLabel?: string
}

function CreatePromptModal({
  onAddPrompt,
  triggerLabel = 'New Prompt',
  compact = false,
  initialPrompt = '',
  title = 'Create Prompt',
  description = 'Add a new AI prompt to your workspace library.',
  submitLabel = 'Create Prompt',
}: CreatePromptModalProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState(initialPrompt)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  async function handleSubmit() {
    if (!prompt.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      await onAddPrompt(prompt)
      setPrompt('')
      setIsOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const modalClassName = isDark
    ? 'border-zinc-800 bg-zinc-950 text-white shadow-2xl shadow-black/50'
    : 'border-zinc-200 bg-white text-zinc-950 shadow-2xl shadow-zinc-950/10'

  const inputClassName = isDark
    ? 'border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500 focus:border-violet-500'
    : 'border-zinc-300 bg-white text-zinc-950 placeholder:text-zinc-400 focus:border-violet-500'

  const cancelButtonClassName = isDark
    ? 'border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800'
    : 'border-zinc-300 bg-zinc-100 text-zinc-950 hover:bg-zinc-200'

  return (
    <>
      <button
        onClick={() => {
          setPrompt(initialPrompt)
          setIsOpen(true)
        }}
        className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
          compact
            ? isDark
              ? 'border border-zinc-700 bg-zinc-900 text-white hover:border-zinc-500 hover:bg-zinc-800'
              : 'border border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-100'
            : 'bg-white text-zinc-950 hover:bg-zinc-200'
        }`}
      >
        <Plus className='h-4 w-4' />
        {triggerLabel}
      </button>

      {isOpen && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm'
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false)
            }
          }}
        >
          <div
            role='dialog'
            aria-modal='true'
            aria-label='Create prompt'
            className={`w-full max-w-2xl rounded-3xl border p-6 ${modalClassName}`}
          >
            <div className='mb-6 flex items-start justify-between gap-4'>
              <div>
                <p className='text-xs uppercase tracking-[0.3em] text-zinc-500'>
                  Prompt workspace
                </p>
                <h2 className='mt-2 text-2xl font-semibold tracking-tight'>
                  {title}
                </h2>
                <p className='mt-2 text-sm leading-6 text-zinc-400'>
                  {description}
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className={`rounded-full border p-2 transition-colors ${
                  isDark
                    ? 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white'
                    : 'border-zinc-300 bg-zinc-100 text-zinc-500 hover:text-zinc-950'
                }`}
                aria-label='Close dialog'
              >
                <X className='h-4 w-4' />
              </button>
            </div>

            <label className='block text-sm font-medium'>
              Prompt content
            </label>

            <textarea
              placeholder='Describe the prompt, task, instruction, or workflow...'
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={7}
              className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm leading-6 outline-none transition-colors ${inputClassName}`}
            />

            <div className='mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
              <button
                onClick={() => setIsOpen(false)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${cancelButtonClassName}`}
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
                    Creating...
                  </>
                ) : (
                  submitLabel
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CreatePromptModal
