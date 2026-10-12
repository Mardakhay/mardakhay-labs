import { create } from 'zustand'

type AuthStore = {
  userEmail: string | null
  setUserEmail: (email: string | null) => void
  clearUserEmail: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  userEmail: null,
  setUserEmail: (email) =>
    set({
      userEmail: email,
    }),
  clearUserEmail: () =>
    set({
      userEmail: null,
    }),
}))
