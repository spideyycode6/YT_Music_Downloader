import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'

function mapLoginError(status) {
  if (status === 401) return 'Invalid email or password'
  if (status === 400) return 'Please fill in all fields'
  return 'Login failed. Please try again.'
}

export default function LoginPage() {
  const { login, isAuthenticated, isInitialized } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (isInitialized && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
    } catch (err) {
      setError(mapLoginError(err?.status))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md rounded-xl border border-zinc-200 shadow-none dark:border-zinc-800">
        <CardHeader className="p-6 pb-4">
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors duration-150 hover:text-zinc-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="h-9 w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
              Sign in
            </Button>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-zinc-400">or</span>
            <Separator className="flex-1" />
          </div>

          <p className="text-center text-sm text-zinc-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-zinc-900 transition-colors duration-150 hover:underline dark:text-zinc-100">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
