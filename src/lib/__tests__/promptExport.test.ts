import { describe, expect, it, vi } from 'vitest'

import type { Prompt } from '../../api/prompts'
import {
  parsePromptImport,
  promptToJson,
  promptToMarkdown,
  promptsToJson,
  promptsToMarkdown,
} from '../promptExport'

describe('promptExport', () => {
  const prompt: Prompt = {
    id: 1,
    title: 'Write a launch email',
    content: 'Draft a launch email for a product update.',
    created_at: '2026-06-04T08:00:00.000Z',
    updated_at: '2026-06-04T09:00:00.000Z',
    user_id: 'user-123',
    is_favorite: true,
    ai_target: 'ChatGPT',
    category: 'Marketing',
    hashtags: ['launch', 'email'],
  }

  it('formats a prompt as markdown', () => {
    const markdown = promptToMarkdown(prompt)

    expect(markdown).toContain('# Write a launch email')
    expect(markdown).toContain('AI target: ChatGPT')
    expect(markdown).toContain('Category: Marketing')
    expect(markdown).toContain('Tags: #launch #email')
    expect(markdown).toContain(prompt.content)
  })

  it('serializes a prompt as JSON', () => {
    expect(JSON.parse(promptToJson(prompt))).toEqual({
      title: prompt.title,
      content: prompt.content,
      aiTarget: prompt.ai_target,
      category: prompt.category,
      hashtags: prompt.hashtags,
      isFavorite: prompt.is_favorite,
      createdAt: prompt.created_at,
    })
  })

  it('joins multiple prompts into markdown export format', () => {
    const markdown = promptsToMarkdown([prompt, { ...prompt, id: 2, title: 'Second prompt' }])

    expect(markdown).toContain('# Write a launch email')
    expect(markdown).toContain('# Second prompt')
    expect(markdown).toContain('\n\n---\n\n')
  })

  it('exports multiple prompts as a JSON array', () => {
    const json = promptsToJson([prompt])
    expect(JSON.parse(json)).toEqual([JSON.parse(promptToJson(prompt))])
  })

  it('parses a single prompt import payload', () => {
    const imported = parsePromptImport(
      JSON.stringify({
        title: 'Imported prompt',
        content: 'Use this prompt for testing.',
        aiTarget: 'Claude',
        category: 'Coding',
      })
    )

    expect(imported).toEqual([
      {
        title: 'Imported prompt',
        content: 'Use this prompt for testing.',
        aiTarget: 'Claude',
        category: 'Coding',
      },
    ])
  })

  it('parses an array import payload', () => {
    const imported = parsePromptImport(
      JSON.stringify([
        { title: 'One', content: 'First' },
        { title: 'Two', content: 'Second', aiTarget: 'Gemini' },
      ])
    )

    expect(imported).toHaveLength(2)
    expect(imported[1]).toEqual({
      title: 'Two',
      content: 'Second',
      aiTarget: 'Gemini',
      category: undefined,
    })
  })

  it('rejects invalid prompt items during import', () => {
    expect(() => parsePromptImport(JSON.stringify([null]))).toThrow(
      'Import file contains an invalid prompt item.'
    )
  })

  it('rejects imported prompts without content', () => {
    expect(() =>
      parsePromptImport(JSON.stringify([{ title: 'Missing content', content: '   ' }]))
    ).toThrow('Every imported prompt needs content.')
  })
})
