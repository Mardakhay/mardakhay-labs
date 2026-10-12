import DashboardCard from '../components/DashboardCard'

function DashboardPage() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <DashboardCard title="Prompt Collection">
        <p className="text-zinc-400">
          Organize and manage your AI prompts.
        </p>
      </DashboardCard>

      <DashboardCard title="Favorite Prompts">
        <p className="text-zinc-400">
          Quick access to saved prompts.
        </p>
      </DashboardCard>

      <DashboardCard title="AI Notes">
        <p className="text-zinc-400">
          Store ideas and AI-generated notes.
        </p>
      </DashboardCard>
    </div>
  )
}

export default DashboardPage