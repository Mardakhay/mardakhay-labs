import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  createPrompt,
  deletePrompt,
  togglePromptFavorite,
  updatePrompt,
  type Prompt,
  type PromptInput,
} from '../api/prompts'
import { addActivity } from '../lib/activityLog'
import {
  applyPromptInputToPrompt,
  removePromptFromList,
  replacePromptInList,
  togglePromptFavoriteInList,
} from '../lib/promptCache'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'
import { getPromptsQueryKey, promptsQueryBaseKey } from './usePromptsQuery'

type PromptCacheContext = {
  previousPrompts?: Prompt[]
}

export function usePromptMutations() {
  const { user } = useAuthStore()
  const { showNotification } = useNotificationStore()
  const queryClient = useQueryClient()
  const promptsQueryKey = getPromptsQueryKey(user?.id)

  const invalidatePrompts = () => {
    void queryClient.invalidateQueries({ queryKey: promptsQueryKey })
  }

  const createPromptMutation = useMutation({
    mutationFn: createPrompt,
    onSuccess: (createdPrompt) => {
      queryClient.setQueryData<Prompt[]>(promptsQueryKey, (current) => [
        createdPrompt,
        ...(current ?? []),
      ])
      invalidatePrompts()
      addActivity('Created prompt', createdPrompt.title)
      showNotification('Prompt added successfully!', 'success')
    },
    onError: (mutationError: Error) => {
      showNotification(mutationError.message || 'Failed to create prompt.', 'error')
    },
  })

  const updatePromptMutation = useMutation<
    Prompt,
    Error,
    { promptId: number; input: PromptInput },
    PromptCacheContext
  >({
    mutationFn: ({ promptId, input }) => updatePrompt(promptId, input),
    onMutate: async ({ promptId, input }) => {
      await queryClient.cancelQueries({ queryKey: promptsQueryKey })
      const previousPrompts = queryClient.getQueryData<Prompt[]>(promptsQueryKey)

      queryClient.setQueryData<Prompt[]>(promptsQueryKey, (current) =>
        (current ?? []).map((prompt) =>
          prompt.id === promptId ? applyPromptInputToPrompt(prompt, input) : prompt
        )
      )

      return { previousPrompts }
    },
    onError: (mutationError: Error, _variables, context) => {
      if (context?.previousPrompts) {
        queryClient.setQueryData(promptsQueryKey, context.previousPrompts)
      }

      showNotification(mutationError.message || 'Failed to update prompt.', 'error')
    },
    onSuccess: (updatedPrompt) => {
      queryClient.setQueryData<Prompt[]>(promptsQueryKey, (current) =>
        replacePromptInList(current, updatedPrompt)
      )
      addActivity('Updated prompt', updatedPrompt.title)
      showNotification('Prompt updated successfully!', 'success')
    },
    onSettled: invalidatePrompts,
  })

  const deletePromptMutation = useMutation<void, Error, number, PromptCacheContext>({
    mutationFn: deletePrompt,
    onMutate: async (promptId) => {
      await queryClient.cancelQueries({ queryKey: promptsQueryKey })
      const previousPrompts = queryClient.getQueryData<Prompt[]>(promptsQueryKey)
      const deletedPrompt = previousPrompts?.find((prompt) => prompt.id === promptId)

      queryClient.setQueryData<Prompt[]>(promptsQueryKey, (current) =>
        removePromptFromList(current, promptId)
      )

      if (deletedPrompt) {
        addActivity('Deleted prompt', deletedPrompt.title)
      }

      return { previousPrompts }
    },
    onError: (mutationError: Error, _promptId, context) => {
      if (context?.previousPrompts) {
        queryClient.setQueryData(promptsQueryKey, context.previousPrompts)
      }

      showNotification(mutationError.message || 'Failed to delete prompt.', 'error')
    },
    onSuccess: () => {
      showNotification('Prompt deleted successfully!', 'success')
    },
    onSettled: invalidatePrompts,
  })

  const favoriteMutation = useMutation<
    Prompt,
    Error,
    { promptId: number; isFavorite: boolean },
    PromptCacheContext
  >({
    mutationFn: ({ promptId, isFavorite }) => togglePromptFavorite(promptId, isFavorite),
    onMutate: async ({ promptId }) => {
      await queryClient.cancelQueries({ queryKey: promptsQueryKey })
      const previousPrompts = queryClient.getQueryData<Prompt[]>(promptsQueryKey)

      queryClient.setQueryData<Prompt[]>(promptsQueryKey, (current) =>
        togglePromptFavoriteInList(current, promptId)
      )

      return { previousPrompts }
    },
    onError: (mutationError: Error, _variables, context) => {
      if (context?.previousPrompts) {
        queryClient.setQueryData(promptsQueryKey, context.previousPrompts)
      }

      showNotification(mutationError.message || 'Failed to update prompt.', 'error')
    },
    onSuccess: (updatedPrompt) => {
      queryClient.setQueryData<Prompt[]>(promptsQueryKey, (current) =>
        replacePromptInList(current, updatedPrompt)
      )
      addActivity(
        updatedPrompt.is_favorite ? 'Favorited prompt' : 'Unfavorited prompt',
        updatedPrompt.title
      )
      showNotification('Prompt favorites updated.', 'success')
    },
    onSettled: invalidatePrompts,
  })

  function clearPromptQueries() {
    queryClient.removeQueries({ queryKey: promptsQueryBaseKey })
  }

  return {
    createPromptMutation,
    updatePromptMutation,
    deletePromptMutation,
    favoriteMutation,
    clearPromptQueries,
  }
}
