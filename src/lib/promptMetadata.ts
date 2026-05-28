export const aiTargetOptions = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Grok',
] as const

export const promptCategoryOptions = [
  'Writing',
  'Coding',
  'Research',
  'Image',
  'Video',
  'Marketing',
  'Automation',
] as const

export type AiTarget = (typeof aiTargetOptions)[number]
export type PromptCategory = (typeof promptCategoryOptions)[number]

export type PromptMetadata = {
  aiTarget?: AiTarget
  category?: PromptCategory
}

const metadataPattern = /\n?<!--\s*mardakhay:metadata\s+({[\s\S]*?})\s*-->\s*$/i

function isAiTarget(value: unknown): value is AiTarget {
  return typeof value === 'string' && aiTargetOptions.includes(value as AiTarget)
}

function isPromptCategory(value: unknown): value is PromptCategory {
  return (
    typeof value === 'string' &&
    promptCategoryOptions.includes(value as PromptCategory)
  )
}

export function parsePromptContent(rawContent: string) {
  const match = rawContent.match(metadataPattern)

  if (!match) {
    return {
      content: rawContent.trim(),
      metadata: {},
    }
  }

  try {
    const parsed = JSON.parse(match[1]) as Record<string, unknown>

    return {
      content: rawContent.replace(metadataPattern, '').trim(),
      metadata: {
        aiTarget: isAiTarget(parsed.aiTarget) ? parsed.aiTarget : undefined,
        category: isPromptCategory(parsed.category) ? parsed.category : undefined,
      },
    }
  } catch {
    return {
      content: rawContent.replace(metadataPattern, '').trim(),
      metadata: {},
    }
  }
}

export function serializePromptContent(
  content: string,
  metadata: PromptMetadata = {}
) {
  const cleanContent = content.trim()
  const cleanMetadata = {
    aiTarget: metadata.aiTarget,
    category: metadata.category,
  }
  const hasMetadata = Boolean(cleanMetadata.aiTarget || cleanMetadata.category)

  if (!hasMetadata) {
    return cleanContent
  }

  return `${cleanContent}\n\n<!-- mardakhay:metadata ${JSON.stringify(cleanMetadata)} -->`
}

export function extractHashtags(content: string) {
  const matches = content.match(/(^|\s)#([a-zA-Z][\w-]{0,31})\b/g) ?? []

  return Array.from(
    new Set(
      matches
        .map((match) => match.trim().replace(/^#/, '').toLowerCase())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b))
}
