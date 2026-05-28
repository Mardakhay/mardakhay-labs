import { supabase } from '../lib/supabase'
import { derivePromptTitle } from '../lib/promptFormatting'
import {
  extractHashtags,
  parsePromptContent,
  serializePromptContent,
  type PromptMetadata,
} from '../lib/promptMetadata'

export type Prompt = {
  id: number
  title: string
  content: string
  created_at: string
  user_id: string
  is_favorite: boolean
  ai_target?: PromptMetadata['aiTarget']
  category?: PromptMetadata['category']
  hashtags: string[]
}

export type PromptInput = PromptMetadata & {
  title: string
  content: string
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

function selectPromptColumns() {
  return 'id, title, content, created_at, user_id, is_favorite'
}

function normalizePromptInput(input: PromptInput) {
  const content = input.content.trim()
  const title = input.title.trim() || derivePromptTitle(content)

  return {
    title,
    content: serializePromptContent(content, {
      aiTarget: input.aiTarget,
      category: input.category,
    }),
  }
}

function mapPromptRow(row: Prompt) {
  const parsed = parsePromptContent(row.content)

  return {
    ...row,
    content: parsed.content,
    ai_target: parsed.metadata.aiTarget,
    category: parsed.metadata.category,
    hashtags: extractHashtags(parsed.content),
  }
}

export async function getPrompts() {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('prompts')
    .select(selectPromptColumns())
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return ((data ?? []) as unknown as Prompt[]).map(mapPromptRow)
}

export async function createPrompt(input: PromptInput) {
  const user = await getCurrentUser()
  const prompt = normalizePromptInput(input)

  const { data, error } = await supabase
    .from('prompts')
    .insert({
      ...prompt,
      user_id: user.id,
      is_favorite: false,
    })
    .select(selectPromptColumns())
    .single()

  if (error) {
    throw error
  }

  if (!data) {
    throw new Error('Failed to create prompt.')
  }

  return mapPromptRow(data as unknown as Prompt)
}

export async function updatePrompt(promptId: number, input: PromptInput) {
  const user = await getCurrentUser()
  const prompt = normalizePromptInput(input)

  const { data, error } = await supabase
    .from('prompts')
    .update(prompt)
    .eq('id', promptId)
    .eq('user_id', user.id)
    .select(selectPromptColumns())
    .single()

  if (error) {
    throw error
  }

  if (!data) {
    throw new Error('Failed to update prompt.')
  }

  return mapPromptRow(data as unknown as Prompt)
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
    .select(selectPromptColumns())
    .single()

  if (error) {
    throw error
  }

  if (!data) {
    throw new Error('Failed to update prompt favorite.')
  }

  return mapPromptRow(data as unknown as Prompt)
}
