import type { User }
  from '@supabase/supabase-js'

import { create }
  from 'zustand'

type AuthStore = {
  user: User | null

  isLoading: boolean

  setUser: (
    user: User | null
  ) => void

  setIsLoading: (
    value: boolean
  ) => void
}

export const useAuthStore =
  create<AuthStore>((set) => ({
    user: null,

    isLoading: true,

    setUser: (user) =>
      set({
        user,
      }),

    setIsLoading: (value) =>
      set({
        isLoading: value,
      }),
  }))