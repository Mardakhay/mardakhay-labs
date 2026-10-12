import type { ReactNode } from 'react'

type DashboardCardProps = {
  title: string
  children: ReactNode
}

function DashboardCard({ title, children }: DashboardCardProps) {
  return (
    <section className='rounded-3xl border border-white/5 bg-white/5 p-5 text-white shadow-2xl shadow-black/10 sm:p-6'>
      <div className='mb-4 flex items-center justify-between gap-3'>
        <h3 className='text-lg font-semibold tracking-tight'>{title}</h3>
      </div>

      <div>{children}</div>
    </section>
  )
}

export default DashboardCard
