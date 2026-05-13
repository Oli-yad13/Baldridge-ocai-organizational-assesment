'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Key,
  Plus,
  Search,
  Edit,
  Trash2,
  Check,
  X,
  Shield,
  LogOut,
  Copy,
  Eye,
  EyeOff,
  Calendar,
} from 'lucide-react'
import { useLocale } from '@/lib/i18n/context'
import LanguageSwitcher from '@/components/localization/LanguageSwitcher'

interface AccessKey {
  id: string
  key: string
  organizationId: string
  organization: {
    name: string
    isActive: boolean
  }
  assessmentTypes: string
  maxUses: number | null
  usageCount: number
  isActive: boolean
  expiresAt: string | null
  description: string | null
  createdAt: string
}

export default function AccessKeysPage() {
  const router = useRouter()
  const { t } = useLocale()
  const [user, setUser] = useState<any>(null)
  const [accessKeys, setAccessKeys] = useState<AccessKey[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())

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

  // Load access keys when user is set
  useEffect(() => {
    if (user?.id) {
      loadAccessKeys()
    }
  }, [user])

  const loadAccessKeys = async () => {
    if (!user?.id) {
      console.error('No user ID available for loading access keys')
      setLoading(false)
      return
    }

    try {
      console.log('Loading access keys with user ID:', user.id)
      const response = await fetch('/api/admin/access-keys', {
        headers: {
          'x-user-id': user.id
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Access keys loaded:', data.accessKeys)
        setAccessKeys(data.accessKeys)
      } else {
        console.error('Failed to load access keys:', response.status, response.statusText)
        const errorData = await response.json()
        console.error('Error details:', errorData)
      }
    } catch (error) {
      console.error('Failed to load access keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this access key? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/access-keys/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setAccessKeys(accessKeys.filter(key => key.id !== id))
      } else {
        alert('Failed to delete access key')
      }
    } catch (error) {
      console.error('Failed to delete access key:', error)
      alert('An error occurred')
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/access-keys/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        setAccessKeys(accessKeys.map(key =>
          key.id === id ? { ...key, isActive: !currentStatus } : key
        ))
      }
    } catch (error) {
      console.error('Failed to update access key:', error)
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

  const filteredAccessKeys = accessKeys.filter(key => {
    const matchesSearch = key.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.organization.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterActive === 'all' ||
      (filterActive === 'active' && key.isActive && !isExpired(key.expiresAt) && !isMaxedOut(key.maxUses, key.usageCount)) ||
      (filterActive === 'inactive' && (!key.isActive || isExpired(key.expiresAt) || isMaxedOut(key.maxUses, key.usageCount)))

    return matchesSearch && matchesFilter
  })

  const handleSignOut = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
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
                <h1 className="text-xl font-bold text-gray-900">{t('common.systemAdministration')}</h1>
                <p className="text-sm text-gray-600">{t('accessKeys.title')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <LanguageSwitcher />
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">{t('nav.signOut')}</span>
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
              href="/admin/dashboard"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              {t('nav.dashboard')}
            </Link>
            <Link
              href="/admin/organizations"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              {t('nav.organizations')}
            </Link>
            <Link
              href="/admin/access-keys"
              className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600"
            >
              {t('nav.accessKeys')}
            </Link>
            <Link
              href="/admin/users"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              {t('nav.users')}
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('accessKeys.title')}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {t('accessKeys.subtitle')}
            </p>
          </div>
          <Link
            href="/admin/access-keys/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('accessKeys.generateNew')}
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`${t('common.search')} ${t('nav.accessKeys').toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterActive('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterActive === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('common.all')}
              </button>
              <button
                onClick={() => setFilterActive('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterActive === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('accessKeys.active')}
              </button>
              <button
                onClick={() => setFilterActive('inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterActive === 'inactive'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('accessKeys.expired')}
              </button>
            </div>
          </div>
        </div>

        {/* Access Keys List */}
        {filteredAccessKeys.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No access keys found' : 'No access keys yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'Try adjusting your search or filters'
                : 'Generate your first access key to get started'}
            </p>
            {!searchTerm && (
              <Link
                href="/admin/access-keys/new"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Generate Access Key
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assessments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccessKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Key className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <code className="text-sm font-mono text-gray-900">
                              {revealedKeys.has(key.id) ? key.key : '••••••••'}
                            </code>
                            <button
                              onClick={() => toggleReveal(key.id)}
                              className="text-gray-400 hover:text-gray-600"
                              title={revealedKeys.has(key.id) ? 'Hide' : 'Reveal'}
                            >
                              {revealedKeys.has(key.id) ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => copyToClipboard(key.key)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          {key.description && (
                            <div className="text-xs text-gray-500 mt-1">{key.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{key.organization.name}</div>
                      {!key.organization.isActive && (
                        <div className="text-xs text-red-600">Org Inactive</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        {key.assessmentTypes.split(',').map((assessment, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {assessment.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {key.usageCount} {key.maxUses !== null && `/ ${key.maxUses}`}
                      </div>
                      {key.expiresAt && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {isExpired(key.expiresAt) ? (
                            <span className="text-red-600">Expired</span>
                          ) : (
                            `Expires ${new Date(key.expiresAt).toLocaleDateString()}`
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(key.id, key.isActive)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          key.isActive && !isExpired(key.expiresAt) && !isMaxedOut(key.maxUses, key.usageCount)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {key.isActive && !isExpired(key.expiresAt) && !isMaxedOut(key.maxUses, key.usageCount) ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/access-keys/${key.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(key.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
