import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, Sparkles } from 'lucide-react'

import {
  deletePrompt,
  getPrompts,
  togglePromptFavorite,
  updatePrompt,
  type Prompt,
  type PromptInput,
} from '../api/prompts'
import DashboardCard from '../components/DashboardCard'
import PromptCard from '../components/PromptCard'
import { useNotificationStore } from '../stores/notificationStore'

function FavoritesPage() {
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

  const favoritePrompts = prompts.filter((prompt) => prompt.is_favorite)

  const updatePromptMutation = useMutation({
    mutationFn: ({ promptId, input }: { promptId: number; input: PromptInput }) =>
      updatePrompt(promptId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['prompts'] })
      showNotification('Prompt updated successfully!', 'success')
    },
    onError: (mutationError: Error) => {
      showNotification(mutationError.message || 'Failed to update prompt.', 'error')
    },
  })

  const deletePromptMutation = useMutation({
    mutationFn: deletePrompt,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['prompts'] })
      showNotification('Prompt deleted successfully!', 'success')
    },
    onError: (mutationError: Error) => {
      showNotification(mutationError.message || 'Failed to delete prompt.', 'error')
    },
  })

  const favoriteMutation = useMutation({
    mutationFn: ({
      promptId,
      isFavorite,
    }: {
      promptId: number
      isFavorite: boolean
    }) => togglePromptFavorite(promptId, isFavorite),
    onMutate: async ({ promptId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ['prompts'] })

      const previousPrompts = queryClient.getQueryData<Prompt[]>(['prompts'])

      queryClient.setQueryData<Prompt[]>(['prompts'], (current = []) =>
        current.map((prompt) =>
          prompt.id === promptId
            ? {
                ...prompt,
                is_favorite: !isFavorite,
              }
            : prompt,
        ),
      )

      return { previousPrompts }
    },
    onError: (mutationError: Error, _variables, context) => {
      if (context?.previousPrompts) {
        queryClient.setQueryData(['prompts'], context.previousPrompts)
      }

      showNotification(mutationError.message || 'Failed to update prompt.', 'error')
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['prompts'] })
    },
  })

  function handleUpdatePrompt(promptId: number, input: PromptInput) {
    updatePromptMutation.mutate({ promptId, input })
  }

  function handleDeletePrompt(promptId: number) {
    deletePromptMutation.mutate(promptId)
  }

  function handleToggleFavorite(promptId: number, isFavorite: boolean) {
    favoriteMutation.mutate({ promptId, isFavorite })
  }

  if (isLoading) {
    return (
      <DashboardCard title='Loading favorites'>
        <div className='h-40 animate-pulse rounded-3xl bg-white/[0.03]' />
      </DashboardCard>
    )
  }

  if (error) {
    return (
      <div className='rounded-3xl border border-red-500/20 bg-red-950/80 p-6 text-red-100'>
        {error.message}
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <section className='flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 sm:p-5'>
        <div className='min-w-0'>
          <p className='text-xs uppercase tracking-[0.22em] text-zinc-500 sm:tracking-[0.28em]'>
            Pinned assets
          </p>
          <h2 className='mt-2 text-xl font-semibold tracking-tight sm:text-2xl'>
            Favorite prompts
          </h2>
        </div>

        <div className='inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white'>
          <Heart className='h-4 w-4 fill-current text-violet-300' />
          {favoritePrompts.length}
        </div>
      </section>

      {favoritePrompts.length === 0 ? (
        <DashboardCard title='No favorites yet'>
          <div className='rounded-2xl border border-dashed border-zinc-700 px-6 py-12 text-center text-zinc-400'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-200'>
              <Sparkles className='h-5 w-5' />
            </div>
            <p className='text-base font-medium text-inherit'>
              Pin a prompt to build your favorites library.
            </p>
            <p className='mt-2 text-sm text-inherit'>
              Use the star button on any prompt to add it here.
            </p>
          </div>
        </DashboardCard>
      ) : (
        <div className='grid gap-4 xl:grid-cols-2'>
          {favoritePrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onDelete={handleDeletePrompt}
              onEdit={handleUpdatePrompt}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default FavoritesPage
