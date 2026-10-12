import { useNotificationStore }
  from '../stores/notificationStore'

function Notification() {
  const {
    message,
    clearNotification,
  } = useNotificationStore()

  if (!message) return null

  return (
    <div className="fixed right-6 top-6 z-50">
      <div className="rounded-xl bg-white px-6 py-4 text-black shadow-xl">
        <div className="flex items-center gap-4">
          <p>{message}</p>

          <button
            onClick={clearNotification}
            className="text-sm font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default Notification