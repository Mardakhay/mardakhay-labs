import { describe, expect, it, vi } from 'vitest'

import {
  shouldClearPromptCache,
  startAuthSessionLifecycle,
} from '../authSession'

type TestUser = {
  id: string
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void

  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}

function createHarness(getSession: () => Promise<TestUser | null>) {
  let authStateListener: ((user: TestUser | null) => void) | undefined

  const unsubscribe = vi.fn()
  const onUserChange = vi.fn()
  const onLoadingChange = vi.fn()
  const onRestoreError = vi.fn()

  const stop = startAuthSessionLifecycle<TestUser>({
    getSession,
    subscribe: (listener) => {
      authStateListener = listener
      return unsubscribe
    },
    onUserChange,
    onLoadingChange,
    onRestoreError,
  })

  return {
    emitAuthStateChange: (user: TestUser | null) => authStateListener?.(user),
    onLoadingChange,
    onRestoreError,
    onUserChange,
    stop,
    unsubscribe,
  }
}

async function flushPromises() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('startAuthSessionLifecycle', () => {
  it('restores the current session when no newer auth event arrives', async () => {
    const user = { id: 'user-a' }
    const harness = createHarness(async () => user)

    await flushPromises()

    expect(harness.onUserChange).toHaveBeenCalledExactlyOnceWith(user)
    expect(harness.onLoadingChange).toHaveBeenLastCalledWith(false)
    harness.stop()
  })

  it('does not restore a stale session after logout', async () => {
    const pendingSession = deferred<TestUser | null>()
    const harness = createHarness(() => pendingSession.promise)

    harness.emitAuthStateChange(null)
    pendingSession.resolve({ id: 'user-a' })
    await flushPromises()

    expect(harness.onUserChange).toHaveBeenCalledExactlyOnceWith(null)
    expect(harness.onRestoreError).not.toHaveBeenCalled()
    harness.stop()
  })

  it('keeps a quick login when an older restore resolves without a session', async () => {
    const pendingSession = deferred<TestUser | null>()
    const user = { id: 'user-a' }
    const harness = createHarness(() => pendingSession.promise)

    harness.emitAuthStateChange(user)
    pendingSession.resolve(null)
    await flushPromises()

    expect(harness.onUserChange).toHaveBeenCalledExactlyOnceWith(user)
    expect(harness.onLoadingChange).toHaveBeenLastCalledWith(false)
    harness.stop()
  })

  it('does not switch back to the previous account after a newer account event', async () => {
    const pendingSession = deferred<TestUser | null>()
    const userB = { id: 'user-b' }
    const harness = createHarness(() => pendingSession.promise)

    harness.emitAuthStateChange(userB)
    pendingSession.resolve({ id: 'user-a' })
    await flushPromises()

    expect(harness.onUserChange).toHaveBeenCalledExactlyOnceWith(userB)
    harness.stop()
  })

  it('ignores restoration errors after a newer auth event', async () => {
    const pendingSession = deferred<TestUser | null>()
    const harness = createHarness(() => pendingSession.promise)

    harness.emitAuthStateChange(null)
    pendingSession.reject(new Error('stale session restore error'))
    await flushPromises()

    expect(harness.onRestoreError).not.toHaveBeenCalled()
    expect(harness.onUserChange).toHaveBeenCalledExactlyOnceWith(null)
    harness.stop()
  })

  it('does not update state after the lifecycle is stopped', async () => {
    const pendingSession = deferred<TestUser | null>()
    const harness = createHarness(() => pendingSession.promise)

    harness.stop()
    pendingSession.resolve({ id: 'user-a' })
    await flushPromises()

    expect(harness.unsubscribe).toHaveBeenCalledOnce()
    expect(harness.onUserChange).not.toHaveBeenCalled()
    expect(harness.onLoadingChange).not.toHaveBeenCalled()
  })
})

describe('shouldClearPromptCache', () => {
  it('clears prompt data when switching accounts', () => {
    expect(shouldClearPromptCache('user-a', 'user-b')).toBe(true)
  })

  it('does not clear prompt data for repeated events from the same account', () => {
    expect(shouldClearPromptCache('user-a', 'user-a')).toBe(false)
  })

  it('clears prompt data when logging out, including when no user is set', () => {
    expect(shouldClearPromptCache('user-a', null)).toBe(true)
    expect(shouldClearPromptCache(null, null)).toBe(true)
  })
})
