import type { ReactNode } from 'react'

import { useTheme } from '../context/useTheme'

type DashboardCardProps = {
  title: string
  children: ReactNode
}

function DashboardCard({ title, children }: DashboardCardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <section
      className={`rounded-3xl border p-5 sm:p-6 ${
        isDark
          ? 'border-white/5 bg-white/5 text-white shadow-2xl shadow-black/10'
          : 'border-zinc-200 bg-white text-zinc-950 shadow-2xl shadow-zinc-950/5'
      }`}
    >
      <div className='mb-4 flex items-center justify-between gap-3'>
        <h3 className='text-lg font-semibold tracking-tight'>{title}</h3>
      </div>

      <div>{children}</div>
    </section>
  )
}

export default DashboardCard
