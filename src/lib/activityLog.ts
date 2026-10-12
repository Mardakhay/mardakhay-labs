export type ActivityEntry = {
  id: string
  action: string
  detail: string
  createdAt: string
}

const activityKey = 'mardakhay-labs:activity'

export function getActivityLog(): ActivityEntry[] {
  try {
    const raw = window.localStorage.getItem(activityKey)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ActivityEntry[]
    return Array.isArray(parsed) ? parsed.slice(0, 20) : []
  } catch {
    return []
  }
}

export function addActivity(action: string, detail: string) {
  const entry: ActivityEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    action,
    detail,
    createdAt: new Date().toISOString(),
  }

  const next = [entry, ...getActivityLog()].slice(0, 20)
  window.localStorage.setItem(activityKey, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('mardakhay-labs:activity'))
}
