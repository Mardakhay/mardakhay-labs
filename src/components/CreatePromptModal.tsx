import { useState } from 'react'

import { useTheme } from '../context/ThemeContext'

type CreatePromptModalProps = {
  onAddPrompt: (prompt: string) => Promise<void> | void
}

function CreatePromptModal({ onAddPrompt }: CreatePromptModalProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    ? 'border-zinc-800 bg-zinc-950 text-white'
    : 'border-zinc-200 bg-white text-zinc-950'

  const inputClassName = isDark
    ? 'border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500 focus:border-zinc-500'
    : 'border-zinc-300 bg-white text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-500'

  const cancelButtonClassName = isDark
    ? 'border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800'
    : 'border-zinc-300 bg-zinc-100 text-zinc-950 hover:bg-zinc-200'

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className='rounded-lg bg-white px-4 py-2 text-black transition-colors hover:bg-zinc-200'
      >
        New Prompt
      </button>

      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4'>
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${modalClassName}`}>
            <h2 className='mb-4 text-2xl font-bold'>
              Create Prompt
            </h2>

            <input
              type='text'
              placeholder='Enter prompt...'
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className={`mb-4 w-full rounded-lg border px-4 py-3 outline-none transition-colors ${inputClassName}`}
            />

            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setIsOpen(false)}
                className={`rounded-lg border px-4 py-2 transition-colors ${cancelButtonClassName}`}
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className='rounded-lg bg-white px-4 py-2 text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CreatePromptModal
