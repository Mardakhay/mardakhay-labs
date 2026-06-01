import { useEffect, useState } from 'react'

import { getActivityLog, type ActivityEntry } from '../lib/activityLog'

export function useActivityLog() {
  const [entries, setEntries] = useState<ActivityEntry[]>(() => getActivityLog())

  useEffect(() => {
    function refreshActivity() {
      setEntries(getActivityLog())
    }

    window.addEventListener('storage', refreshActivity)
    window.addEventListener('mardakhay-labs:activity', refreshActivity)

    return () => {
      window.removeEventListener('storage', refreshActivity)
      window.removeEventListener('mardakhay-labs:activity', refreshActivity)
    }
  }, [])

  return entries
}
