'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  Upload,
  Shield,
  LogOut,
  ArrowLeft,
  Check,
  AlertCircle,
} from 'lucide-react'

export default function NewOrganizationPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size: '',
    country: '',
    subscribedAssessments: ['OCAI', 'BALDRIGE'],
    logoUrl: '',
    primaryColor: '#3B82F6',
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // For now, we'll use a data URL. In production, you'd upload to cloud storage
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setLogoPreview(result)
        setFormData({ ...formData, logoUrl: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleAssessment = (assessment: string) => {
    const current = formData.subscribedAssessments
    if (current.includes(assessment)) {
      setFormData({
        ...formData,
        subscribedAssessments: current.filter(a => a !== assessment),
      })
    } else {
      setFormData({
        ...formData,
        subscribedAssessments: [...current, assessment],
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify({
          ...formData,
          subscribedAssessments: formData.subscribedAssessments.join(','),
          createdById: user?.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create organization')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/organizations')
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
                <p className="text-sm text-gray-600">Create Organization</p>
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
          href="/admin/organizations"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Organizations
        </Link>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <Check className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Organization created successfully!</h3>
              <p className="text-sm text-green-700 mt-1">Redirecting to organizations list...</p>
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
            <h2 className="text-lg font-semibold text-gray-900">Organization Details</h2>
            <p className="text-sm text-gray-600 mt-1">Add a new client organization to the system</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., Acme Corporation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Select industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Education">Education</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Non-Profit">Non-Profit</option>
                  <option value="Government">Government</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Size
                </label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., Ethiopia"
                />
              </div>
            </div>

            {/* Assessment Subscriptions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscribed Assessments <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.subscribedAssessments.includes('OCAI')}
                    onChange={() => toggleAssessment('OCAI')}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">OCAI</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.subscribedAssessments.includes('BALDRIGE')}
                    onChange={() => toggleAssessment('BALDRIGE')}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Baldrige</span>
                </label>
              </div>
              {formData.subscribedAssessments.length === 0 && (
                <p className="text-xs text-red-600 mt-1">At least one assessment must be selected</p>
              )}
            </div>

            {/* Branding Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Branding & Customization</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    {logoPreview ? (
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-24 h-24 object-contain border border-gray-300 rounded-lg p-2"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoPreview(null)
                            setFormData({ ...formData, logoUrl: '' })
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Upload className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Upload Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                </div>

                {/* Primary Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-16 h-16 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <div>
                      <input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm text-gray-900"
                        placeholder="#3B82F6"
                      />
                      <p className="text-xs text-gray-500 mt-1">Used for assessment UI</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-xs font-medium text-gray-600 mb-3">BRANDING PREVIEW</p>
                <div className="bg-white rounded-lg p-4 flex items-center space-x-4">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-12 h-12 object-contain" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">{formData.name || 'Organization Name'}</h4>
                    <p className="text-sm text-gray-600">Assessment Interface</p>
                  </div>
                  <div
                    className="ml-auto px-4 py-2 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    Button Preview
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/admin/organizations"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || formData.subscribedAssessments.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 mr-2" />
                    Create Organization
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
