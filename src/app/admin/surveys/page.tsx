'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FileText,
  Shield,
  LogOut,
  Search,
  Eye,
  Trash2,
  Building2,
  User,
  Calendar,
  BarChart3,
} from 'lucide-react'

interface Survey {
  id: string
  title: string
  assessmentType: 'OCAI' | 'BALDRIGE'
  organizationId: string
  organization?: {
    name: string
  }
  createdBy: string
  creator?: {
    name: string
  }
  createdAt: string
  _count: {
    responses: number
  }
}

export default function SurveysPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'OCAI' | 'BALDRIGE'>('all')

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
    loadSurveys()
  }, [router])

  const loadSurveys = async () => {
    try {
      const response = await fetch('/api/admin/surveys')
      if (response.ok) {
        const data = await response.json()
        setSurveys(data.surveys)
      }
    } catch (error) {
      console.error('Failed to load surveys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this survey? All associated responses will also be deleted. This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/surveys/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSurveys(surveys.filter(s => s.id !== id))
      } else {
        alert('Failed to delete survey')
      }
    } catch (error) {
      console.error('Failed to delete survey:', error)
      alert('An error occurred')
    }
  }

  const getTypeBadgeColor = (type: string) => {
    return type === 'OCAI' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
  }

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (survey.organization?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (survey.creator?.name || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || survey.assessmentType === filterType

    return matchesSearch && matchesType
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
          <p className="mt-4 text-gray-600">Loading...</p>
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
                <p className="text-sm text-gray-600">Surveys Management</p>
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
              href="/admin/dashboard"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/organizations"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Organizations
            </Link>
            <Link
              href="/admin/access-keys"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Access Keys
            </Link>
            <Link
              href="/admin/users"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Users
            </Link>
            <Link
              href="/admin/surveys"
              className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600"
            >
              Surveys
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Surveys</h2>
            <p className="text-sm text-gray-600 mt-1">
              View and manage all assessment surveys across organizations
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search surveys..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('OCAI')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'OCAI'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                OCAI
              </button>
              <button
                onClick={() => setFilterType('BALDRIGE')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'BALDRIGE'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Baldrige
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Surveys</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{surveys.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">OCAI Surveys</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {surveys.filter(s => s.assessmentType === 'OCAI').length}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Baldrige Surveys</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {surveys.filter(s => s.assessmentType === 'BALDRIGE').length}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Surveys List */}
        {filteredSurveys.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No surveys found' : 'No surveys yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search or filters'
                : 'Surveys will appear here when users create assessments'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Survey
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responses
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSurveys.map((survey) => (
                  <tr key={survey.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 ${
                          survey.assessmentType === 'OCAI'
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                            : 'bg-gradient-to-br from-orange-500 to-red-500'
                        } rounded-lg flex items-center justify-center`}>
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{survey.title}</div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(survey.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(survey.assessmentType)}`}>
                        {survey.assessmentType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                        {survey.organization?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        {survey.creator?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <BarChart3 className="w-4 h-4 mr-2 text-gray-400" />
                        {survey._count.responses}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/surveys/${survey.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="View survey"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(survey.id)}
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
