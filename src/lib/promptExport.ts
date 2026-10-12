import type { Prompt, PromptInput } from '../api/prompts'

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

export function parsePromptImport(raw: string): PromptInput[] {
  const parsed = JSON.parse(raw) as unknown
  const items = Array.isArray(parsed) ? parsed : [parsed]

  return items.map((item) => {
    if (!item || typeof item !== 'object') {
      throw new Error('Import file contains an invalid prompt item.')
    }

    const record = item as Record<string, unknown>
    const title = typeof record.title === 'string' ? record.title : ''
    const content = typeof record.content === 'string' ? record.content : ''

    if (!content.trim()) {
      throw new Error('Every imported prompt needs content.')
    }

    return {
      title,
      content,
      aiTarget: typeof record.aiTarget === 'string' ? record.aiTarget as PromptInput['aiTarget'] : undefined,
      category: typeof record.category === 'string' ? record.category as PromptInput['category'] : undefined,
    }
  })
}
