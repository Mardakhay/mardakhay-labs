import { useQuery } from '@tanstack/react-query'

import { getPrompts, type Prompt } from '../api/prompts'
import DashboardCard from '../components/DashboardCard'
import { useTheme } from '../context/ThemeContext'

function DashboardPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const {
    data: prompts = [],
    isLoading,
    error,
  } = useQuery<Prompt[], Error>({
    queryKey: ['prompts'],
    queryFn: getPrompts,
  })

  if (isLoading) {
    return (
      <div
        className={`rounded-2xl border p-6 ${
          isDark
            ? 'border-zinc-800 bg-zinc-900 text-white'
            : 'border-zinc-200 bg-white text-zinc-950 shadow-sm'
        }`}
      >
        Loading workspace...
      </div>
    )
  }

  if (error) {
    return (
      <div className='rounded-2xl border border-red-900 bg-red-950 p-6 text-red-200'>
        {error.message}
      </div>
    )
  }

  const latestPrompt = prompts[0]?.content ?? 'No prompts yet'
  const totalPrompts = prompts.length

  const recentItemClassName = isDark
    ? 'bg-zinc-800 text-white'
    : 'bg-zinc-100 text-zinc-950'

  const mutedTextClassName = isDark
    ? 'text-zinc-400'
    : 'text-zinc-600'

  const bodyTextClassName = isDark
    ? 'text-zinc-200'
    : 'text-zinc-700'

  return (
    <div className='space-y-6'>
      <div className='grid gap-6 md:grid-cols-3'>
        <DashboardCard title='Total prompts'>
          <p className={`text-4xl font-semibold ${bodyTextClassName}`}>
            {totalPrompts}
          </p>
          <p className={`mt-2 text-sm ${mutedTextClassName}`}>
            Saved in Supabase
          </p>
        </DashboardCard>

        <DashboardCard title='Latest prompt'>
          <p className={bodyTextClassName}>{latestPrompt}</p>
        </DashboardCard>

        <DashboardCard title='Workspace status'>
          <p className={bodyTextClassName}>Connected to Supabase</p>
          <p className={`mt-2 text-sm ${mutedTextClassName}`}>
            Real-time-ready data layer with React Query
          </p>
        </DashboardCard>
      </div>

      <DashboardCard title='Recent prompts'>
        {prompts.length === 0 ? (
          <p className={mutedTextClassName}>
            Your prompt workspace is empty. Add your first prompt to get started.
          </p>
        ) : (
          <div className='space-y-3'>
            {prompts.slice(0, 3).map((prompt) => (
              <div
                key={prompt.id}
                className={`rounded-lg p-4 ${recentItemClassName}`}
              >
                <p className='font-medium'>
                  {prompt.content}
                </p>
                <p className='mt-2 text-xs text-zinc-500'>
                  {new Date(prompt.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  )
}

export default DashboardPage
