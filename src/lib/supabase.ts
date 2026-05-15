const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as
  | string
  | undefined
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined

function normalizeRestUrl(url: string) {
  const trimmed = url.trim().replace(/\/+$/, '')

  return trimmed.endsWith('/rest/v1')
    ? trimmed
    : `${trimmed}/rest/v1`
}

export function getSupabaseRestUrl() {
  if (!rawSupabaseUrl) {
    throw new Error(
      'Missing VITE_SUPABASE_URL in your environment variables.'
    )
  }

  return normalizeRestUrl(rawSupabaseUrl)
}

export function getSupabaseAnonKey() {
  if (!rawSupabaseAnonKey) {
    throw new Error(
      'Missing VITE_SUPABASE_ANON_KEY in your environment variables.'
    )
  }

  return rawSupabaseAnonKey.trim()
}
