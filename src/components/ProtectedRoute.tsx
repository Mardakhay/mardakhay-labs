import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthStore } from '../stores/authStore'

function ProtectedRoute() {
  const location = useLocation()
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to='/login' replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
