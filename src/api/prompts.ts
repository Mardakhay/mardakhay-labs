import {
  getSupabaseAnonKey,
  getSupabaseRestUrl,
} from '../lib/supabase'

export type Prompt = {
  id: string
  content: string
  created_at: string
}

type SupabaseErrorResponse = {
  message?: string
  details?: string
  hint?: string
}

function buildHeaders() {
  const anonKey = getSupabaseAnonKey()

  return {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Prefer: 'return=representation',
  }
}

async function readJsonResponse<T>(response: Response) {
  const text = await response.text()

  if (!text) {
    return null as T
  }

  return JSON.parse(text) as T
}

async function handleSupabaseResponse<T>(response: Response) {
  if (!response.ok) {
    const errorBody = (await response
      .json()
      .catch(() => null)) as SupabaseErrorResponse | null

    const message =
      errorBody?.message ||
      errorBody?.details ||
      errorBody?.hint ||
      `Supabase request failed with status ${response.status}`

    throw new Error(message)
  }

  return readJsonResponse<T>(response)
}

function normalizePrompt(prompt: {
  id: number | string
  content: string
  created_at: string
}): Prompt {
  return {
    id: String(prompt.id),
    content: prompt.content,
    created_at: prompt.created_at,
  }
}

export async function getPrompts() {
  const response = await fetch(
    `${getSupabaseRestUrl()}/prompts?select=*&order=created_at.desc`,
    {
      headers: buildHeaders(),
    }
  )

  const data =
    (await handleSupabaseResponse<{
      id: number | string
      content: string
      created_at: string
    }[]>(response)) ?? []

  return data.map(normalizePrompt)
}

export async function createPrompt(content: string) {
  const response = await fetch(
    `${getSupabaseRestUrl()}/prompts`,
    {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({
        content,
      }),
    }
  )

  const data =
    await handleSupabaseResponse<{
      id: number | string
      content: string
      created_at: string
    }[]>(response)

  if (!data?.[0]) {
    throw new Error('Supabase did not return the created prompt.')
  }

  return normalizePrompt(data[0])
}

export async function deletePrompt(promptId: string) {
  const response = await fetch(
    `${getSupabaseRestUrl()}/prompts?id=eq.${encodeURIComponent(promptId)}`,
    {
      method: 'DELETE',
      headers: buildHeaders(),
    }
  )

  await handleSupabaseResponse<unknown>(response)
}
