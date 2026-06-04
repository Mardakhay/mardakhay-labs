import type { Prompt, PromptInput } from '../api/prompts'
import { derivePromptTitle } from './promptFormatting'
import { extractHashtags } from './promptMetadata'

function getPromptTimestamp(prompt: Pick<Prompt, 'created_at' | 'updated_at'>) {
  return new Date(prompt.updated_at ?? prompt.created_at).getTime()
}

export function sortPromptsByUpdatedAtDesc<T extends Pick<Prompt, 'created_at' | 'updated_at'>>(prompts: T[] | undefined) {
  return (prompts ?? []).slice().sort((a, b) => getPromptTimestamp(b) - getPromptTimestamp(a))
}

export function applyPromptInputToPrompt(prompt: Prompt, input: PromptInput): Prompt {
  const content = input.content.trim()
  const title = input.title.trim() || derivePromptTitle(content)

  return {
    ...prompt,
    title,
    content,
    updated_at: new Date().toISOString(),
    ai_target: input.aiTarget,
    category: input.category,
    hashtags: extractHashtags(content),
  }
}

export function togglePromptFavoriteInList(
  prompts: Prompt[] | undefined,
  promptId: number
) {
  return sortPromptsByUpdatedAtDesc(
    (prompts ?? []).map((prompt) =>
      prompt.id === promptId
        ? {
            ...prompt,
            is_favorite: !prompt.is_favorite,
            updated_at: new Date().toISOString(),
          }
        : prompt
    )
  )
}

export function removePromptFromList(
  prompts: Prompt[] | undefined,
  promptId: number
) {
  return (prompts ?? []).filter((prompt) => prompt.id !== promptId)
}

export function replacePromptInList(
  prompts: Prompt[] | undefined,
  nextPrompt: Prompt
) {
  return sortPromptsByUpdatedAtDesc(
    (prompts ?? []).map((prompt) =>
      prompt.id === nextPrompt.id ? nextPrompt : prompt
    )
  )
}
