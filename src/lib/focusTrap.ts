export const FOCUSABLE_ELEMENTS_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Returns the focusable element index to focus when Tab would escape a modal.
 * A null result leaves ordinary browser Tab navigation untouched.
 */
export function getFocusTrapTargetIndex(
  activeIndex: number,
  focusableCount: number,
  shiftKey: boolean
): number | null {
  if (focusableCount <= 0) return null

  if (shiftKey) {
    return activeIndex <= 0 || activeIndex >= focusableCount
      ? focusableCount - 1
      : null
  }

  return activeIndex < 0 || activeIndex >= focusableCount - 1 ? 0 : null
}
