'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { OCAIQuestionnaire } from '@/components/ocai/ocai-questionnaire'
import { OCAIScores } from '@/lib/ocai-data'
import {
  loadAssessmentProgress,
  markAssessmentCompleted,
  isAssessmentCompleted,
} from '@/lib/assessment-progress'

interface Survey {
  id: string
  title: string
  status: string
  allowAnonymous: boolean
  requireOrgEmailDomain: boolean
}

export default function SurveyRespondPage() {
  const params = useParams()
  const router = useRouter()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        // Check if assessment already completed (server-side check)
        const storedUser = localStorage.getItem('user')

        if (storedUser) {
          const user = JSON.parse(storedUser)

          // Server-side completion check for credential users
          if (user.id) {
            const completionCheck = await fetch(`/api/ocai/check-completion?surveyId=${params.id}`, {
              headers: {
                'x-user-id': user.id
              }
            })

            if (completionCheck.ok) {
              const completionData = await completionCheck.json()
              if (completionData.isCompleted) {
                // Already completed - redirect to results page
                alert('You have already completed this assessment. Redirecting to your results...')
                router.push('/ocai/my-results')
                return
              }
            }
          }
        }

        const response = await fetch(`/api/surveys/${params.id}`)
        if (response.ok) {
          const surveyData = await response.json()
          setSurvey(surveyData)
        } else {
          setSurvey(null)
        }
      } catch (error) {
        console.error('Error fetching survey:', error)
        setSurvey(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSurvey()
  }, [params.id, router])

  const handleComplete = async (scores: OCAIScores, demographics: any) => {
    setSubmitting(true)
    setError('')

    try {
      // Get user data from localStorage
      const storedUser = localStorage.getItem('user')
      const storedOrg = localStorage.getItem('organization')
      const storedAccessKey = localStorage.getItem('accessKey')

      let userId = null
      if (storedUser) {
        const user = JSON.parse(storedUser)
        userId = user.id
      }

      // Submit to the API with the correct data structure including userId
      const response = await fetch(`/api/surveys/${params.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,  // Include userId in submission
          demographics,
          nowScores: {
            clan: scores.now.Clan,
            adhocracy: scores.now.Adhocracy,
            market: scores.now.Market,
            hierarchy: scores.now.Hierarchy
          },
          preferredScores: {
            clan: scores.preferred.Clan,
            adhocracy: scores.preferred.Adhocracy,
            market: scores.preferred.Market,
            hierarchy: scores.preferred.Hierarchy
          },
          consentGiven: true,  // Add consent flag
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit response')
      }

      // Mark assessment as completed (permanent)
      if (storedUser && storedOrg) {
        const user = JSON.parse(storedUser)
        const org = JSON.parse(storedOrg)
        markAssessmentCompleted('OCAI', org.id, user.id, storedAccessKey || '')
      }

      // Save scores to sessionStorage for the thank you page to display
      sessionStorage.setItem('ocai_submission_scores', JSON.stringify(scores))

      // Redirect to thank you page with results
      router.push(`/surveys/${params.id}/thank-you`)
    } catch (err) {
      setError('Failed to submit your response. Please try again.')
      console.error('Submission error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading survey...</p>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Survey Not Found</h1>
          <p className="text-gray-600 mb-4">The survey you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/surveys')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View All Surveys
          </button>
        </div>
      </div>
    )
  }

  if (survey.status !== 'OPEN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Survey Closed</h1>
          <p className="text-gray-600 mb-4">This survey is no longer accepting responses.</p>
          <button
            onClick={() => router.push('/surveys')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View All Surveys
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
              <p className="text-gray-600">Complete the OCAI culture assessment below</p>
            </div>
            <button
              onClick={() => router.push('/employee/assessments')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="py-8">
        {error && (
          <div className="max-w-4xl mx-auto px-6 mb-6">
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
          </div>
        )}

        <OCAIQuestionnaire
          surveyId={survey.id}
          onComplete={handleComplete}
        />

        {submitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-900">Submitting your response...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
