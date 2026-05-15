import type { ReactNode } from 'react'

import { useTheme } from '../context/ThemeContext'

type DashboardCardProps = {
  title: string
  children: ReactNode
}

function DashboardCard({ title, children }: DashboardCardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const cardClassName = isDark
    ? 'border-zinc-800 bg-zinc-900 text-white'
    : 'border-zinc-200 bg-white text-zinc-950 shadow-sm'

  const titleClassName = isDark ? 'text-white' : 'text-zinc-950'

  return (
    <div className={`rounded-2xl border p-6 ${cardClassName}`}>
      <h3 className={`mb-4 text-lg font-semibold ${titleClassName}`}>
        {title}
      </h3>

      <div>{children}</div>
    </div>
  )
}

export default DashboardCard
