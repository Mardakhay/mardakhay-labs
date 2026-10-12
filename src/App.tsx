import { useEffect } from 'react'

import { Navigate, Route, Routes } from 'react-router-dom'

import AppLayout from './components/AppLayout'
import Notification from './components/Notification'
import ProtectedRoute from './components/ProtectedRoute'

import DashboardPage from './pages/DashboardPage'
import FavoritesPage from './pages/FavoritesPage'
import LoginPage from './pages/LoginPage'
import PromptsPage from './pages/PromptsPage'
import SettingsPage from './pages/SettingsPage'

import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/authStore'

function App() {
  const { user, isLoading, setUser, setIsLoading } = useAuthStore()

  useEffect(() => {
    async function loadSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Failed to load Supabase session', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()

    const {
      data: listener,
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [setUser, setIsLoading])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading...
      </div>
    )
  }

  return (
    <>
      <Notification />
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/prompts" element={<PromptsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to={user ? '/' : '/login'} replace />}
        />
      </Routes>
    </>
  )
}

export default App
