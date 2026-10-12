import { describe, expect, it } from 'vitest'

import { normalizeAuthEmail } from '../authUtils'

describe('normalizeAuthEmail', () => {
  it('trims leading and trailing whitespace', () => {
    expect(normalizeAuthEmail('  user@example.com  ')).toBe('user@example.com')
  })

  it('normalizes email case consistently', () => {
    expect(normalizeAuthEmail('User.Name@Example.COM')).toBe('user.name@example.com')
  })

  it('preserves plus-addressing', () => {
    expect(normalizeAuthEmail('first.last+tag@example.com')).toBe(
      'first.last+tag@example.com',
    )
  })
})
