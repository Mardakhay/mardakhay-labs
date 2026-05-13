import { useEffect, useState } from 'react'
import SidebarButton from './components/SidebarButton';
import DashboardCard from './components/DashboardCard'

function App() {

  const [activeTab, setActiveTab] = useState('Dashboard')

  const [prompts, setPrompts] = useState<string[]>(() => {
    const savedPrompts =
      localStorage.getItem('prompts')

    if (savedPrompts) {
      return JSON.parse(savedPrompts)
    }

    return [
      'Marketing Prompt',
      'Copywriting Prompt',
      'Startup Ideas Prompt',
    ]
  })

  const [newPrompt, setNewPrompt] = useState('')

  function handleAddPrompt() {
    if (!newPrompt.trim()) return

    setPrompts([
      ...prompts,
      newPrompt,
    ])

    setNewPrompt('')
  }

  function handleDeletePrompt(promptToDelete: string) {
    setPrompts(
      prompts.filter(
        (prompt) => prompt !== promptToDelete
      )
    )
  }

  useEffect(() => {
    localStorage.setItem(
      'prompts',
      JSON.stringify(prompts)
    )
  }, [prompts])

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <aside className="w-64 border-r border-zinc-800 p-6">
        <h1 className="mb-8 text-2xl font-bold">
          Mardakhay Labs
        </h1>

        <nav className="space-y-2">
          <SidebarButton
            title="Dashboard"
            active={activeTab === 'Dashboard'}
            onClick={() => setActiveTab('Dashboard')}
          />

          <SidebarButton
            title="Prompts"
            active={activeTab === 'Prompts'}
            onClick={() => setActiveTab('Prompts')}
          />

          <SidebarButton
            title="Favorites"
            active={activeTab === 'Favorites'}
            onClick={() => setActiveTab('Favorites')}
          />

          <SidebarButton
            title="Settings"
            active={activeTab === 'Settings'}
            onClick={() => setActiveTab('Settings')}
          />
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <h2 className="mb-6 text-3xl font-bold">
          {activeTab}
        </h2>

        {activeTab === 'Dashboard' && (
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
        )}

        {activeTab === 'Prompts' && (
          <DashboardCard title="All Prompts">
            <div className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter new prompt..."
                  value={newPrompt}
                  onChange={(event) =>
                    setNewPrompt(event.target.value)
                  }
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 outline-none"
                />

                <button
                  onClick={handleAddPrompt}
                  className="rounded-lg bg-white px-4 py-2 text-black"
                >
                  Add
                </button>
              </div>
              {prompts.map((prompt) => (
                <div
                  key={prompt}
                  className="flex items-center justify-between rounded-lg bg-zinc-800 p-4"
                >
                  <span>{prompt}</span>

                  <button
                    onClick={() =>
                      handleDeletePrompt(prompt)
                    }
                    className="rounded-md bg-red-500 px-3 py-1 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </DashboardCard>
        )}

        {activeTab === 'Favorites' && (
          <DashboardCard title="Favorite Prompts">
            <p className="text-zinc-400">
              You have no favorite prompts yet.
            </p>
          </DashboardCard>
        )}

        {activeTab === 'Settings' && (
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
        )}
      </main>
    </div>
  )
}

export default App
