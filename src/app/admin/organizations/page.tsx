'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Check,
  X,
  Shield,
  LogOut,
  Eye,
} from 'lucide-react'
import { useLocale } from '@/lib/i18n/context'
import LanguageSwitcher from '@/components/localization/LanguageSwitcher'

interface Organization {
  id: string
  name: string
  industry?: string
  size?: string
  country?: string
  subscribedAssessments: string
  isActive: boolean
  createdAt: string
  _count?: {
    users: number
    surveys: number
    accessKeys: number
  }
}

export default function OrganizationsPage() {
  const router = useRouter()
  const { t } = useLocale()
  const [user, setUser] = useState<any>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')

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
      
      const parsedUser = JSON.parse(storedUser)
      
      const response = await fetch('/api/admin/organizations', {
        headers: {
          'x-user-id': parsedUser.id
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.organizations)
      }
    } catch (error) {
      console.error('Failed to load organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/organizations/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setOrganizations(organizations.filter(org => org.id !== id))
      } else {
        alert('Failed to delete organization')
      }
    } catch (error) {
      console.error('Failed to delete organization:', error)
      alert('An error occurred')
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/organizations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        setOrganizations(organizations.map(org =>
          org.id === id ? { ...org, isActive: !currentStatus } : org
        ))
      }
    } catch (error) {
      console.error('Failed to update organization:', error)
    }
  }

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.industry?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterActive === 'all' ||
      (filterActive === 'active' && org.isActive) ||
      (filterActive === 'inactive' && !org.isActive)

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
                <p className="text-sm text-gray-600">{t('organizations.title')}</p>
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
              className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600"
            >
              {t('nav.organizations')}
            </Link>
            <Link
              href="/admin/access-keys"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
            <h2 className="text-2xl font-bold text-gray-900">{t('organizations.title')}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {t('organizations.subtitle')}
            </p>
          </div>
          <Link
            href="/admin/organizations/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('organizations.create')}
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
                  placeholder={`${t('common.search')} ${t('organizations.title').toLowerCase()}...`}
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
                {t('organizations.active')}
              </button>
              <button
                onClick={() => setFilterActive('inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterActive === 'inactive'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('organizations.inactive')}
              </button>
            </div>
          </div>
        </div>

        {/* Organizations List */}
        {filteredOrganizations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? t('organizations.noOrganizations') : t('organizations.noOrganizations')}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'Try adjusting your search or filters'
                : t('organizations.createFirst')}
            </p>
            {!searchTerm && (
              <Link
                href="/admin/organizations/new"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('organizations.create')}
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.organization')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('organizations.industry')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('organizations.assessments')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('nav.users')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.status')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrganizations.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{org.name}</div>
                          <div className="text-sm text-gray-500">{org.country || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{org.industry || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{org.size || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        {org.subscribedAssessments.split(',').map((assessment, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {assessment.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {org._count?.users || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(org.id, org.isActive)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          org.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {org.isActive ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            {t('organizations.active')}
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 mr-1" />
                            {t('organizations.inactive')}
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/organizations/${org.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title={t('common.view')}
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/admin/organizations/${org.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title={t('common.edit')}
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(org.id)}
                          className="text-red-600 hover:text-red-900"
                          title={t('common.delete')}
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
