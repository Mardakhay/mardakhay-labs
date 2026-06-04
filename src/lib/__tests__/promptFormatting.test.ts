import { describe, expect, it } from 'vitest'

import {
  countPromptWords,
  derivePromptTitle,
  formatPromptPreview,
} from '../promptFormatting'

describe('promptFormatting', () => {
  describe('derivePromptTitle', () => {
    it('uses the first non-empty line as the title', () => {
      expect(derivePromptTitle('First line\nSecond line')).toBe('First line')
    })

    it('falls back to Untitled prompt when content is empty', () => {
      expect(derivePromptTitle('   \n\n')).toBe('Untitled prompt')
    })

    it('truncates long titles', () => {
      const longLine = 'a'.repeat(59)
      expect(derivePromptTitle(longLine)).toBe(`${'a'.repeat(58)}…`)
    })
  })

  describe('formatPromptPreview', () => {
    it('returns trimmed content when it fits', () => {
      expect(formatPromptPreview('  hello world  ', 20)).toBe('hello world')
    })

    it('truncates long content with an ellipsis', () => {
      expect(formatPromptPreview('hello there general kenobi', 11)).toBe('hello there…')
    })
  })

  describe('countPromptWords', () => {
    it('counts words in a string', () => {
      expect(countPromptWords('one two three')).toBe(3)
    })

    it('returns zero for empty content', () => {
      expect(countPromptWords('   ')).toBe(0)
    })
  })
})
