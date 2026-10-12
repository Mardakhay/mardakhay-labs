import { useEffect } from 'react'
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react'

import { useTheme } from '../context/useTheme'
import {
  type NotificationVariant,
  useNotificationStore,
} from '../stores/notificationStore'

const variantConfig: Record<
  NotificationVariant,
  {
    icon: typeof CheckCircle2
    className: string
  }
> = {
  success: {
    icon: CheckCircle2,
    className:
      'border-emerald-500/20 bg-emerald-950/90 text-emerald-100 shadow-2xl shadow-emerald-950/40',
  },
  error: {
    icon: CircleAlert,
    className:
      'border-red-500/20 bg-red-950/90 text-red-100 shadow-2xl shadow-red-950/40',
  },
  info: {
    icon: Info,
    className:
      'border-zinc-700/80 bg-zinc-900/95 text-white shadow-2xl shadow-black/40',
  },
}

function Notification() {
  const { theme } = useTheme()
  const { message, variant, clearNotification } = useNotificationStore()
  const isDark = theme === 'dark'

  useEffect(() => {
    if (!message) return

    const timer = window.setTimeout(() => {
      clearNotification()
    }, 3500)

    return () => window.clearTimeout(timer)
  }, [clearNotification, message])

  if (!message) return null

  const Icon = variantConfig[variant].icon

  return (
    <div className='fixed right-4 top-4 z-[100] w-[min(92vw,420px)]'>
      <div
        className={`rounded-2xl border px-4 py-3 backdrop-blur-xl ${
          variantConfig[variant].className
        } ${isDark ? '' : 'shadow-xl'}`}
      >
        <div className='flex items-start gap-3'>
          <div className='mt-0.5 rounded-full bg-white/5 p-2'>
            <Icon className='h-4 w-4' />
          </div>

          <div className='min-w-0 flex-1'>
            <p className='text-sm font-medium leading-5'>{message}</p>
          </div>

          <button
            onClick={clearNotification}
            className='rounded-full p-1 transition-colors hover:bg-white/10'
            aria-label='Dismiss notification'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Notification
