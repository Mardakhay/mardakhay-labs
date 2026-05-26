export function derivePromptTitle(content: string) {
  const firstLine = content.trim().split('\n')[0]?.trim() ?? ''

  if (!firstLine) {
    return 'Untitled prompt'
  }

  return firstLine.length > 58 ? `${firstLine.slice(0, 58)}…` : firstLine
}

export function formatPromptPreview(content: string, maxLength: number) {
  const clean = content.trim().replace(/\s+/g, ' ')

  if (clean.length <= maxLength) {
    return clean
  }

  return `${clean.slice(0, maxLength)}…`
}

export function countPromptWords(content: string) {
  return content.trim().split(/\s+/).filter(Boolean).length
}
