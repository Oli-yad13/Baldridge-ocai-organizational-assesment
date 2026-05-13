'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  LogOut,
  Mail,
  Building2,
  UserCog,
  User,
} from 'lucide-react'
import { useLocale } from '@/lib/i18n/context'
import LanguageSwitcher from '@/components/localization/LanguageSwitcher'

interface User {
  id: string
  name: string
  email: string | null
  role: 'SYSTEM_ADMIN' | 'FACILITATOR' | 'EMPLOYEE'
  organizationId: string | null
  organization: {
    name: string
  } | null
  createdAt: string
  lastLoginAt: string | null
}

export default function UsersPage() {
  const router = useRouter()
  const { t } = useLocale()
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'SYSTEM_ADMIN' | 'FACILITATOR' | 'EMPLOYEE'>('all')

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
    loadUsers()
  }, [router])

  const loadUsers = async () => {
    try {
      const storedUser = localStorage.getItem('user')
      if (!storedUser) return

      const user = JSON.parse(storedUser)

      const response = await fetch('/api/admin/users', {
        headers: {
          'x-user-id': user.id,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        console.error('Failed to load users:', response.status)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const storedUser = localStorage.getItem('user')
      if (!storedUser) return

      const currentUser = JSON.parse(storedUser)

      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUser.id,
        },
      })

      if (response.ok) {
        setUsers(users.filter(u => u.id !== id))
      } else {
        alert('Failed to delete user')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('An error occurred')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return <Shield className="w-5 h-5" />
      case 'FACILITATOR':
        return <UserCog className="w-5 h-5" />
      case 'EMPLOYEE':
        return <User className="w-5 h-5" />
      default:
        return <User className="w-5 h-5" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return 'bg-red-100 text-red-800'
      case 'FACILITATOR':
        return 'bg-blue-100 text-blue-800'
      case 'EMPLOYEE':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.organization?.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = filterRole === 'all' || u.role === filterRole

    return matchesSearch && matchesRole
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
                <p className="text-sm text-gray-600">{t('users.subtitle')}</p>
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
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              {t('nav.accessKeys')}
            </Link>
            <Link
              href="/admin/users"
              className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600"
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
            <h2 className="text-2xl font-bold text-gray-900">{t('users.title')}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {t('users.subtitle')}
            </p>
          </div>
          <Link
            href="/admin/users/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('users.newUser')}
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
                  placeholder={t('common.search') + ' ' + t('users.title').toLowerCase() + '...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterRole('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterRole === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('common.all')}
              </button>
              <button
                onClick={() => setFilterRole('SYSTEM_ADMIN')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterRole === 'SYSTEM_ADMIN'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('users.roles.systemAdmin')}
              </button>
              <button
                onClick={() => setFilterRole('FACILITATOR')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterRole === 'FACILITATOR'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('users.roles.facilitator')}
              </button>
              <button
                onClick={() => setFilterRole('EMPLOYEE')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterRole === 'EMPLOYEE'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('users.roles.employee')}
              </button>
            </div>
          </div>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? t('users.noUsersFound') : t('users.noUsers')}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? t('organizations.tryAdjust')
                : t('users.createFirst')}
            </p>
            {!searchTerm && (
              <Link
                href="/admin/users/new"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('users.newUser')}
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('users.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('users.email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('users.role')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('users.organization')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('users.lastLogin')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 ${
                          u.role === 'SYSTEM_ADMIN' ? 'bg-gradient-to-br from-red-500 to-pink-500' :
                          u.role === 'FACILITATOR' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' :
                          'bg-gradient-to-br from-green-500 to-teal-500'
                        } rounded-lg flex items-center justify-center`}>
                          <div className="text-white">
                            {getRoleIcon(u.role)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{u.name}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.email ? (
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {u.email}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">{t('common.noEmail')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(u.role)}`}>
                        {u.role === 'SYSTEM_ADMIN' ? t('users.roles.systemAdmin') : 
                         u.role === 'FACILITATOR' ? t('users.roles.facilitator') : 
                         t('users.roles.employee')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.organization ? (
                        <div className="flex items-center text-sm text-gray-900">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                          {u.organization.name}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleDateString()
                        : t('common.never')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/users/${u.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title={t('common.edit')}
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-red-600 hover:text-red-900"
                          title={t('common.delete')}
                          disabled={u.id === user?.id}
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
