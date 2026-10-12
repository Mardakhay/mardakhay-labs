/**
 * Canonicalizes email input consistently across Supabase Auth operations.
 */
export function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase()
}
