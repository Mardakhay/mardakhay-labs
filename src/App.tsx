import { useEffect, useState } from 'react'
import DashboardPage from './pages/DashboardPage'
import PromptsPage from './pages/PromptsPage'
import FavoritesPage from './pages/FavoritesPage'
import SettingsPage from './pages/SettingsPage'
import {
  Routes,
  Route,
  NavLink,
} from 'react-router-dom'

function App() {

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
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 transition-colors ${
                isActive
                  ? 'bg-zinc-800'
                  : 'hover:bg-zinc-900'
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/prompts"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 transition-colors ${
                isActive
                  ? 'bg-zinc-800'
                  : 'hover:bg-zinc-900'
              }`
            }
          >
            Prompts
          </NavLink>

          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 transition-colors ${
                isActive
                  ? 'bg-zinc-800'
                  : 'hover:bg-zinc-900'
              }`
            }
          >
            Favorites
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 transition-colors ${
                isActive
                  ? 'bg-zinc-800'
                  : 'hover:bg-zinc-900'
              }`
            }
          >
            Settings
          </NavLink>
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <h2 className="mb-6 text-3xl font-bold">
          Mardakhay Labs
        </h2>
          <Routes>
            <Route
              path="/"
              element={<DashboardPage />}
            />

            <Route
              path="/prompts"
              element={
                <PromptsPage
                  prompts={prompts}
                  newPrompt={newPrompt}
                  setNewPrompt={setNewPrompt}
                  handleAddPrompt={handleAddPrompt}
                  handleDeletePrompt={handleDeletePrompt}
                />
              }
            />

            <Route
              path="/favorites"
              element={<FavoritesPage />}
            />

            <Route
              path="/settings"
              element={<SettingsPage />}
            />
          </Routes>
              </main>
            </div>
          )
        }

export default App
