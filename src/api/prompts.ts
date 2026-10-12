import { supabase } from '../lib/supabase'

export type Prompt = {
  id: number
  content: string
  created_at: string
  user_id: string
  is_favorite: boolean
}

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!data.user) {
    throw new Error('Unauthorized')
  }

  return data.user
}

export async function getPrompts() {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('prompts')
    .select('id, content, created_at, user_id, is_favorite')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return (data ?? []) as Prompt[]
}

export async function createPrompt(content: string) {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('prompts')
    .insert({
      content,
      user_id: user.id,
      is_favorite: false,
    })
    .select('id, content, created_at, user_id, is_favorite')
    .single()

  if (error) {
    throw error
  }

  if (!data) {
    throw new Error('Failed to create prompt.')
  }

  return data as Prompt
}

export async function updatePrompt(promptId: number, content: string) {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('prompts')
    .update({
      content,
    })
    .eq('id', promptId)
    .eq('user_id', user.id)
    .select('id, content, created_at, user_id, is_favorite')
    .single()

  if (error) {
    throw error
  }

  if (!data) {
    throw new Error('Failed to update prompt.')
  }

  return data as Prompt
}

export async function deletePrompt(promptId: number) {
  const user = await getCurrentUser()

  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', promptId)
    .eq('user_id', user.id)

  if (error) {
    throw error
  }
}

export async function togglePromptFavorite(
  promptId: number,
  isFavorite: boolean
) {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('prompts')
    .update({
      is_favorite: !isFavorite,
    })
    .eq('id', promptId)
    .eq('user_id', user.id)
    .select('id, content, created_at, user_id, is_favorite')
    .single()

  if (error) {
    throw error
  }

  if (!data) {
    throw new Error('Failed to update prompt favorite.')
  }

  return data as Prompt
}
