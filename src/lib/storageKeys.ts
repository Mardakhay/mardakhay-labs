const APP_STORAGE_PREFIX = 'mardakhay-labs'

export function buildUserScopedStorageKey(
  namespace: string,
  userId?: string | null
) {
  return userId
    ? `${APP_STORAGE_PREFIX}:${namespace}:${userId}`
    : `${APP_STORAGE_PREFIX}:${namespace}`
}

/**
 * Editing drafts are scoped by both the prompt's stable database ID and its owner.
 * This avoids collisions between prompts that happen to share the same title.
 */
export function buildPromptDraftStorageKey(promptId: number, userId: string) {
  return buildUserScopedStorageKey(`draft:edit:${promptId}`, userId)
}
