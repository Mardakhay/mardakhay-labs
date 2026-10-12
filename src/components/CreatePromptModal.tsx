import { useState } from 'react'

type CreatePromptModalProps = {
  onAddPrompt: (prompt: string) => void
}

function CreatePromptModal({
  onAddPrompt,
}: CreatePromptModalProps) {
  const [isOpen, setIsOpen] =
    useState(false)

  const [prompt, setPrompt] =
    useState('')

  function handleSubmit() {
    if (!prompt.trim()) return

    onAddPrompt(prompt)

    setPrompt('')
    setIsOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-white px-4 py-2 text-black"
      >
        New Prompt
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-6 shadow-2xl">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Create Prompt
            </h2>

            <input
              type="text"
              placeholder="Enter prompt..."
              value={prompt}
              onChange={(event) =>
                setPrompt(event.target.value)
              }
              className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setIsOpen(false)
                }
                className="rounded-lg bg-zinc-700 px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="rounded-lg bg-white px-4 py-2 text-black"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CreatePromptModal