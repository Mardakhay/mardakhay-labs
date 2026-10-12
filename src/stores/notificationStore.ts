import { create } from 'zustand'

type NotificationStore = {
  message: string
  showNotification: (
    message: string
  ) => void
  clearNotification: () => void
}

export const useNotificationStore =
  create<NotificationStore>((set) => ({
    message: '',

    showNotification: (message) =>
      set({
        message,
      }),

    clearNotification: () =>
      set({
        message: '',
      }),
  }))