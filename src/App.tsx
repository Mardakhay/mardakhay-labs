import { Routes, Route } from 'react-router-dom'

import AppLayout from './components/AppLayout'
import DashboardPage from './pages/DashboardPage'
import FavoritesPage from './pages/FavoritesPage'
import PromptsPage from './pages/PromptsPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path='/' element={<DashboardPage />} />
        <Route path='/prompts' element={<PromptsPage />} />
        <Route path='/favorites' element={<FavoritesPage />} />
        <Route path='/settings' element={<SettingsPage />} />
      </Routes>
    </AppLayout>
  )
}

export default App
