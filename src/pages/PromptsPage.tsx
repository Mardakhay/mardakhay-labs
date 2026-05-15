import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import CreatePromptModal from '../components/CreatePromptModal'
import DashboardCard from '../components/DashboardCard'
import { useTheme } from '../context/ThemeContext'
import { useNotificationStore } from '../stores/notificationStore'
import {
  createPrompt,
  deletePrompt,
  getPrompts,
  type Prompt,
} from '../api/prompts'

function PromptsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { showNotification } = useNotificationStore()
  const queryClient = useQueryClient()

  const {
    data: prompts = [],
    isLoading,
    error,
  } = useQuery<Prompt[], Error>({
    queryKey: ['prompts'],
    queryFn: getPrompts,
  })

  const createPromptMutation = useMutation({
    mutationFn: createPrompt,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['prompts'],
      })
      showNotification('Prompt added successfully!')
    },
    onError: (mutationError: Error) => {
      showNotification(
        mutationError.message || 'Failed to create prompt.'
      )
    },
  })

  const deletePromptMutation = useMutation({
    mutationFn: deletePrompt,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['prompts'],
      })
      showNotification('Prompt deleted successfully!')
    },
    onError: (mutationError: Error) => {
      showNotification(
        mutationError.message || 'Failed to delete prompt.'
      )
    },
  })

  async function handleAddPrompt(prompt: string) {
    await createPromptMutation.mutateAsync(prompt)
  }

  function handleDeletePrompt(promptId: number) {
    deletePromptMutation.mutate(promptId)
  }

  if (isLoading) {
    return (
      <div
        className={`rounded-2xl border p-6 ${
          isDark
            ? 'border-zinc-800 bg-zinc-900 text-white'
            : 'border-zinc-200 bg-white text-zinc-950 shadow-sm'
        }`}
      >
        Loading prompts...
      </div>
    )
  }

  if (error) {
    return (
      <div className='rounded-2xl border border-red-900 bg-red-950 p-6 text-red-200'>
        {error.message}
      </div>
    )
  }

  const promptItemClassName = isDark
    ? 'bg-zinc-800 text-white'
    : 'bg-zinc-100 text-zinc-950'

  const emptyStateClassName = isDark
    ? 'border-zinc-700 text-zinc-400'
    : 'border-zinc-300 text-zinc-500'

  return (
    <DashboardCard title='All Prompts'>
      <div className='space-y-4'>
        <div className='flex justify-end'>
          <CreatePromptModal onAddPrompt={handleAddPrompt} />
        </div>

        {prompts.length === 0 ? (
          <div className={`rounded-lg border border-dashed px-4 py-6 text-center ${emptyStateClassName}`}>
            No prompts yet. Add the first one.
          </div>
        ) : (
          prompts.map((prompt) => (
            <div
              key={prompt.id}
              className={`flex items-start justify-between gap-4 rounded-lg p-4 ${promptItemClassName}`}
            >
              <div className='min-w-0'>
                <span className='block break-words'>
                  {prompt.content}
                </span>
                <span className='mt-2 block text-xs text-zinc-500'>
                  {new Date(prompt.created_at).toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => handleDeletePrompt(prompt.id)}
                disabled={deletePromptMutation.isPending}
                className='shrink-0 rounded-md bg-red-500 px-3 py-1 text-sm text-white transition-colors hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60'
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </DashboardCard>
  )
}

export default PromptsPage
