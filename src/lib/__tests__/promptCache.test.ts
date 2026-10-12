import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Prompt, PromptInput } from '../../api/prompts'
import {
  applyPromptInputToPrompt,
  removePromptFromList,
  replacePromptInList,
  sortPromptsByUpdatedAtDesc,
  togglePromptFavoriteInList,
} from '../promptCache'

describe('promptCache', () => {
  const prompt: Prompt = {
    id: 1,
    title: 'Original title',
    content: 'Original content',
    created_at: '2026-06-04T08:00:00.000Z',
    updated_at: '2026-06-04T09:00:00.000Z',
    user_id: 'user-123',
    is_favorite: false,
    ai_target: 'ChatGPT',
    category: 'Writing',
    hashtags: ['original'],
  }

  const promptInput: PromptInput = {
    title: '',
    content: '  New content with #React tag  ',
    aiTarget: 'Claude',
    category: 'Coding',
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-04T10:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('sorts prompts by updated_at descending', () => {
    const sorted = sortPromptsByUpdatedAtDesc([
      { ...prompt, id: 2, updated_at: '2026-06-04T08:30:00.000Z' },
      prompt,
    ])

    expect(sorted.map((item) => item.id)).toEqual([1, 2])
  })

  it('applies prompt input to an existing prompt and refreshes the timestamp', () => {
    expect(applyPromptInputToPrompt(prompt, promptInput)).toEqual({
      ...prompt,
      title: 'New content with #React tag',
      content: 'New content with #React tag',
      updated_at: '2026-06-04T10:00:00.000Z',
      ai_target: 'Claude',
      category: 'Coding',
      hashtags: ['react'],
    })
  })

  it('toggles favorites across a prompt list and refreshes ordering fields', () => {
    const toggled = togglePromptFavoriteInList([prompt], 1)

    expect(toggled[0]).toEqual({
      ...prompt,
      is_favorite: true,
      updated_at: '2026-06-04T10:00:00.000Z',
    })
  })

  it('removes a prompt from a list', () => {
    const removed = removePromptFromList([prompt, { ...prompt, id: 2 }], 1)

    expect(removed).toHaveLength(1)
    expect(removed[0]?.id).toBe(2)
  })

  it('replaces a prompt in a list and keeps sort order', () => {
    const nextPrompt: Prompt = {
      ...prompt,
      title: 'Updated title',
      content: 'Updated content',
      updated_at: '2026-06-04T11:00:00.000Z',
    }

    const replaced = replacePromptInList([prompt], nextPrompt)

    expect(replaced).toEqual([nextPrompt])
  })
})
