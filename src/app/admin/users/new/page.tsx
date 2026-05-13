'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Shield,
  LogOut,
  ArrowLeft,
  Check,
  AlertCircle,
  UserCog,
  Mail,
  Lock,
  Building2,
} from 'lucide-react'

interface Organization {
  id: string
  name: string
}

export default function NewUserPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'FACILITATOR',
    organizationId: '',
  })

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/auth/signin')
      return
    }

    const parsedUser = JSON.parse(storedUser)
    if (parsedUser.role !== 'SYSTEM_ADMIN') {
      router.push('/')
      return
    }

    setUser(parsedUser)
    loadOrganizations()
  }, [router])

  const loadOrganizations = async () => {
    try {
      const storedUser = localStorage.getItem('user')
      if (!storedUser) return

      const user = JSON.parse(storedUser)

      const response = await fetch('/api/admin/organizations', {
        headers: {
          'x-user-id': user.id,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.organizations || [])
      } else {
        console.error('Failed to load organizations:', response.status)
      }
    } catch (error) {
      console.error('Failed to load organizations:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (formData.role === 'FACILITATOR' && !formData.organizationId) {
      setError('Organization is required for Facilitator role')
      return
    }

    setLoading(true)

    try {
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        setError('Authentication required')
        setLoading(false)
        return
      }

      const currentUser = JSON.parse(storedUser)

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          organizationId: formData.role === 'FACILITATOR' ? formData.organizationId : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/users')
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">System Administration</h1>
                <p className="text-sm text-gray-600">Create User</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/admin/users"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Link>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <Check className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">User created successfully!</h3>
              <p className="text-sm text-green-700 mt-1">Redirecting to users list...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create a new system administrator or facilitator account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Role <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.role === 'SYSTEM_ADMIN'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="SYSTEM_ADMIN"
                    checked={formData.role === 'SYSTEM_ADMIN'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value, organizationId: '' })}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Shield className={`w-6 h-6 ${formData.role === 'SYSTEM_ADMIN' ? 'text-red-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${formData.role === 'SYSTEM_ADMIN' ? 'text-red-900' : 'text-gray-900'}`}>
                        System Admin
                      </p>
                      <p className="text-xs text-gray-500">Full system access</p>
                    </div>
                  </div>
                </label>

                <label
                  className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.role === 'FACILITATOR'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="FACILITATOR"
                    checked={formData.role === 'FACILITATOR'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <UserCog className={`w-6 h-6 ${formData.role === 'FACILITATOR' ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${formData.role === 'FACILITATOR' ? 'text-blue-900' : 'text-gray-900'}`}>
                        Facilitator
                      </p>
                      <p className="text-xs text-gray-500">Organization admin</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="email@example.com"
                />
              </div>

              {formData.role === 'FACILITATOR' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Organization <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.organizationId}
                    onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select organization</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Password Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4">
                <Lock className="w-5 h-5 inline mr-2" />
                Security
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Min. 6 characters"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>

              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Password Requirements:</strong> Minimum 6 characters. User will be able to change their password after first login.
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/admin/users"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Create User
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
