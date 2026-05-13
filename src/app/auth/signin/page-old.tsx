'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simple hardcoded admin login
    if (email === 'admin@acme.com' && password === 'admin123') {
      try {
        // Create a mock session by redirecting to dashboard
        // In a real app, you'd use NextAuth's signIn with credentials
        router.push('/dashboard?user=admin&role=ORG_ADMIN&orgId=1')
      } catch (err) {
        setError('Login failed. Please try again.')
      }
    } else if (email === 'facilitator@acme.com' && password === 'facilitator123') {
      try {
        router.push('/dashboard?user=facilitator&role=FACILITATOR&orgId=1')
      } catch (err) {
        setError('Login failed. Please try again.')
      }
    } else if (email === 'employee@acme.com' && password === 'employee123') {
      try {
        router.push('/dashboard?user=employee&role=EMPLOYEE&orgId=1')
      } catch (err) {
        setError('Login failed. Please try again.')
      }
    } else {
      setError('Invalid email or password. Use the demo accounts below.')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to OCAI Hub
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Use the demo accounts below to test the application
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center text-sm text-gray-600 mb-4">
              <strong>Demo Accounts:</strong>
            </div>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="bg-gray-50 p-2 rounded">
                <strong>Admin:</strong> admin@acme.com / admin123
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <strong>Facilitator:</strong> facilitator@acme.com / facilitator123
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <strong>Employee:</strong> employee@acme.com / employee123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}