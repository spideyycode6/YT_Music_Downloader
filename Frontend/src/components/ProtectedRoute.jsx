import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAppSelector } from '@/store/store'
import { selectIsAuthenticated, selectIsInitialized } from '@/store/selectors'

export default function ProtectedRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isInitialized = useAppSelector(selectIsInitialized)

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-400" strokeWidth={1.5} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
