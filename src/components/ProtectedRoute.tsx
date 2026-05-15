import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

type ProtectedRouteProps = {
  children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const { userEmail, setUserEmail, clearUserEmail } = useAuthStore()
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function hydrateSession() {
      const { data, error } = await supabase.auth.getSession()

      if (!isMounted) {
        return
      }

      if (error) {
        clearUserEmail()
        setIsCheckingSession(false)
        return
      }

      const email = data.session?.user?.email ?? null

      if (email) {
        setUserEmail(email)
      } else {
        clearUserEmail()
      }

      setIsCheckingSession(false)
    }

    void hydrateSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const email = session?.user?.email ?? null

        if (email) {
          setUserEmail(email)
        } else {
          clearUserEmail()
        }

        setIsCheckingSession(false)
      }
    )

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [clearUserEmail, setUserEmail])

  if (isCheckingSession) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-zinc-950 text-white'>
        <div className='rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm backdrop-blur-xl'>
          Loading workspace...
        </div>
      </div>
    )
  }

  if (!userEmail) {
    return <Navigate to='/login' replace state={{ from: location }} />
  }

  return <>{children}</>
}

export default ProtectedRoute
