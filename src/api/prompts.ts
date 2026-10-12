import { supabase } from '../lib/supabase'

export type Prompt = {
  id: number
  content: string
  created_at: string
  user_id: string
}

type PromptRow = {
  id: number
  content: string
  created_at: string
  user_id: string
}

async function getCurrentUser() {
  const { data, error } =
    await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!data.user) {
    throw new Error('Unauthorized')
  }

  return data.user
}

function normalizePrompt(row: PromptRow): Prompt {
  return row
}

export async function getPrompts() {
  const user = await getCurrentUser()

  const { data, error } =
    await supabase
      .from('prompts')
      .select('id, content, created_at, user_id')
      .eq('user_id', user.id)
      .order('created_at', {
        ascending: false,
      })

  if (error) {
    throw error
  }

  return (data ?? []).map(
    (row) => normalizePrompt(row as PromptRow)
  )
}

export async function createPrompt(
  content: string
) {
  const user = await getCurrentUser()

  const { data, error } =
    await supabase
      .from('prompts')
      .insert({
        content,
        user_id: user.id,
      })
      .select('id, content, created_at, user_id')
      .single()

  if (error) {
    throw error
  }

  if (!data) {
    throw new Error('Failed to create prompt.')
  }

  return normalizePrompt(data as PromptRow)
}

export async function deletePrompt(promptId: number) {
  const user = await getCurrentUser()

  const { error } =
    await supabase
      .from('prompts')
      .delete()
      .eq('id', promptId)
      .eq('user_id', user.id)

  if (error) {
    throw error
  }
}
