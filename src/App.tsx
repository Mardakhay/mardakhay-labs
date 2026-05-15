import { Navigate, Routes, Route } from 'react-router-dom'

import { useTheme } from './context/useTheme'
import AppLayout from './components/AppLayout'
import Notification from './components/Notification'
import ProtectedRoute from './components/ProtectedRoute'

import DashboardPage from './pages/DashboardPage'
import FavoritesPage from './pages/FavoritesPage'
import LoginPage from './pages/LoginPage'
import PromptsPage from './pages/PromptsPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  const { theme } = useTheme()

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <Notification />

      <Routes>
        <Route path='/login' element={<LoginPage />} />

        <Route
          path='/*'
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path='/' element={<DashboardPage />} />

                  <Route path='/prompts' element={<PromptsPage />} />

                  <Route path='/favorites' element={<FavoritesPage />} />

                  <Route path='/settings' element={<SettingsPage />} />

                  <Route path='*' element={<Navigate to='/' replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App
