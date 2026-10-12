import { useState } from 'react'
import DashboardPage from './pages/DashboardPage'
import PromptsPage from './pages/PromptsPage'
import FavoritesPage from './pages/FavoritesPage'
import SettingsPage from './pages/SettingsPage'
import {
  Routes,
  Route,
} from 'react-router-dom'
import AppLayout from './components/AppLayout'
import useLocalStorage from './hooks/useLocalStorage'

function App() {

  const [prompts, setPrompts] =
    useLocalStorage<string[]>(
      'prompts',
      [
        'Marketing Prompt',
        'Copywriting Prompt',
        'Startup Ideas Prompt',
      ]
    )

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
