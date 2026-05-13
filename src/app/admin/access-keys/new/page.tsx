'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Copy,
  RefreshCw,
} from 'lucide-react'

interface Organization {
  id: string
  name: string
  subscribedAssessments: string
}

export default function NewAccessKeyPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    key: '',
    organizationId: '',
    assessmentTypes: [] as string[],
    maxUses: '',
    expiresAt: '',
    description: '',
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
    generateKey()
  }, [router])

  // Load organizations when user is set
  useEffect(() => {
    if (user?.id) {
      loadOrganizations()
    }
  }, [user])

  const loadOrganizations = async () => {
    if (!user?.id) {
      console.error('No user ID available for loading organizations')
      return
    }

    try {
      console.log('Loading organizations with user ID:', user.id)
      const response = await fetch('/api/admin/organizations', {
        headers: {
          'x-user-id': user.id
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Organizations loaded:', data.organizations)
        setOrganizations(data.organizations.filter((org: any) => org.isActive))
      } else {
        console.error('Failed to load organizations:', response.status, response.statusText)
        const errorData = await response.json()
        console.error('Error details:', errorData)
      }
    } catch (error) {
      console.error('Failed to load organizations:', error)
    }
  }

  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let key = ''
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) key += '-'
      key += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, key })
  }

  const handleOrganizationChange = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId)
    if (org) {
      const availableAssessments = org.subscribedAssessments.split(',').map(a => a.trim())
      setFormData({
        ...formData,
        organizationId: orgId,
        assessmentTypes: availableAssessments,
      })
    } else {
      setFormData({
        ...formData,
        organizationId: '',
        assessmentTypes: [],
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

    setLoading(true)

    try {
      console.log('Creating access key with user ID:', user?.id)
      const response = await fetch('/api/admin/access-keys', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify({
          key: formData.key,
          organizationId: formData.organizationId,
          assessmentTypes: formData.assessmentTypes.join(','),
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          expiresAt: formData.expiresAt || null,
          description: formData.description || null,
          createdBy: user?.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create access key')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/access-keys')
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyKey = () => {
    navigator.clipboard.writeText(formData.key)
    alert('Access key copied to clipboard!')
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
                <p className="text-sm text-gray-600">Generate Access Key</p>
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
              <h3 className="text-sm font-medium text-green-800">Access key generated successfully!</h3>
              <p className="text-sm text-green-700 mt-1">
                Key: <code className="font-mono font-semibold">{formData.key}</code>
              </p>
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
              Generate a new access key for employee assessments
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Access Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Key className="w-4 h-4 inline mr-1" />
                Access Key <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg"
                  placeholder="XXXX-XXXX-XXXX"
                />
                <button
                  type="button"
                  onClick={generateKey}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Generate new key"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={copyKey}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">This key will be used by employees to access assessments</p>
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
                <option value="">Select organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
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
                  <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited usage</p>
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

            {/* Summary */}
            {formData.organizationId && formData.assessmentTypes.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3">Access Key Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Key:</span>
                      <code className="font-mono font-semibold text-blue-900">{formData.key}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Organization:</span>
                      <span className="text-blue-900">{selectedOrg?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Assessments:</span>
                      <span className="text-blue-900">{formData.assessmentTypes.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Max Uses:</span>
                      <span className="text-blue-900">{formData.maxUses || 'Unlimited'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Expires:</span>
                      <span className="text-blue-900">
                        {formData.expiresAt ? new Date(formData.expiresAt).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                disabled={loading || formData.assessmentTypes.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Generate Access Key
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
