import { useEffect } from 'react'
import { CircleCheck as CheckCircle2, CircleAlert, Info, X } from 'lucide-react'

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
      'border-emerald-500/20 bg-emerald-950/80 text-emerald-200 shadow-2xl shadow-emerald-950/30',
  },
  error: {
    icon: CircleAlert,
    className:
      'border-red-500/20 bg-red-950/80 text-red-200 shadow-2xl shadow-red-950/30',
  },
  info: {
    icon: Info,
    className:
      'border-white/[0.06] bg-white/[0.04] text-zinc-200 shadow-2xl shadow-black/40',
  },
}

function Notification() {
  const { message, variant, clearNotification } = useNotificationStore()

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
    <div
      className='app-toast fixed right-4 top-4 z-[100] w-[min(92vw,420px)]'
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      <div className={`rounded-xl border px-4 py-3 backdrop-blur-2xl ${variantConfig[variant].className}`}>
        <div className='flex items-start gap-3'>
          <div className='mt-0.5 rounded-md bg-white/[0.06] p-1.5'>
            <Icon className='h-3.5 w-3.5' />
          </div>

          <div className='min-w-0 flex-1'>
            <p className='text-[13px] font-medium leading-5'>{message}</p>
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
