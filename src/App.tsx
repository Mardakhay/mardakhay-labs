import { Routes, Route } from 'react-router-dom'

import AppLayout from './components/AppLayout'
import DashboardPage from './pages/DashboardPage'
import FavoritesPage from './pages/FavoritesPage'
import PromptsPage from './pages/PromptsPage'
import SettingsPage from './pages/SettingsPage'
import useLocalStorage from './hooks/useLocalStorage'

function App() {
  const [prompts, setPrompts] = useLocalStorage<string[]>(
    'prompts',
    ['Marketing Prompt', 'Copywriting Prompt', 'Startup Ideas Prompt']
  )

  function handleAddPrompt(prompt: string) {
    if (!prompt.trim()) return

    setPrompts((prevPrompts) => [
      ...prevPrompts,
      prompt,
    ])
  }

  function handleDeletePrompt(promptToDelete: string) {
    setPrompts((previousPrompts) =>
      previousPrompts.filter((prompt) => prompt !== promptToDelete)
    )
  }

  return (
    <AppLayout>
      <Routes>
        <Route path='/' element={<DashboardPage />} />
        <Route
          path='/prompts'
          element={
            <PromptsPage
              prompts={prompts}
              handleAddPrompt={handleAddPrompt}
              handleDeletePrompt={handleDeletePrompt}
            />
          }
        />
        <Route path='/favorites' element={<FavoritesPage />} />
        <Route path='/settings' element={<SettingsPage />} />
      </Routes>
    </AppLayout>
  )
}

export default App
