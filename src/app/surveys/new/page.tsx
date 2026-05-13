'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SurveyFormData {
  title: string
  description: string
  allowAnonymous: boolean
  requireOrgEmailDomain: boolean
  openAt: string
  closeAt: string
}

export default function NewSurveyPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<SurveyFormData>({
    title: '',
    description: '',
    allowAnonymous: true,
    requireOrgEmailDomain: false,
    openAt: '',
    closeAt: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          openAt: formData.openAt ? new Date(formData.openAt).toISOString() : null,
          closeAt: formData.closeAt ? new Date(formData.closeAt).toISOString() : null,
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create survey')
      }

      const survey = await response.json()
      router.push(`/surveys/${survey.id}`)
    } catch (err) {
      setError('Failed to create survey. Please try again.')
      console.error('Survey creation error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Survey</h1>
              <p className="text-gray-600">Set up a new OCAI culture assessment survey</p>
            </div>
            <button
              onClick={() => router.push('/surveys')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Survey Details</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Survey Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Q1 2024 Culture Assessment"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description of the survey purpose and goals"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="openAt" className="block text-sm font-medium text-gray-700 mb-2">
                    Open Date
                  </label>
                  <input
                    type="datetime-local"
                    id="openAt"
                    name="openAt"
                    value={formData.openAt}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">Leave empty to open immediately</p>
                </div>

                <div>
                  <label htmlFor="closeAt" className="block text-sm font-medium text-gray-700 mb-2">
                    Close Date
                  </label>
                  <input
                    type="datetime-local"
                    id="closeAt"
                    name="closeAt"
                    value={formData.closeAt}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">Leave empty for no closing date</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Survey Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowAnonymous"
                  name="allowAnonymous"
                  checked={formData.allowAnonymous}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowAnonymous" className="ml-2 block text-sm text-gray-900">
                  Allow anonymous responses
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireOrgEmailDomain"
                  name="requireOrgEmailDomain"
                  checked={formData.requireOrgEmailDomain}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requireOrgEmailDomain" className="ml-2 block text-sm text-gray-900">
                  Require organization email domain
                </label>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">OCAI Assessment</h3>
            <p className="text-blue-800 text-sm">
              This survey will use the Organizational Culture Assessment Instrument (OCAI) 
              based on the Competing Values Framework. Participants will assess their 
              organization's current culture and preferred culture across six dimensions.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/surveys')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Survey'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
