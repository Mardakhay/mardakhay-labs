import DashboardCard from '../components/DashboardCard'

function SettingsPage() {
  return (
    <DashboardCard title="Settings">
      <div className="space-y-4">
        <button className="rounded-lg bg-zinc-800 px-4 py-2">
          Dark Theme
        </button>

        <button className="rounded-lg bg-zinc-800 px-4 py-2">
          Account Settings
        </button>
      </div>
    </DashboardCard>
  )
}

export default SettingsPage