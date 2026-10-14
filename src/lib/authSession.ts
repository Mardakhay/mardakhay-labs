export type AuthUser = {
  id: string
}

type AuthSessionLifecycleOptions<TUser extends AuthUser> = {
  getSession: () => Promise<TUser | null>
  subscribe: (onUserChange: (user: TUser | null) => void) => () => void
  onUserChange: (user: TUser | null) => void
  onLoadingChange: (isLoading: boolean) => void
  onRestoreError: (error: unknown) => void
}

export function shouldClearPromptCache(
  previousUserId: string | null,
  nextUserId: string | null,
) {
  return nextUserId === null || previousUserId !== nextUserId
}

export function startAuthSessionLifecycle<TUser extends AuthUser>({
  getSession,
  subscribe,
  onUserChange,
  onLoadingChange,
  onRestoreError,
}: AuthSessionLifecycleOptions<TUser>) {
  let isActive = true
  let authEventVersion = 0
  const restoreVersion = authEventVersion

  const unsubscribe = subscribe((user) => {
    authEventVersion += 1

    if (!isActive) {
      return
    }

    onUserChange(user)
    onLoadingChange(false)
  })

  void getSession()
    .then((user) => {
      if (!isActive || authEventVersion !== restoreVersion) {
        return
      }

      onUserChange(user)
    })
    .catch((error: unknown) => {
      if (!isActive || authEventVersion !== restoreVersion) {
        return
      }

      onRestoreError(error)
      onUserChange(null)
    })
    .finally(() => {
      if (!isActive || authEventVersion !== restoreVersion) {
        return
      }

      onLoadingChange(false)
    })

  return () => {
    isActive = false
    unsubscribe()
  }
}
