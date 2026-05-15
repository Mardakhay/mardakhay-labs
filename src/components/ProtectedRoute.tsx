import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuthStore }
  from '../stores/authStore'

type ProtectedRouteProps = {
  children: ReactNode
}

function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const { userEmail } =
    useAuthStore()

  if (!userEmail) {
    return <Navigate to='/login' replace />
  }

  return children
}

export default ProtectedRoute
