import { buildUserScopedStorageKey } from './storageKeys'

export type ActivityEntry = {
  id: string
  action: string
  detail: string
  createdAt: string
}

function getActivityKey(userId?: string | null) {
  return buildUserScopedStorageKey('activity', userId)
}

export function getActivityLog(userId?: string | null): ActivityEntry[] {
  try {
    const raw = window.localStorage.getItem(getActivityKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as ActivityEntry[]
    return Array.isArray(parsed) ? parsed.slice(0, 20) : []
  } catch {
    return []
  }
}

export function addActivity(
  userId: string | null | undefined,
  action: string,
  detail: string
) {
  const entry: ActivityEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    action,
    detail,
    createdAt: new Date().toISOString(),
  }

  const activityKey = getActivityKey(userId)
  const next = [entry, ...getActivityLog(userId)].slice(0, 20)
  window.localStorage.setItem(activityKey, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('mardakhay-labs:activity'))
}
