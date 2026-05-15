import CreatePromptModal from '../components/CreatePromptModal'
import DashboardCard from '../components/DashboardCard'
import { useNotificationStore } from '../stores/notificationStore'

type PromptsPageProps = {
  prompts: string[]
  handleAddPrompt: (
    prompt: string
  ) => void
  handleDeletePrompt: (prompt: string) => void
}

function PromptsPage({
  prompts,
  handleAddPrompt,
  handleDeletePrompt,
}: PromptsPageProps) {
  const { showNotification } = useNotificationStore()

  return (
    <DashboardCard title='All Prompts'>
      <div className='space-y-3'>
        <div className='flex justify-end'>
          <CreatePromptModal
            onAddPrompt={(prompt) => {
              handleAddPrompt(prompt)

              showNotification('Prompt added successfully!')
            }}
          />
        </div>

        {prompts.map((prompt, index) => (
          <div
            key={`${prompt}-${index}`}
            className='flex items-center justify-between rounded-lg bg-zinc-800 p-4'
          >
            <span>{prompt}</span>

            <button
              onClick={() => handleDeletePrompt(prompt)}
              className='rounded-md bg-red-500 px-3 py-1 text-sm'
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
