function App() {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <aside className="w-64 border-r border-zinc-800 p-6">
        <h1 className="mb-8 text-2xl font-bold">
          Mardakhay Labs
        </h1>

        <nav className="space-y-2">
          <button className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-left">
            Dashboard
          </button>

          <button className="w-full rounded-lg px-4 py-2 text-left hover:bg-zinc-900">
            Prompts
          </button>

          <button className="w-full rounded-lg px-4 py-2 text-left hover:bg-zinc-900">
            Favorites
          </button>

          <button className="w-full rounded-lg px-4 py-2 text-left hover:bg-zinc-900">
            Settings
          </button>
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
