import { describe, expect, it } from 'vitest'

import { buildPromptDraftStorageKey } from '../storageKeys'

describe('buildPromptDraftStorageKey', () => {
  it('scopes an edit draft to the prompt ID and owning user', () => {
    expect(buildPromptDraftStorageKey(42, 'user-a'))
      .toBe('mardakhay-labs:draft:edit:42:user-a')
  })

  it('separates two prompts even when their titles are identical', () => {
    expect(buildPromptDraftStorageKey(42, 'user-a'))
      .not.toBe(buildPromptDraftStorageKey(43, 'user-a'))
  })

  it('separates drafts for different users even if prompt IDs match', () => {
    expect(buildPromptDraftStorageKey(42, 'user-a'))
      .not.toBe(buildPromptDraftStorageKey(42, 'user-b'))
  })
})
