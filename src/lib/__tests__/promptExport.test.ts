import { describe, expect, it } from 'vitest'

import type { Prompt } from '../../api/prompts'
import { MAX_IMPORT_FILE_SIZE_BYTES, validatePromptImportFileSize } from '../promptImportLimits'
import { extractHashtags } from '../promptMetadata'
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
    content: 'Draft a launch email for a product update. #launch #email',
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
        isFavorite: true,
      })
    )

    expect(imported).toEqual([
      {
        title: 'Imported prompt',
        content: 'Use this prompt for testing.',
        aiTarget: 'Claude',
        category: 'Coding',
        isFavorite: true,
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
      isFavorite: false,
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

  it('preserves supported metadata from a JSON export during import', () => {
    const imported = parsePromptImport(promptToJson(prompt))

    expect(imported).toHaveLength(1)
    expect(imported[0]).toMatchObject({
      title: prompt.title,
      content: prompt.content,
      aiTarget: prompt.ai_target,
      category: prompt.category,
      isFavorite: prompt.is_favorite,
    })
    expect(extractHashtags(imported[0]!.content)).toEqual(
      prompt.hashtags.slice().sort((a, b) => a.localeCompare(b))
    )
    expect(imported[0]).not.toHaveProperty('createdAt')
  })

  it('rejects malformed JSON with a helpful error', () => {
    expect(() => parsePromptImport('{not-json')).toThrow('Import file is not valid JSON.')
  })

  it('rejects unsupported AI targets and categories at runtime', () => {
    expect(() =>
      parsePromptImport(JSON.stringify({ content: 'Prompt', aiTarget: 'Unknown AI' }))
    ).toThrow('Prompt 1 has an invalid AI target.')

    expect(() =>
      parsePromptImport(JSON.stringify({ content: 'Prompt', category: 'Unknown category' }))
    ).toThrow('Prompt 1 has an invalid category.')
  })

  it('rejects incorrectly typed import metadata', () => {
    expect(() =>
      parsePromptImport(JSON.stringify({ content: 'Prompt', title: 123 }))
    ).toThrow('Prompt 1 has an invalid title.')

    expect(() =>
      parsePromptImport(JSON.stringify({ content: 'Prompt', isFavorite: 'yes' }))
    ).toThrow('Prompt 1 has an invalid favorite value.')
  })

  it('rejects empty imports and imports over the supported prompt count', () => {
    expect(() => parsePromptImport('[]')).toThrow('Import file must contain at least one prompt.')
    const tooManyPrompts = Array.from({ length: 501 }, (_, index) => ({
      title: `Prompt ${index + 1}`,
      content: 'Prompt content',
    }))

    expect(() => parsePromptImport(JSON.stringify(tooManyPrompts))).toThrow(
      'You can import up to 500 prompts at a time.'
    )
  })

  it('accepts import files up to the size limit and rejects larger files', () => {
    expect(() => validatePromptImportFileSize(MAX_IMPORT_FILE_SIZE_BYTES)).not.toThrow()
    expect(() => validatePromptImportFileSize(MAX_IMPORT_FILE_SIZE_BYTES + 1)).toThrow(
      'Import file is too large. Choose a JSON file no larger than 5 MiB.'
    )
  })
})
