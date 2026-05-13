'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, Users, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { WorkshopData } from '@/lib/workshop'

function WorkshopsContent() {
  const searchParams = useSearchParams()
  const surveyId = searchParams.get('surveyId') || '1'
  
  const [workshops, setWorkshops] = useState<WorkshopData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWorkshops()
  }, [surveyId])

  const fetchWorkshops = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/workshops?surveyId=${surveyId}`)
      const data = await response.json()
      
      if (data.workshops) {
        setWorkshops(data.workshops)
      } else {
        setError(data.error || 'Failed to load workshops')
      }
    } catch (err) {
      setError('Failed to load workshops')
      console.error('Error fetching workshops:', err)
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
      case 'active': return <Users className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workshops...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchWorkshops}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workshops & Action Planning</h1>
              <p className="text-gray-600">Facilitate culture change through structured workshops</p>
            </div>
            <Link
              href={`/workshops/new?surveyId=${surveyId}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Workshop
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-6">
        {workshops.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Workshops Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first workshop to start facilitating culture change discussions.
            </p>
            <Link
              href={`/workshops/new?surveyId=${surveyId}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Workshop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((workshop) => (
              <div key={workshop.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{workshop.title}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workshop.status)}`}>
                      {getStatusIcon(workshop.status)}
                      <span className="ml-1 capitalize">{workshop.status}</span>
                    </span>
                  </div>
                  
                  {workshop.description && (
                    <p className="text-gray-600 text-sm mb-4">{workshop.description}</p>
                  )}

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {workshop.scheduledAt 
                          ? new Date(workshop.scheduledAt).toLocaleDateString()
                          : 'Not scheduled'
                        }
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{workshop.sessions.length} session{workshop.sessions.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>{workshop.actions.length} action{workshop.actions.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      href={`/workshops/${workshop.id}`}
                      className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/workshops/${workshop.id}/edit`}
                      className="flex-1 text-center px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {workshops.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Workshops</p>
                  <p className="text-2xl font-bold text-gray-900">{workshops.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {workshops.filter(w => w.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {workshops.filter(w => w.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Actions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {workshops.reduce((sum, w) => sum + w.actions.length, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function WorkshopsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workshops...</p>
        </div>
      </div>
    }>
      <WorkshopsContent />
    </Suspense>
  )
}
