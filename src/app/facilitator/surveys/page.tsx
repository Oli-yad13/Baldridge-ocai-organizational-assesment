'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FileText,
  LogOut,
  Search,
  Eye,
  Building2,
  Calendar,
  BarChart3,
  Users,
} from 'lucide-react'

interface Organization {
  id: string
  name: string
  logoUrl?: string
  primaryColor: string
}

interface Survey {
  id: string
  title: string
  assessmentType: 'OCAI' | 'BALDRIGE'
  createdAt: string
  _count: {
    responses: number
  }
}

export default function FacilitatorSurveysPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
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
    if (parsedUser.role !== 'FACILITATOR') {
      router.push('/')
      return
    }

    setUser(parsedUser)
    loadData(parsedUser.organizationId)
  }, [router])

  const loadData = async (orgId: string) => {
    try {
      const [orgResponse, surveysResponse] = await Promise.all([
        fetch(`/api/admin/organizations/${orgId}`),
        fetch(`/api/facilitator/surveys?organizationId=${orgId}`)
      ])

      if (orgResponse.ok) {
        const orgData = await orgResponse.json()
        setOrganization(orgData.organization)
      }

      if (surveysResponse.ok) {
        const surveysData = await surveysResponse.json()
        setSurveys(surveysData.surveys)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeBadgeColor = (type: string) => {
    return type === 'OCAI' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
  }

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || survey.assessmentType === filterType
    return matchesSearch && matchesType
  })

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
                <p className="text-sm text-gray-600">Assessment Surveys</p>
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
              className="border-b-2 py-4 px-1 text-sm font-medium"
              style={{
                borderColor: primaryColor,
                color: primaryColor
              }}
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
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Access Keys
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Surveys</h2>
          <p className="text-sm text-gray-600 mt-1">
            View all assessment surveys for your organization
          </p>
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0"
                  style={{
                    borderColor: searchTerm ? primaryColor : undefined,
                    // @ts-ignore - using CSS variable for focus ring color
                    '--tw-ring-color': primaryColor,
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'all'
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={filterType === 'all' ? { backgroundColor: primaryColor } : {}}
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

        {/* Surveys List */}
        {filteredSurveys.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <FileText className="w-8 h-8" style={{ color: primaryColor }} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No surveys found' : 'No surveys yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search or filters'
                : 'Assessment surveys will appear here once created'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurveys.map((survey) => (
              <div key={survey.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <FileText className="w-6 h-6" style={{ color: primaryColor }} />
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(survey.assessmentType)}`}>
                      {survey.assessmentType}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {survey.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(survey.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {survey._count.responses} responses
                    </div>
                  </div>

                  <Link
                    href={`/surveys/${survey.id}`}
                    className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium transition-colors"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
