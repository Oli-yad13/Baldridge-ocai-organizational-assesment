'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  Shield,
  LogOut,
  ArrowLeft,
  Edit,
  Users,
  Key,
  FileText,
  BarChart3,
  MapPin,
  Briefcase,
  Hash,
  Globe,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp,
} from 'lucide-react'

interface Organization {
  id: string
  name: string
  industry?: string
  size?: string
  country?: string
  subscribedAssessments: string
  logoUrl?: string
  primaryColor: string
  isActive: boolean
  createdAt: string
  users: Array<{
    id: string
    name: string
    email: string
    role: string
    createdAt: string
  }>
  accessKeys: Array<{
    id: string
    key: string
    assessmentTypes: string
    isActive: boolean
    usageCount: number
    maxUses: number | null
    expiresAt: string | null
  }>
  surveys: Array<{
    id: string
    title: string
    assessmentType: string
    createdAt: string
    _count: {
      responses: number
    }
  }>
}

export default function OrganizationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

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
    loadOrganization()
  }, [router, params])

  const loadOrganization = async () => {
    try {
      const response = await fetch(`/api/admin/organizations/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setOrganization(data.organization)
      } else {
        router.push('/admin/organizations')
      }
    } catch (error) {
      console.error('Failed to load organization:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async () => {
    if (!organization) return

    try {
      const response = await fetch(`/api/admin/organizations/${organization.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !organization.isActive }),
      })

      if (response.ok) {
        setOrganization({ ...organization, isActive: !organization.isActive })
      }
    } catch (error) {
      console.error('Failed to update organization:', error)
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
          <p className="mt-4 text-gray-600">Loading organization...</p>
        </div>
      </div>
    )
  }

  if (!organization) {
    return null
  }

  const totalResponses = organization.surveys.reduce((sum, s) => sum + s._count.responses, 0)
  const activeAccessKeys = organization.accessKeys.filter(k => k.isActive).length

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
                <p className="text-sm text-gray-600">Organization Details</p>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/admin/organizations"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Organizations
        </Link>

        {/* Organization Header */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {organization.logoUrl ? (
                  <img
                    src={organization.logoUrl}
                    alt={organization.name}
                    className="w-20 h-20 object-contain border border-gray-200 rounded-lg p-2"
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: organization.primaryColor }}
                  >
                    <Building2 className="w-10 h-10 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{organization.name}</h2>
                  <div className="flex items-center space-x-4 mt-2">
                    <button
                      onClick={toggleActive}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        organization.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {organization.isActive ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          Inactive
                        </>
                      )}
                    </button>
                    <span className="text-sm text-gray-500">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Created {new Date(organization.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={`/admin/organizations/${organization.id}/edit`}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </div>

            {/* Organization Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-200">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Industry</p>
                <div className="flex items-center text-sm text-gray-900">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                  {organization.industry || 'Not specified'}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Size</p>
                <div className="flex items-center text-sm text-gray-900">
                  <Hash className="w-4 h-4 mr-2 text-gray-400" />
                  {organization.size || 'Not specified'}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Country</p>
                <div className="flex items-center text-sm text-gray-900">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  {organization.country || 'Not specified'}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Subscriptions</p>
                <div className="flex gap-1">
                  {organization.subscribedAssessments.split(',').map((assessment, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {assessment.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Branding Preview */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase mb-3">Branding Preview</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Primary Color:</span>
                  <div
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: organization.primaryColor }}
                  ></div>
                  <code className="text-xs text-gray-500 font-mono">{organization.primaryColor}</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {organization.users.length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Access Keys</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {organization.accessKeys.length}
                </p>
                <p className="text-xs text-green-600 mt-1">{activeAccessKeys} active</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Key className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Surveys</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {organization.surveys.length}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Responses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalResponses}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Users ({organization.users.length})
              </h3>
              <Link
                href={`/admin/users/new?organizationId=${organization.id}`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add User
              </Link>
            </div>
            <div className="p-6">
              {organization.users.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No users yet</p>
              ) : (
                <div className="space-y-3">
                  {organization.users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.role === 'FACILITATOR'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Access Keys List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Key className="w-5 h-5 mr-2 text-purple-600" />
                Access Keys ({organization.accessKeys.length})
              </h3>
              <Link
                href={`/admin/access-keys/new?organizationId=${organization.id}`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Generate Key
              </Link>
            </div>
            <div className="p-6">
              {organization.accessKeys.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No access keys yet</p>
              ) : (
                <div className="space-y-3">
                  {organization.accessKeys.slice(0, 5).map((key) => (
                    <div key={key.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono font-semibold text-gray-900">{key.key}</code>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          key.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {key.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Usage: {key.usageCount}{key.maxUses && ` / ${key.maxUses}`}</span>
                        <span>{key.assessmentTypes}</span>
                      </div>
                    </div>
                  ))}
                  {organization.accessKeys.length > 5 && (
                    <Link
                      href="/admin/access-keys"
                      className="block text-center text-sm text-blue-600 hover:text-blue-700 pt-2"
                    >
                      View all {organization.accessKeys.length} keys →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Surveys List */}
        <div className="bg-white rounded-lg shadow mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
              Surveys ({organization.surveys.length})
            </h3>
          </div>
          <div className="p-6">
            {organization.surveys.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No surveys created yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Responses
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {organization.surveys.map((survey) => (
                      <tr key={survey.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{survey.title}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            survey.assessmentType === 'OCAI'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {survey.assessmentType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{survey._count.responses}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(survey.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
