import { useEffect, useState } from 'react'
import DashboardPage from './pages/DashboardPage'
import PromptsPage from './pages/PromptsPage'
import FavoritesPage from './pages/FavoritesPage'
import SettingsPage from './pages/SettingsPage'
import {
  Routes,
  Route,
} from 'react-router-dom'
import AppLayout from './components/AppLayout'

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
    <AppLayout>
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
    </AppLayout>
  )
}

export default App
