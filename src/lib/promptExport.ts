import type { Prompt, PromptImportInput } from '../api/prompts'
import { MAX_PROMPT_IMPORT_COUNT } from './promptImportLimits'
import {
  aiTargetOptions,
  promptCategoryOptions,
  type AiTarget,
  type PromptCategory,
} from './promptMetadata'

export function promptToMarkdown(prompt: Prompt) {
  const metadata = [
    prompt.ai_target ? `AI target: ${prompt.ai_target}` : null,
    prompt.category ? `Category: ${prompt.category}` : null,
    prompt.hashtags.length ? `Tags: ${prompt.hashtags.map((tag) => `#${tag}`).join(' ')}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return [`# ${prompt.title}`, metadata, prompt.content]
    .filter(Boolean)
    .join('\n\n')
}

export function promptToJson(prompt: Prompt) {
  return JSON.stringify(
    {
      title: prompt.title,
      content: prompt.content,
      aiTarget: prompt.ai_target,
      category: prompt.category,
      hashtags: prompt.hashtags,
      isFavorite: prompt.is_favorite,
      createdAt: prompt.created_at,
    },
    null,
    2
  )
}

export function promptsToMarkdown(prompts: Prompt[]) {
  return prompts.map(promptToMarkdown).join('\n\n---\n\n')
}

export function promptsToJson(prompts: Prompt[]) {
  return JSON.stringify(prompts.map((prompt) => JSON.parse(promptToJson(prompt))), null, 2)
}

export function downloadTextFile(filename: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = value
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

function parseOptionalEnum<Value extends string>(
  value: unknown,
  options: readonly Value[],
  fieldName: string,
  promptNumber: number
): Value | undefined {
  if (value === undefined || value === null) {
    return undefined
  }

  if (typeof value !== 'string' || !options.includes(value as Value)) {
    throw new Error(`Prompt ${promptNumber} has an invalid ${fieldName}.`)
  }

  return value as Value
}

export function parsePromptImport(raw: string): PromptImportInput[] {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw) as unknown
  } catch {
    throw new Error('Import file is not valid JSON.')
  }

  const items = Array.isArray(parsed) ? parsed : [parsed]

  if (items.length === 0) {
    throw new Error('Import file must contain at least one prompt.')
  }

  if (items.length > MAX_PROMPT_IMPORT_COUNT) {
    throw new Error(`You can import up to ${MAX_PROMPT_IMPORT_COUNT} prompts at a time.`)
  }

  return items.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error('Import file contains an invalid prompt item.')
    }

    const record = item as Record<string, unknown>

    if (
      record.title !== undefined &&
      record.title !== null &&
      typeof record.title !== 'string'
    ) {
      throw new Error(`Prompt ${index + 1} has an invalid title.`)
    }

    const title = typeof record.title === 'string' ? record.title : ''
    const content = typeof record.content === 'string' ? record.content : ''

    if (!content.trim()) {
      throw new Error('Every imported prompt needs content.')
    }

    const aiTarget = parseOptionalEnum<AiTarget>(
      record.aiTarget,
      aiTargetOptions,
      'AI target',
      index + 1
    )
    const category = parseOptionalEnum<PromptCategory>(
      record.category,
      promptCategoryOptions,
      'category',
      index + 1
    )

    if (
      record.isFavorite !== undefined &&
      record.isFavorite !== null &&
      typeof record.isFavorite !== 'boolean'
    ) {
      throw new Error(`Prompt ${index + 1} has an invalid favorite value.`)
    }

    return {
      title,
      content,
      aiTarget,
      category,
      isFavorite: record.isFavorite === true,
    }
  })
}
