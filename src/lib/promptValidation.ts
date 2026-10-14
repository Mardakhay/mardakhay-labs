export function getPromptContentValidationError(content: string): string | null {
  return content.trim() ? null : 'Prompt content is required.'
}
