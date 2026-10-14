import { describe, expect, it } from 'vitest'

import { getPromptContentValidationError } from '../promptValidation'

describe('getPromptContentValidationError', () => {
  it('rejects empty content', () => {
    expect(getPromptContentValidationError('')).toBe('Prompt content is required.')
  })

  it('rejects whitespace-only content', () => {
    expect(getPromptContentValidationError(' \n\t ')).toBe('Prompt content is required.')
  })

  it('accepts non-empty content', () => {
    expect(getPromptContentValidationError('Write a concise summary.')).toBeNull()
  })
})
