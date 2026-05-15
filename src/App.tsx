import { Routes, Route } from 'react-router-dom'

import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'

import DashboardPage from './pages/DashboardPage'
import FavoritesPage from './pages/FavoritesPage'
import LoginPage from './pages/LoginPage'
import PromptsPage from './pages/PromptsPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />

      <Route
        path='/*'
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path='/' element={<DashboardPage />} />

                <Route
                  path='/prompts'
                  element={<PromptsPage />}
                />

                <Route
                  path='/favorites'
                  element={<FavoritesPage />}
                />

                <Route
                  path='/settings'
                  element={<SettingsPage />}
                />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
