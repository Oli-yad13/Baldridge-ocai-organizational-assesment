'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Key,
  Shield,
  LogOut,
  ArrowLeft,
  Check,
  AlertCircle,
  Building2,
  Calendar,
  Hash,
  Save,
} from 'lucide-react'

interface Organization {
  id: string
  name: string
  subscribedAssessments: string
  isActive: boolean
}

interface AccessKey {
  id: string
  key: string
  organizationId: string
  organization: {
    id: string
    name: string
    isActive: boolean
  }
  assessmentTypes: string
  maxUses: number | null
  usageCount: number
  isActive: boolean
  expiresAt: string | null
  description: string | null
}

export default function EditAccessKeyPage() {
  const router = useRouter()
  const params = useParams()
  const accessKeyId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [accessKey, setAccessKey] = useState<AccessKey | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    organizationId: '',
    assessmentTypes: [] as string[],
    maxUses: '',
    expiresAt: '',
    description: '',
    isActive: true,
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
  }, [router])

  // Load access key and organizations when user is set
  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user, accessKeyId])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load access key
      const accessKeyResponse = await fetch(`/api/admin/access-keys/${accessKeyId}`, {
        headers: {
          'x-user-id': user.id
        }
      })

      if (!accessKeyResponse.ok) {
        const errorText = await accessKeyResponse.text()
        console.error('Access key fetch failed:', accessKeyResponse.status, errorText)
        throw new Error('Failed to load access key')
      }

      const contentType = accessKeyResponse.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await accessKeyResponse.text()
        console.error('Expected JSON but got:', text.substring(0, 200))
        throw new Error('Invalid response format from server')
      }

      const accessKeyData = await accessKeyResponse.json()
      const key = accessKeyData.accessKey

      setAccessKey(key)

      // Load organizations
      const orgsResponse = await fetch('/api/admin/organizations', {
        headers: {
          'x-user-id': user.id
        }
      })

      if (orgsResponse.ok) {
        const orgsContentType = orgsResponse.headers.get('content-type')
        if (orgsContentType && orgsContentType.includes('application/json')) {
          const orgsData = await orgsResponse.json()
          setOrganizations(orgsData.organizations)
        }
      }

      // Set form data
      setFormData({
        organizationId: key.organizationId,
        assessmentTypes: key.assessmentTypes.split(',').map((a: string) => a.trim()),
        maxUses: key.maxUses ? String(key.maxUses) : '',
        expiresAt: key.expiresAt ? new Date(key.expiresAt).toISOString().split('T')[0] : '',
        description: key.description || '',
        isActive: key.isActive,
      })
    } catch (err: any) {
      console.error('Error loading access key data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOrganizationChange = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId)
    if (org) {
      const availableAssessments = org.subscribedAssessments.split(',').map(a => a.trim())
      // Keep only assessments that are available
      const validAssessments = formData.assessmentTypes.filter(a => availableAssessments.includes(a))
      setFormData({
        ...formData,
        organizationId: orgId,
        assessmentTypes: validAssessments.length > 0 ? validAssessments : availableAssessments,
      })
    }
  }

  const toggleAssessment = (assessment: string) => {
    const current = formData.assessmentTypes
    if (current.includes(assessment)) {
      setFormData({
        ...formData,
        assessmentTypes: current.filter(a => a !== assessment),
      })
    } else {
      setFormData({
        ...formData,
        assessmentTypes: [...current, assessment],
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.assessmentTypes.length === 0) {
      setError('At least one assessment type must be selected')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/admin/access-keys/${accessKeyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify({
          organizationId: formData.organizationId,
          assessmentTypes: formData.assessmentTypes.join(','),
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          expiresAt: formData.expiresAt || null,
          description: formData.description || null,
          isActive: formData.isActive,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Update failed:', response.status, errorText)

        // Try to parse as JSON if possible
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.error || 'Failed to update access key')
        } catch {
          throw new Error(`Failed to update access key (${response.status})`)
        }
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Expected JSON but got:', text.substring(0, 200))
        throw new Error('Invalid response format from server')
      }

      const data = await response.json()

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/access-keys')
      }, 1500)
    } catch (err: any) {
      console.error('Error updating access key:', err)
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

  if (!accessKey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Key Not Found</h1>
          <Link
            href="/admin/access-keys"
            className="text-blue-600 hover:underline"
          >
            Return to Access Keys
          </Link>
        </div>
      </div>
    )
  }

  const selectedOrg = organizations.find(o => o.id === formData.organizationId)
  const availableAssessments = selectedOrg
    ? selectedOrg.subscribedAssessments.split(',').map(a => a.trim())
    : []

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
                <p className="text-sm text-gray-600">Edit Access Key</p>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/admin/access-keys"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Access Keys
        </Link>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <Check className="w-5 h-5 text-green-600 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">Access key updated successfully!</h3>
              <p className="text-sm text-green-700 mt-1">Redirecting...</p>
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
            <h2 className="text-lg font-semibold text-gray-900">Access Key Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              Update the access key settings
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Access Key (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Key className="w-4 h-4 inline mr-1" />
                Access Key
              </label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-lg text-gray-500">
                {accessKey.key}
              </div>
              <p className="text-xs text-gray-500 mt-1">Access key cannot be changed</p>
            </div>

            {/* Active Status */}
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Access Key is Active</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-8">
                Inactive keys cannot be used to access assessments
              </p>
            </div>

            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Organization <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.organizationId}
                onChange={(e) => handleOrganizationChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} {!org.isActive && '(Inactive)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Assessment Types */}
            {formData.organizationId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment Types <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  {availableAssessments.map((assessment) => (
                    <label key={assessment} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.assessmentTypes.includes(assessment)}
                        onChange={() => toggleAssessment(assessment)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{assessment}</span>
                    </label>
                  ))}
                </div>
                {formData.assessmentTypes.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">At least one assessment must be selected</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Only assessments subscribed by {selectedOrg?.name} are available
                </p>
              </div>
            )}

            {/* Usage Limits */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Usage Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    Max Uses (Optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Unlimited"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for unlimited usage. Current usage: {accessKey.usageCount}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="e.g., Q1 2024 Employee Assessment Batch"
              />
              <p className="text-xs text-gray-500 mt-1">Internal note to identify this access key</p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/admin/access-keys"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || formData.assessmentTypes.length === 0}
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
