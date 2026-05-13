'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, 
  Users, 
  Plus, 
  Edit, 
  Play, 
  CheckCircle, 
  Clock,
  BarChart3,
  Target,
  MessageSquare
} from 'lucide-react'
import { WorkshopData } from '@/lib/workshop'

export default function WorkshopDetailPage() {
  const params = useParams()
  const router = useRouter()
  const workshopId = params.id as string
  
  const [workshop, setWorkshop] = useState<WorkshopData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWorkshop()
  }, [workshopId])

  const fetchWorkshop = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/workshops/${workshopId}`)
      const data = await response.json()
      
      if (data.workshop) {
        setWorkshop(data.workshop)
      } else {
        setError(data.error || 'Failed to load workshop')
      }
    } catch (err) {
      setError('Failed to load workshop')
      console.error('Error fetching workshop:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-4 w-4" />
      case 'active': return <Play className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workshop...</p>
        </div>
      </div>
    )
  }

  if (error || !workshop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Workshop not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href={`/workshops?surveyId=${workshop.surveyId}`}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{workshop.title}</h1>
                <p className="text-gray-600">{workshop.description || 'No description provided'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(workshop.status)}`}>
                {getStatusIcon(workshop.status)}
                <span className="ml-2 capitalize">{workshop.status}</span>
              </span>
              <Link
                href={`/workshops/${workshop.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Workshop Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Workshop Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Scheduled Date</p>
                    <p className="text-sm text-gray-600">
                      {workshop.scheduledAt 
                        ? new Date(workshop.scheduledAt).toLocaleString()
                        : 'Not scheduled'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Sessions</p>
                    <p className="text-sm text-gray-600">{workshop.sessions.length} session{workshop.sessions.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Target className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Actions</p>
                    <p className="text-sm text-gray-600">{workshop.actions.length} action{workshop.actions.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/workshops/${workshop.id}/sessions/new`}
                  className="w-full flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Session
                </Link>
                <Link
                  href={`/workshops/${workshop.id}/actions/new`}
                  className="w-full flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Add Action
                </Link>
                <Link
                  href={`/workshops/${workshop.id}/charts`}
                  className="w-full flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Pin Charts
                </Link>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sessions Completed</span>
                  <span className="text-sm font-medium">
                    {workshop.sessions.filter(s => s.status === 'completed').length} / {workshop.sessions.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Actions Completed</span>
                  <span className="text-sm font-medium">
                    {workshop.actions.filter(a => a.status === 'completed').length} / {workshop.actions.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Sessions</h2>
            <Link
              href={`/workshops/${workshop.id}/sessions/new`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Session
            </Link>
          </div>

          {workshop.sessions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Yet</h3>
              <p className="text-gray-600 mb-4">Create your first session to start the workshop.</p>
              <Link
                href={`/workshops/${workshop.id}/sessions/new`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Session
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workshop.sessions.map((session) => (
                <div key={session.id} className="bg-white rounded-lg shadow border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{session.title}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                      {getStatusIcon(session.status)}
                      <span className="ml-1 capitalize">{session.status}</span>
                    </span>
                  </div>
                  
                  {session.description && (
                    <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{session.themes.length} themes</span>
                    <span>{session.actions.length} actions</span>
                  </div>

                  <div className="mt-3 flex space-x-2">
                    <Link
                      href={`/workshops/${workshop.id}/sessions/${session.id}`}
                      className="flex-1 text-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                    >
                      View
                    </Link>
                    <Link
                      href={`/workshops/${workshop.id}/sessions/${session.id}/edit`}
                      className="flex-1 text-center px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Actions</h2>
            <Link
              href={`/workshops/${workshop.id}/actions/new`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Action
            </Link>
          </div>

          {workshop.actions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Actions Yet</h3>
              <p className="text-gray-600 mb-4">Create action items to track progress and accountability.</p>
              <Link
                href={`/workshops/${workshop.id}/actions/new`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Action
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {workshop.actions.map((action) => (
                      <tr key={action.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{action.title}</div>
                            {action.description && (
                              <div className="text-sm text-gray-500">{action.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {action.owner || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(action.status)}`}>
                            {getStatusIcon(action.status)}
                            <span className="ml-1 capitalize">{action.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {action.priority}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {action.dueDate 
                            ? new Date(action.dueDate).toLocaleDateString()
                            : 'No due date'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
