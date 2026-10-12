import { describe, expect, it } from 'vitest'

import {
  extractHashtags,
  parsePromptContent,
  serializePromptContent,
} from '../promptMetadata'

describe('promptMetadata', () => {
  describe('extractHashtags', () => {
    it('extracts unique lowercase hashtags from content', () => {
      expect(extractHashtags('Use #React for #AI and #react again')).toEqual([
        'ai',
        'react',
      ])
    })

    it('returns an empty array when there are no hashtags', () => {
      expect(extractHashtags('plain text only')).toEqual([])
    })
  })

  describe('serializePromptContent', () => {
    it('returns clean content without metadata when none is provided', () => {
      expect(serializePromptContent('  hello world  ')).toBe('hello world')
    })

    it('appends serialized metadata when AI target or category is present', () => {
      const serialized = serializePromptContent('Write a prompt', {
        aiTarget: 'Claude',
        category: 'Writing',
      })

      expect(serialized).toContain('Write a prompt')
      expect(serialized).toContain('mardakhay:metadata')
      expect(serialized).toContain('"aiTarget":"Claude"')
      expect(serialized).toContain('"category":"Writing"')
    })
  })

  describe('parsePromptContent', () => {
    it('parses embedded metadata and strips the metadata block', () => {
      const raw = serializePromptContent('Build a tool', {
        aiTarget: 'ChatGPT',
        category: 'Coding',
      })

      const parsed = parsePromptContent(raw)

      expect(parsed.content).toBe('Build a tool')
      expect(parsed.metadata).toEqual({
        aiTarget: 'ChatGPT',
        category: 'Coding',
      })
    })

    it('returns the trimmed content when there is no metadata block', () => {
      expect(parsePromptContent('  plain prompt  ')).toEqual({
        content: 'plain prompt',
        metadata: {},
      })
    })
  })
})
