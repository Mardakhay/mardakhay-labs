import { useEffect, useState } from 'react'
import SidebarButton from './components/SidebarButton'
import DashboardPage from './pages/DashboardPage'
import PromptsPage from './pages/PromptsPage'
import FavoritesPage from './pages/FavoritesPage'
import SettingsPage from './pages/SettingsPage'

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
          <DashboardPage />
        )}

        {activeTab === 'Prompts' && (
          <PromptsPage
            prompts={prompts}
            newPrompt={newPrompt}
            setNewPrompt={setNewPrompt}
            handleAddPrompt={handleAddPrompt}
            handleDeletePrompt={handleDeletePrompt}
          />
        )}

        {activeTab === 'Favorites' && (
          <FavoritesPage />
        )}

        {activeTab === 'Settings' && (
          <SettingsPage />
        )}
              </main>
            </div>
          )
        }

export default App
