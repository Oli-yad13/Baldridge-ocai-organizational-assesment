'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  Save,
  User,
} from 'lucide-react'

interface Organization {
  id: string
  name: string
}

interface UserData {
  id: string
  name: string
  email: string | null
  role: 'SYSTEM_ADMIN' | 'FACILITATOR' | 'EMPLOYEE'
  organizationId: string | null
  organization: {
    id: string
    name: string
  } | null
  createdAt: string
  lastLoginAt: string | null
}

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

    setCurrentUser(parsedUser)
  }, [router])

  // Load user data and organizations when current user is set
  useEffect(() => {
    if (currentUser?.id) {
      loadData()
    }
  }, [currentUser, userId])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load user data
      const userResponse = await fetch(`/api/admin/users/${userId}`)

      if (!userResponse.ok) {
        throw new Error('Failed to load user')
      }

      const userData = await userResponse.json()
      const user = userData.user

      setUserData(user)

      // Load organizations
      const orgsResponse = await fetch('/api/admin/organizations', {
        headers: {
          'x-user-id': currentUser.id
        }
      })

      if (orgsResponse.ok) {
        const orgsData = await orgsResponse.json()
        setOrganizations(orgsData.organizations || [])
      }

      // Set form data
      setFormData({
        name: user.name,
        email: user.email || '',
        password: '',
        confirmPassword: '',
        role: user.role,
        organizationId: user.organizationId || '',
      })
    } catch (err: any) {
      console.error('Error loading user data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (formData.role === 'FACILITATOR' && !formData.organizationId) {
      setError('Organization is required for Facilitator role')
      return
    }

    setSaving(true)

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        organizationId: formData.role === 'FACILITATOR' ? formData.organizationId : null,
      }

      // Only include password if it's being changed
      if (formData.password) {
        updateData.password = formData.password
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/users')
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <Link
            href="/admin/users"
            className="text-blue-600 hover:underline"
          >
            Return to Users
          </Link>
        </div>
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
                <p className="text-sm text-gray-600">Edit User</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{currentUser?.name}</span>
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
              <h3 className="text-sm font-medium text-green-800">User updated successfully!</h3>
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
              Update user information and settings
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
                Change Password (Optional)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Leave empty to keep current"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>

              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  Leave password fields empty to keep the current password. If changing, minimum 6 characters required.
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 text-gray-900">{new Date(userData.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Last Login:</span>
                  <span className="ml-2 text-gray-900">
                    {userData.lastLoginAt ? new Date(userData.lastLoginAt).toLocaleDateString() : 'Never'}
                  </span>
                </div>
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
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
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
