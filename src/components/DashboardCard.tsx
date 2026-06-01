import type { ReactNode } from 'react'

type DashboardCardProps = {
  title: string
  children: ReactNode
}

function DashboardCard({ title, children }: DashboardCardProps) {
  return (
    <section className='app-surface rounded-2xl border border-white/5 p-4 text-white sm:p-6'>
      <div className='mb-4 flex items-center justify-between gap-3'>
        <h3 className='text-base font-semibold tracking-tight sm:text-lg'>{title}</h3>
        <span className='h-1.5 w-1.5 rounded-full bg-violet-300/70 shadow-[0_0_18px_rgba(196,181,253,0.55)]' />
      </div>

      <div>{children}</div>
    </section>
  )
}

export default DashboardCard
