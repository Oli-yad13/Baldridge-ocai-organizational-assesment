'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Key,
  LogOut,
  Building2,
  Copy,
  Eye,
  EyeOff,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
} from 'lucide-react'

interface Organization {
  id: string
  name: string
  logoUrl?: string
  primaryColor: string
}

interface AccessKey {
  id: string
  key: string
  assessmentTypes: string
  maxUses: number | null
  usageCount: number
  isActive: boolean
  expiresAt: string | null
  description: string | null
  createdAt: string
}

export default function FacilitatorAccessKeysPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [accessKeys, setAccessKeys] = useState<AccessKey[]>([])
  const [loading, setLoading] = useState(true)
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/auth/signin')
      return
    }

    const parsedUser = JSON.parse(storedUser)
    if (parsedUser.role !== 'FACILITATOR') {
      router.push('/')
      return
    }

    setUser(parsedUser)
    loadData(parsedUser.organizationId)
  }, [router])

  const loadData = async (orgId: string) => {
    try {
      const [orgResponse, keysResponse] = await Promise.all([
        fetch(`/api/admin/organizations/${orgId}`),
        fetch(`/api/facilitator/access-keys?organizationId=${orgId}`)
      ])

      if (orgResponse.ok) {
        const orgData = await orgResponse.json()
        setOrganization(orgData.organization)
      }

      if (keysResponse.ok) {
        const keysData = await keysResponse.json()
        setAccessKeys(keysData.accessKeys)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Access key copied to clipboard!')
  }

  const toggleReveal = (id: string) => {
    const newRevealed = new Set(revealedKeys)
    if (newRevealed.has(id)) {
      newRevealed.delete(id)
    } else {
      newRevealed.add(id)
    }
    setRevealedKeys(newRevealed)
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const isMaxedOut = (maxUses: number | null, usageCount: number) => {
    if (maxUses === null) return false
    return usageCount >= maxUses
  }

  const handleSignOut = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading || !organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const primaryColor = organization.primaryColor || '#3B82F6'
  const activeKeys = accessKeys.filter(k => k.isActive && !isExpired(k.expiresAt) && !isMaxedOut(k.maxUses, k.usageCount))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Branded Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {organization.logoUrl ? (
                <img
                  src={organization.logoUrl}
                  alt={organization.name}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{organization.name}</h1>
                <p className="text-sm text-gray-600">Access Keys</p>
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <Link
              href="/facilitator/dashboard"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Dashboard
            </Link>
            <Link
              href="/facilitator/surveys"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Surveys
            </Link>
            <Link
              href="/facilitator/reports"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Reports
            </Link>
            <Link
              href="/facilitator/access-keys"
              className="border-b-2 py-4 px-1 text-sm font-medium"
              style={{
                borderColor: primaryColor,
                color: primaryColor
              }}
            >
              Access Keys
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Access Keys</h2>
          <p className="text-sm text-gray-600 mt-1">
            Employee access codes for assessments. Contact your system administrator to request new keys.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderColor: primaryColor }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Keys</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{accessKeys.length}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${primaryColor}20` }}>
                <Key className="w-8 h-8" style={{ color: primaryColor }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Keys</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeKeys.length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {accessKeys.reduce((sum, k) => sum + k.usageCount, 0)}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Access Keys List */}
        {accessKeys.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Key className="w-8 h-8" style={{ color: primaryColor }} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Access Keys Yet</h3>
            <p className="text-gray-600">
              Contact your system administrator to generate access keys for your employees
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {accessKeys.map((accessKey) => {
              const expired = isExpired(accessKey.expiresAt)
              const maxedOut = isMaxedOut(accessKey.maxUses, accessKey.usageCount)
              const isKeyActive = accessKey.isActive && !expired && !maxedOut

              return (
                <div key={accessKey.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Key Display */}
                        <div className="flex items-center space-x-3 mb-4">
                          <div
                            className="p-3 rounded-lg"
                            style={{ backgroundColor: `${primaryColor}20` }}
                          >
                            <Key className="w-6 h-6" style={{ color: primaryColor }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <code className="text-lg font-mono font-semibold text-gray-900">
                                {revealedKeys.has(accessKey.id) ? accessKey.key : '••••••••••••'}
                              </code>
                              <button
                                onClick={() => toggleReveal(accessKey.id)}
                                className="text-gray-400 hover:text-gray-600"
                                title={revealedKeys.has(accessKey.id) ? 'Hide' : 'Reveal'}
                              >
                                {revealedKeys.has(accessKey.id) ? (
                                  <EyeOff className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
                              </button>
                              <button
                                onClick={() => copyToClipboard(accessKey.key)}
                                className="text-gray-400 hover:text-gray-600"
                                title="Copy to clipboard"
                              >
                                <Copy className="w-5 h-5" />
                              </button>
                            </div>
                            {accessKey.description && (
                              <p className="text-sm text-gray-600 mt-1">{accessKey.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Assessments</p>
                            <div className="flex gap-1 mt-1">
                              {accessKey.assessmentTypes.split(',').map((type, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {type.trim()}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Usage</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                              {accessKey.usageCount}
                              {accessKey.maxUses && ` / ${accessKey.maxUses}`}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Expires</p>
                            <p className="text-sm text-gray-900 mt-1">
                              {accessKey.expiresAt ? (
                                <span className={expired ? 'text-red-600 font-semibold' : ''}>
                                  {new Date(accessKey.expiresAt).toLocaleDateString()}
                                </span>
                              ) : (
                                'Never'
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                              isKeyActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {isKeyActive ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" />
                                  {expired ? 'Expired' : maxedOut ? 'Max Uses' : 'Inactive'}
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: `${primaryColor}10`, borderLeft: `4px solid ${primaryColor}` }}>
          <h4 className="font-semibold text-gray-900 mb-2">How to use Access Keys</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Share these keys with your employees to grant them access to assessments</li>
            <li>• Each key specifies which assessment types (OCAI, Baldrige) are available</li>
            <li>• Keys may have usage limits or expiration dates</li>
            <li>• Contact your system administrator to request additional keys or modify existing ones</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
