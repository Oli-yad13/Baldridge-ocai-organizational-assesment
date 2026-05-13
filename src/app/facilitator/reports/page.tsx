'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart3,
  LogOut,
  Building2,
  FileText,
  Users,
  TrendingUp,
  Download,
  Calendar,
} from 'lucide-react'

interface Organization {
  id: string
  name: string
  logoUrl?: string
  primaryColor: string
}

interface ReportData {
  totalSurveys: number
  totalResponses: number
  byAssessmentType: {
    OCAI: {
      surveys: number
      responses: number
    }
    BALDRIGE: {
      surveys: number
      responses: number
    }
  }
  recentActivity: Array<{
    id: string
    title: string
    assessmentType: string
    responseCount: number
    createdAt: string
  }>
}

export default function FacilitatorReportsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

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
      const [orgResponse, reportResponse] = await Promise.all([
        fetch(`/api/admin/organizations/${orgId}`),
        fetch(`/api/facilitator/reports?organizationId=${orgId}`)
      ])

      if (orgResponse.ok) {
        const orgData = await orgResponse.json()
        setOrganization(orgData.organization)
      }

      if (reportResponse.ok) {
        const data = await reportResponse.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
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
                <p className="text-sm text-gray-600">Reports & Analytics</p>
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
              className="border-b-2 py-4 px-1 text-sm font-medium"
              style={{
                borderColor: primaryColor,
                color: primaryColor
              }}
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
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Aggregate Reports</h2>
            <p className="text-sm text-gray-600 mt-1">
              Analytics and insights for your organization
            </p>
          </div>
          <button
            className="flex items-center px-4 py-2 rounded-lg text-white font-medium transition-colors"
            style={{ backgroundColor: primaryColor }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>

        {reportData ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderColor: primaryColor }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Surveys</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {reportData.totalSurveys}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${primaryColor}20` }}>
                    <FileText className="w-8 h-8" style={{ color: primaryColor }} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Responses</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {reportData.totalResponses}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <Link href="/ocai/results" className="block">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">OCAI</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {reportData.byAssessmentType.OCAI.responses}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {reportData.byAssessmentType.OCAI.surveys} surveys
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <BarChart3 className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  {reportData.byAssessmentType.OCAI.responses > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <span className="text-sm font-medium text-purple-600 hover:text-purple-700">
                        View Results →
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Baldrige</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {reportData.byAssessmentType.BALDRIGE.responses}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {reportData.byAssessmentType.BALDRIGE.surveys} surveys
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <BarChart3 className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
                {reportData.byAssessmentType.BALDRIGE.responses > 0 ? (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Contact your administrator to export Baldrige responses
                    </p>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-400">
                      No responses available
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            {reportData.recentActivity.length > 0 && (
              <div className="bg-white rounded-lg shadow mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Survey Activity</h3>
                </div>
                <div className="overflow-x-auto">
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
                          Responses
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.recentActivity.map((activity) => (
                        <tr key={activity.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              activity.assessmentType === 'OCAI'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {activity.assessmentType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Users className="w-4 h-4 mr-2 text-gray-400" />
                              {activity.responseCount}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-2" />
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Insights */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div
                    className="p-2 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <BarChart3 className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Assessment Participation</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Average of {reportData.totalSurveys > 0 ? Math.round(reportData.totalResponses / reportData.totalSurveys) : 0} responses per survey
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-50 rounded-lg flex-shrink-0">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Most Used Assessment</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {reportData.byAssessmentType.OCAI.surveys >= reportData.byAssessmentType.BALDRIGE.surveys
                        ? 'OCAI'
                        : 'Baldrige'} is your most utilized assessment type
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <BarChart3 className="w-8 h-8" style={{ color: primaryColor }} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">
              Reports will be generated once survey responses are collected
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
