import { describe, expect, it } from 'vitest'

import { getFocusTrapTargetIndex } from '../focusTrap'

describe('getFocusTrapTargetIndex', () => {
  it('wraps Tab from the last focusable element to the first', () => {
    expect(getFocusTrapTargetIndex(3, 4, false)).toBe(0)
  })

  it('wraps Shift+Tab from the first focusable element to the last', () => {
    expect(getFocusTrapTargetIndex(0, 4, true)).toBe(3)
  })

  it('moves focus back into the dialog when it is outside the focusable set', () => {
    expect(getFocusTrapTargetIndex(-1, 4, false)).toBe(0)
    expect(getFocusTrapTargetIndex(-1, 4, true)).toBe(3)
  })

  it('leaves normal navigation between interior elements to the browser', () => {
    expect(getFocusTrapTargetIndex(1, 4, false)).toBeNull()
    expect(getFocusTrapTargetIndex(2, 4, true)).toBeNull()
  })

  it('does nothing when the dialog has no focusable elements', () => {
    expect(getFocusTrapTargetIndex(0, 0, false)).toBeNull()
  })
})
