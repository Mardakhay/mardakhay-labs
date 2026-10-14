import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  createPrompt,
  createPrompts,
  deletePrompt,
  deletePrompts,
  favoritePrompts,
  togglePromptFavorite,
  updatePrompt,
  updatePromptCategories,
  type Prompt,
  type PromptInput,
} from '../api/prompts'
import { addActivity } from '../lib/activityLog'
import {
  applyPromptInputToPrompt,
  removePromptFromList,
  rollbackPromptInList,
  rollbackPromptListSnapshotIfUnchanged,
  replacePromptInList,
  sortPromptsByUpdatedAtDesc,
  togglePromptFavoriteInList,
} from '../lib/promptCache'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'
import { getPromptsQueryKey, promptsQueryBaseKey } from './usePromptsQuery'

type PromptCacheContext = {
  promptId: number
  previousPrompt?: Prompt
  optimisticPrompt?: Prompt
}

type DeletePromptCacheContext = {
  previousPrompts?: Prompt[]
  optimisticPrompts?: Prompt[]
  deletedPrompt?: Prompt
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
      queryClient.setQueryData<Prompt[]>(promptsQueryKey, (current) =>
        sortPromptsByUpdatedAtDesc([createdPrompt, ...(current ?? [])])
      )
      addActivity(user?.id, 'Created prompt', createdPrompt.title)
      showNotification('Prompt added successfully!', 'success')
    },
    onError: (mutationError: Error) => {
      showNotification(mutationError.message || 'Failed to create prompt.', 'error')
    },
    onSettled: invalidatePrompts,
  })

  const createPromptsMutation = useMutation({
    mutationFn: createPrompts,
    onSuccess: (createdPrompts) => {
      queryClient.setQueryData<Prompt[]>(promptsQueryKey, (current) =>
        sortPromptsByUpdatedAtDesc([...(createdPrompts ?? []), ...(current ?? [])])
      )
      addActivity(
        user?.id,
        'Imported prompts',
        `${createdPrompts.length} prompt${createdPrompts.length === 1 ? '' : 's'}`
      )
      showNotification(
        `Imported ${createdPrompts.length} prompt${createdPrompts.length === 1 ? '' : 's'}.`,
        'success'
      )
    },
    onError: (mutationError: Error) => {
      showNotification(mutationError.message || 'Failed to import prompts.', 'error')
    },
    onSettled: invalidatePrompts,
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
      const previousPrompt = previousPrompts?.find((prompt) => prompt.id === promptId)
      let optimisticPrompt: Prompt | undefined

      queryClient.setQueryData<Prompt[]>(promptsQueryKey, (current) =>
        sortPromptsByUpdatedAtDesc(
          (current ?? []).map((prompt) => {
            if (prompt.id !== promptId) return prompt

            optimisticPrompt = applyPromptInputToPrompt(prompt, input)
            return optimisticPrompt
          })
        )
      )

      return { promptId, previousPrompt, optimisticPrompt }
    },
    onError: (mutationError: Error, _variables, context) => {
      if (context?.previousPrompt && context.optimisticPrompt) {
        const { promptId: rollbackPromptId, previousPrompt, optimisticPrompt } = context
        queryClient.setQueryData<Prompt[]>(promptsQueryKey, (current) =>
          rollbackPromptInList(
            current,
            rollbackPromptId,
            previousPrompt,
            optimisticPrompt
          )
        )
      }

      showNotification(mutationError.message || 'Failed to update prompt.', 'error')
    },
    onSuccess: (updatedPrompt) => {
      queryClient.setQueryData<Prompt[]>(promptsQueryKey, (current) =>
        replacePromptInList(current, updatedPrompt)
      )
      addActivity(user?.id, 'Updated prompt', updatedPrompt.title)
      showNotification('Prompt updated successfully!', 'success')
    },
    onSettled: invalidatePrompts,
  })

  const deletePromptMutation = useMutation<void, Error, number, DeletePromptCacheContext>({
    mutationFn: deletePrompt,
    onMutate: async (promptId) => {
      await queryClient.cancelQueries({ queryKey: promptsQueryKey })
      const previousPrompts = queryClient.getQueryData<Prompt[]>(promptsQueryKey)
      const deletedPrompt = previousPrompts?.find((prompt) => prompt.id === promptId)
      const optimisticPrompts = queryClient.setQueryData<Prompt[]>(promptsQueryKey, (current) =>
        removePromptFromList(current, promptId)
      )

      return { previousPrompts, optimisticPrompts, deletedPrompt }
    },
    onError: (mutationError: Error, _promptId, context) => {
      const currentPrompts = queryClient.getQueryData<Prompt[]>(promptsQueryKey)
      const rollbackPrompts = rollbackPromptListSnapshotIfUnchanged(
        currentPrompts,
        context?.previousPrompts,
        context?.optimisticPrompts
      )

      if (rollbackPrompts !== currentPrompts) {
        queryClient.setQueryData(promptsQueryKey, rollbackPrompts)
      }

      showNotification(mutationError.message || 'Failed to delete prompt.', 'error')
    },
    onSuccess: (_result, _promptId, context) => {
      if (context?.deletedPrompt) {
        addActivity(user?.id, 'Deleted prompt', context.deletedPrompt.title)
      }
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
      const previousPrompt = previousPrompts?.find((prompt) => prompt.id === promptId)
      let optimisticPrompt: Prompt | undefined

      queryClient.setQueryData<Prompt[]>(promptsQueryKey, (current) => {
        const nextPrompts = togglePromptFavoriteInList(current, promptId)
        optimisticPrompt = nextPrompts.find((prompt) => prompt.id === promptId)
        return nextPrompts
      })

      return { promptId, previousPrompt, optimisticPrompt }
    },
    onError: (mutationError: Error, _variables, context) => {
      if (context?.previousPrompt && context.optimisticPrompt) {
        const { promptId: rollbackPromptId, previousPrompt, optimisticPrompt } = context
        queryClient.setQueryData<Prompt[]>(promptsQueryKey, (current) =>
          rollbackPromptInList(
            current,
            rollbackPromptId,
            previousPrompt,
            optimisticPrompt
          )
        )
      }

      showNotification(mutationError.message || 'Failed to update prompt.', 'error')
    },
    onSuccess: (updatedPrompt) => {
      queryClient.setQueryData<Prompt[]>(promptsQueryKey, (current) =>
        replacePromptInList(current, updatedPrompt)
      )
      addActivity(
        user?.id,
        updatedPrompt.is_favorite ? 'Favorited prompt' : 'Unfavorited prompt',
        updatedPrompt.title
      )
      showNotification('Prompt favorites updated.', 'success')
    },
    onSettled: invalidatePrompts,
  })

  const bulkFavoriteMutation = useMutation({
    mutationFn: favoritePrompts,
    onSuccess: (_result, promptIds) => {
      queryClient.setQueryData<Prompt[]>(promptsQueryKey, (current) =>
        (current ?? []).map((prompt) =>
          promptIds.includes(prompt.id)
            ? { ...prompt, is_favorite: true, updated_at: new Date().toISOString() }
            : prompt
        )
      )
      addActivity(
        user?.id,
        'Favorited prompts',
        `${promptIds.length} prompt${promptIds.length === 1 ? '' : 's'}`
      )
      showNotification('Selected prompts added to favorites.', 'success')
    },
    onError: (mutationError: Error) => {
      showNotification(mutationError.message || 'Failed to favorite prompts.', 'error')
    },
    onSettled: invalidatePrompts,
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: deletePrompts,
    onSuccess: (_result, promptIds) => {
      queryClient.setQueryData<Prompt[]>(promptsQueryKey, (current) =>
        (current ?? []).filter((prompt) => !promptIds.includes(prompt.id))
      )
      addActivity(
        user?.id,
        'Deleted prompts',
        `${promptIds.length} prompt${promptIds.length === 1 ? '' : 's'}`
      )
      showNotification('Selected prompts deleted.', 'success')
    },
    onError: (mutationError: Error) => {
      showNotification(mutationError.message || 'Failed to delete prompts.', 'error')
    },
    onSettled: invalidatePrompts,
  })

  const bulkCategoryMutation = useMutation({
    mutationFn: ({
      promptIds,
      category,
    }: {
      promptIds: number[]
      category: Prompt['category'] | null
    }) => updatePromptCategories(promptIds, category),
    onSuccess: (_result, { promptIds, category }) => {
      queryClient.setQueryData<Prompt[]>(promptsQueryKey, (current) =>
        (current ?? []).map((prompt) =>
          promptIds.includes(prompt.id)
            ? { ...prompt, category: category ?? undefined, updated_at: new Date().toISOString() }
            : prompt
        )
      )
      addActivity(
        user?.id,
        'Updated prompt categories',
        `${promptIds.length} prompt${promptIds.length === 1 ? '' : 's'}`
      )
      showNotification('Selected prompt categories updated.', 'success')
    },
    onError: (mutationError: Error) => {
      showNotification(mutationError.message || 'Failed to update prompt categories.', 'error')
    },
    onSettled: invalidatePrompts,
  })

  function clearPromptQueries() {
    queryClient.removeQueries({ queryKey: promptsQueryBaseKey })
  }

  return {
    createPromptMutation,
    createPromptsMutation,
    updatePromptMutation,
    deletePromptMutation,
    favoriteMutation,
    bulkFavoriteMutation,
    bulkDeleteMutation,
    bulkCategoryMutation,
    clearPromptQueries,
  }
}
