import { useQuery } from '@tanstack/react-query'

import { getPrompts, type Prompt } from '../api/prompts'
import { useAuthStore } from '../stores/authStore'

export const promptsQueryBaseKey = ['prompts'] as const

export function getPromptsQueryKey(userId: string | undefined) {
  return [...promptsQueryBaseKey, userId] as const
}

export function usePromptsQuery() {
  const { user } = useAuthStore()

  return useQuery<Prompt[], Error>({
    queryKey: getPromptsQueryKey(user?.id),
    queryFn: getPrompts,
    enabled: Boolean(user?.id),
  })
}
