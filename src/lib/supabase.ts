import { createClient } from '@supabase/supabase-js'

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as
  | string
  | undefined
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined

function getRequiredEnvValue(
  value: string | undefined,
  name: string
) {
  if (!value) {
    throw new Error(`Missing ${name} in your environment variables.`)
  }

  return value.trim()
}

function normalizeSupabaseUrl(url: string) {
  const trimmed = url.trim().replace(/\/+$/, '')

  return trimmed.endsWith('/rest/v1')
    ? trimmed.replace(/\/rest\/v1$/, '')
    : trimmed
}

const supabaseUrl = normalizeSupabaseUrl(
  getRequiredEnvValue(rawSupabaseUrl, 'VITE_SUPABASE_URL')
)
const supabaseAnonKey = getRequiredEnvValue(
  rawSupabaseAnonKey,
  'VITE_SUPABASE_ANON_KEY'
)

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)
