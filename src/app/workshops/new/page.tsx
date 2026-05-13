'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Calendar, Users, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function NewWorkshopContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const surveyId = searchParams.get('surveyId') || '1'
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    facilitatorId: '',
    scheduledAt: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/workshops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          surveyId,
          scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : undefined
        })
      })

      const data = await response.json()

      if (data.workshop) {
        router.push(`/workshops/${data.workshop.id}`)
      } else {
        setError(data.error || 'Failed to create workshop')
      }
    } catch (err) {
      setError('Failed to create workshop')
      console.error('Error creating workshop:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center">
            <Link
              href={`/workshops?surveyId=${surveyId}`}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Workshop</h1>
              <p className="text-gray-600">Set up a workshop to facilitate culture change discussions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-8 px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Workshop Details</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Workshop Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Culture Change Planning Session"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the purpose and objectives of this workshop..."
                />
              </div>

              <div>
                <label htmlFor="facilitatorId" className="block text-sm font-medium text-gray-700 mb-2">
                  Facilitator
                </label>
                <input
                  type="text"
                  id="facilitatorId"
                  name="facilitatorId"
                  value={formData.facilitatorId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Facilitator name or email"
                />
              </div>

              <div>
                <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="scheduledAt"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Workshop Features Preview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Workshop Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Chart Pinning</h3>
                  <p className="text-sm text-gray-600">Pin key charts and visualizations for discussion</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Theme Capture</h3>
                  <p className="text-sm text-gray-600">Identify and categorize key themes from discussions</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Action Planning</h3>
                  <p className="text-sm text-gray-600">Create actionable items with owners and timelines</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Link
              href={`/workshops?surveyId=${surveyId}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Workshop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewWorkshopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <NewWorkshopContent />
    </Suspense>
  )
}
