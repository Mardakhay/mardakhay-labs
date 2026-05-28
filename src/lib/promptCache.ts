import type { Prompt, PromptInput } from '../api/prompts'
import { derivePromptTitle } from './promptFormatting'
import { extractHashtags } from './promptMetadata'

export function applyPromptInputToPrompt(prompt: Prompt, input: PromptInput): Prompt {
  const content = input.content.trim()
  const title = input.title.trim() || derivePromptTitle(content)

  return {
    ...prompt,
    title,
    content,
    ai_target: input.aiTarget,
    category: input.category,
    hashtags: extractHashtags(content),
  }
}

export function togglePromptFavoriteInList(
  prompts: Prompt[] | undefined,
  promptId: number
) {
  return (prompts ?? []).map((prompt) =>
    prompt.id === promptId
      ? {
          ...prompt,
          is_favorite: !prompt.is_favorite,
        }
      : prompt
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
  return (prompts ?? []).map((prompt) =>
    prompt.id === nextPrompt.id ? nextPrompt : prompt
  )
}
