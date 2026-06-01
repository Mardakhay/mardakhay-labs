import { Suspense, lazy, useEffect } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { Navigate, Route, Routes } from 'react-router-dom'

import Notification from './components/Notification'

import { promptsQueryBaseKey } from './hooks/usePromptsQuery'
import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/authStore'

const AppLayout = lazy(() => import('./components/AppLayout'))
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const PromptsPage = lazy(() => import('./pages/PromptsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

function App() {
  const queryClient = useQueryClient()
  const { user, isLoading, setUser, setIsLoading } = useAuthStore()

  useEffect(() => {
    async function loadSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        setUser(session?.user ?? null)

        if (!session?.user) {
          queryClient.removeQueries({ queryKey: promptsQueryBaseKey })
        }
      } catch (error) {
        console.error('Failed to load Supabase session', error)
        queryClient.removeQueries({ queryKey: promptsQueryBaseKey })
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

      if (!session?.user) {
        queryClient.removeQueries({ queryKey: promptsQueryBaseKey })
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [queryClient, setUser, setIsLoading])

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-zinc-950 text-white'>
        Loading...
      </div>
    )
  }

  return (
    <>
      <Notification />

      <Suspense
        fallback={
          <div className='flex min-h-screen items-center justify-center bg-zinc-950 text-white'>
            Loading...
          </div>
        }
      >
        <Routes>
          <Route
            path='/login'
            element={user ? <Navigate to='/' replace /> : <LoginPage />}
          />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path='/' element={<DashboardPage />} />
              <Route path='/prompts' element={<PromptsPage />} />
              <Route path='/favorites' element={<FavoritesPage />} />
              <Route path='/settings' element={<SettingsPage />} />
            </Route>
          </Route>

          <Route
            path='*'
            element={<Navigate to={user ? '/' : '/login'} replace />}
          />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
