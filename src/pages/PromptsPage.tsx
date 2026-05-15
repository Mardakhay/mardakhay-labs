import DashboardCard from '../components/DashboardCard'
import { useNotificationStore } from '../stores/notificationStore'

type PromptsPageProps = {
  prompts: string[]
  newPrompt: string
  setNewPrompt: (value: string) => void
  handleAddPrompt: () => void
  handleDeletePrompt: (prompt: string) => void
}

function PromptsPage({
  prompts,
  newPrompt,
  setNewPrompt,
  handleAddPrompt,
  handleDeletePrompt,
}: PromptsPageProps) {

  const { showNotification } = useNotificationStore()
  
  return (
    <DashboardCard title="All Prompts">
      <div className="space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter new prompt..."
            value={newPrompt}
            onChange={(event) =>
              setNewPrompt(event.target.value)
            }
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 outline-none"
          />

          <button
            onClick={() => {
              handleAddPrompt()

              showNotification(
                'Prompt added successfully!'
              )
            }}
            className="rounded-lg bg-white px-4 py-2 text-black"
          >
            Add
          </button>
        </div>

        {prompts.map((prompt) => (
          <div
            key={prompt}
            className="flex items-center justify-between rounded-lg bg-zinc-800 p-4"
          >
            <span>{prompt}</span>

            <button
              onClick={() =>
                handleDeletePrompt(prompt)
              }
              className="rounded-md bg-red-500 px-3 py-1 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}

export default PromptsPage