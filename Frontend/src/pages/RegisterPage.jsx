import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import BackButton from '@/components/BackButton'

function mapRegisterError(status) {
  if (status === 409) return 'Email already registered'
  if (status === 400) return 'Please fill in all fields'
  return 'Registration failed. Please try again.'
}

export default function RegisterPage() {
  const { register, isAuthenticated, isInitialized } = useAuth()
  const [name, setName] = useState('')
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
      await register({ name, email, password })
    } catch (err) {
      setError(mapRegisterError(err?.status))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-3">
        <BackButton to="/login" label="Back to sign in" />
        <Card className="rounded-xl border border-zinc-200 shadow-none dark:border-zinc-800">
        <CardHeader className="p-6 pb-4">
          <CardTitle>Create account</CardTitle>
          <CardDescription>Start downloading music</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

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
                  autoComplete="new-password"
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
              Create account
            </Button>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-zinc-900 transition-colors duration-150 hover:underline dark:text-zinc-100">
              Sign in
            </Link>
          </p>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
