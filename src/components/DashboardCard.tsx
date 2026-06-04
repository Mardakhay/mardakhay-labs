import type { ReactNode } from 'react'

type DashboardCardProps = {
  title: string
  children: ReactNode
}

function DashboardCard({ title, children }: DashboardCardProps) {
  return (
    <section className='app-surface rounded-xl border border-white/[0.04] p-4 text-white sm:p-6'>
      <div className='mb-4 flex items-center justify-between gap-3'>
        <h3 className='text-[13px] font-semibold tracking-tight text-zinc-200 sm:text-[15px]'>{title}</h3>
        <span className='h-1 w-1 rounded-full bg-sky-400/60 shadow-[0_0_8px_rgba(56,189,248,0.35)]' />
      </div>

      <div>{children}</div>
    </section>
  )
}

export default DashboardCard
