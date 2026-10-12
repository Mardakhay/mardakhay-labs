const APP_STORAGE_PREFIX = 'mardakhay-labs'

export function buildUserScopedStorageKey(
  namespace: string,
  userId?: string | null
) {
  return userId
    ? `${APP_STORAGE_PREFIX}:${namespace}:${userId}`
    : `${APP_STORAGE_PREFIX}:${namespace}`
}
