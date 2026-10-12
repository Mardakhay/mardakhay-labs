import { create } from 'zustand'

export type NotificationVariant = 'success' | 'error' | 'info'

type NotificationStore = {
  message: string
  variant: NotificationVariant
  showNotification: (message: string, variant?: NotificationVariant) => void
  clearNotification: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  message: '',
  variant: 'info',
  showNotification: (message, variant = 'info') =>
    set({
      message,
      variant,
    }),
  clearNotification: () =>
    set({
      message: '',
      variant: 'info',
    }),
}))
