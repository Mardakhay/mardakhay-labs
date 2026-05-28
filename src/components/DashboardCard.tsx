import type { ReactNode } from 'react'

type DashboardCardProps = {
  title: string
  children: ReactNode
}

function DashboardCard({ title, children }: DashboardCardProps) {
  return (
    <section className='rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-white shadow-sm sm:p-6'>
      <div className='mb-4 flex items-center justify-between gap-3'>
        <h3 className='text-base font-semibold tracking-tight sm:text-lg'>{title}</h3>
      </div>

      <div>{children}</div>
    </section>
  )
}

export default DashboardCard
