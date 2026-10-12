import { afterEach, describe, expect, it, vi } from 'vitest'

import { addActivity } from '../activityLog'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('activityLog', () => {
  it('does not throw when browser storage rejects a non-critical activity write', () => {
    const setItem = vi.fn(() => {
      throw new Error('Storage quota exceeded')
    })

    vi.stubGlobal('window', {
      localStorage: {
        getItem: vi.fn(() => null),
        setItem,
      },
      dispatchEvent: vi.fn(),
    })

    expect(() => addActivity('user-1', 'Created prompt', 'Example')).not.toThrow()
    expect(setItem).toHaveBeenCalledOnce()
  })
})
