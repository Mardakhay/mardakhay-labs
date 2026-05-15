import type { ReactNode } from 'react'

type DashboardCardProps = {
  title: string
  children: ReactNode
}

function DashboardCard({
  title,
  children,
}: DashboardCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold">
        {title}
      </h3>

      <div>
        {children}
      </div>
    </div>
  )
}

export default DashboardCard