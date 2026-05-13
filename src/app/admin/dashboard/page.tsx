'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart3,
  Building2,
  Users,
  Key,
  TrendingUp,
  Activity,
  Settings,
  LogOut,
  Plus,
  Shield,
  FileText,
  AlertCircle,
} from 'lucide-react'
import LanguageSwitcher from '@/components/localization/LanguageSwitcher'
import { useLocale } from '@/lib/i18n/context'

interface DashboardStats {
  totalOrganizations: number
  activeOrganizations: number
  totalUsers: number
  totalAccessKeys: number
  activeAccessKeys: number
  totalSurveys: number
  totalResponses: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { t } = useLocale()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
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
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run only once on mount

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
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
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  const quickActions = [
    {
      title: t('dashboard.createOrganization'),
      description: t('dashboard.createOrgDesc'),
      icon: <Building2 className="w-6 h-6" />,
      href: '/admin/organizations/new',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    {
      title: t('dashboard.uploadCredentials'),
      description: t('dashboard.uploadCredDesc'),
      icon: <Users className="w-6 h-6" />,
      href: '/admin/assessment-credentials',
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
    },
    {
      title: t('dashboard.generateAccessKey'),
      description: t('dashboard.generateKeyDesc'),
      icon: <Key className="w-6 h-6" />,
      href: '/admin/access-keys/new',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
    },
    {
      title: t('dashboard.ocaiResults'),
      description: t('dashboard.ocaiResultsDesc'),
      icon: <BarChart3 className="w-6 h-6" />,
      href: '/ocai/results',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
    },
    {
      title: t('dashboard.baldrigeResponses'),
      description: t('dashboard.baldrigeDesc'),
      icon: <FileText className="w-6 h-6" />,
      href: '/admin/baldrige',
      color: 'bg-emerald-500',
      hoverColor: 'hover:bg-emerald-600',
    },
  ]

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
                <p className="text-sm text-gray-600">{t('common.tenadamAssessmentHub')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name}
              </span>
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
              className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600"
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
              href="/admin/assessment-credentials"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              {t('nav.credentials')}
            </Link>
            <Link
              href="/admin/users"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              {t('nav.users')}
            </Link>
            <Link
              href="/admin/ocai"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              {t('nav.ocai')}
            </Link>
            <Link
              href="/admin/baldrige"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              {t('nav.baldrige')}
            </Link>
            <Link
              href="/admin/surveys"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              {t('nav.surveys')}
            </Link>
            <Link
              href="/admin/featured-surveys"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Featured Surveys
            </Link>
            <Link
              href="/admin/settings"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              {t('nav.settings')}
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('nav.organizations')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalOrganizations || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {stats?.activeOrganizations || 0} {t('organizations.active').toLowerCase()}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.totalUsers')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalUsers || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">{t('organizations.allRoles')}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('nav.accessKeys')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalAccessKeys || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {stats?.activeAccessKeys || 0} {t('accessKeys.active').toLowerCase()}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Key className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.totalResponses')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalResponses || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.totalSurveys || 0} {t('nav.surveys').toLowerCase()}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.quickActions')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
              >
                <div className={`${action.color} ${action.hoverColor} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 transition-colors`}>
                  {action.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Organizations */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.recentOrganizations')}</h3>
                <Link href="/admin/organizations" className="text-sm text-blue-600 hover:text-blue-700">
                  {t('dashboard.viewAll')} →
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center py-8 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">{t('dashboard.noRecentOrganizations')}</p>
                <Link
                  href="/admin/organizations/new"
                  className="inline-flex items-center mt-4 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t('dashboard.createFirstOrg')}
                </Link>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.systemStatus')}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{t('dashboard.database')}</span>
                </div>
                <span className="text-sm font-medium text-green-600">{t('dashboard.operational')}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{t('dashboard.apiServices')}</span>
                </div>
                <span className="text-sm font-medium text-green-600">{t('dashboard.operational')}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{t('dashboard.authentication')}</span>
                </div>
                <span className="text-sm font-medium text-green-600">{t('dashboard.operational')}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{t('dashboard.fileStorage')}</span>
                </div>
                <span className="text-sm font-medium text-green-600">{t('dashboard.operational')}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
