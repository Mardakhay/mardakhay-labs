import SidebarButton from './components/SidebarButton';
import DashboardCard from './components/DashboardCard'

function App() {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <aside className="w-64 border-r border-zinc-800 p-6">
        <h1 className="mb-8 text-2xl font-bold">
          Mardakhay Labs
        </h1>

        <nav className="space-y-2">
          <SidebarButton title="Dashboard" active />
          <SidebarButton title="Prompts" />
          <SidebarButton title="Favorites" />
          <SidebarButton title="Settings" />
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <h2 className="mb-6 text-3xl font-bold">
          Dashboard
        </h2>

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
      </main>
    </div>
  )
}

export default App
