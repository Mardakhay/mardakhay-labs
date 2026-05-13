import SidebarButton from './components/SidebarButton'

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
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            Prompt Collection
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            Favorite Prompts
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            AI Notes
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
