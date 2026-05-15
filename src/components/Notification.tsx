import { useTheme } from '../context/ThemeContext'
import { useNotificationStore } from '../stores/notificationStore'

function Notification() {
  const { theme } = useTheme()
  const { message, clearNotification } = useNotificationStore()
  const isDark = theme === 'dark'

  if (!message) return null

  const notificationClassName = isDark
    ? 'border-zinc-700 bg-zinc-900 text-white'
    : 'border-zinc-200 bg-white text-zinc-950 shadow-xl'

  return (
    <div className='fixed right-6 top-6 z-50'>
      <div className={`rounded-xl border px-6 py-4 ${notificationClassName}`}>
        <div className='flex items-center gap-4'>
          <p>{message}</p>

          <button
            onClick={clearNotification}
            className='text-sm font-semibold'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default Notification
