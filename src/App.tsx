import { Suspense, lazy, useEffect } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { Navigate, Route, Routes } from 'react-router-dom'

import Notification from './components/Notification'

import { promptsQueryBaseKey } from './hooks/usePromptsQuery'
import { useNotificationStore } from './stores/notificationStore'
import { supabase } from './lib/supabase'
import {
  shouldClearPromptCache,
  startAuthSessionLifecycle,
} from './lib/authSession'
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
  const { showNotification } = useNotificationStore()

  useEffect(() => {
    let currentUserId = useAuthStore.getState().user?.id ?? null

    function applyUser(nextUser: typeof user) {
      const nextUserId = nextUser?.id ?? null

      if (shouldClearPromptCache(currentUserId, nextUserId)) {
        queryClient.removeQueries({ queryKey: promptsQueryBaseKey })
      }

      currentUserId = nextUserId
      setUser(nextUser)
    }

    return startAuthSessionLifecycle({
      getSession: async () => {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        return data.session?.user ?? null
      },
      subscribe: (onUserChange) => {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          onUserChange(session?.user ?? null)
        })

        return () => {
          subscription.unsubscribe()
        }
      },
      onUserChange: applyUser,
      onLoadingChange: setIsLoading,
      onRestoreError: (error) => {
        console.error('Failed to load Supabase session', error)
        showNotification('Failed to restore your session. Please sign in again.', 'error')
      },
    })
  }, [queryClient, setUser, setIsLoading, showNotification])

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
