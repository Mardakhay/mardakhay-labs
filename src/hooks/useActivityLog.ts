import { useEffect, useState } from 'react'

import { getActivityLog, type ActivityEntry } from '../lib/activityLog'
import { useAuthStore } from '../stores/authStore'

export function useActivityLog() {
  const { user } = useAuthStore()
  const [entries, setEntries] = useState<ActivityEntry[]>(() => getActivityLog(user?.id))

  useEffect(() => {
    function refreshActivity() {
      setEntries(getActivityLog(user?.id))
    }

    refreshActivity()

    window.addEventListener('storage', refreshActivity)
    window.addEventListener('mardakhay-labs:activity', refreshActivity)

    return () => {
      window.removeEventListener('storage', refreshActivity)
      window.removeEventListener('mardakhay-labs:activity', refreshActivity)
    }
  }, [user?.id])

  return entries
}
