'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { OCAIResults } from '@/components/ocai/ocai-results'
import type { OCAIScores } from '@/lib/ocai-data'

export default function ThankYouPage() {
  const params = useParams()
  const router = useRouter()
  const [scores, setScores] = useState<OCAIScores | null>(null)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    // Try to get scores from sessionStorage (set during submission)
    const savedScores = sessionStorage.getItem('ocai_submission_scores')
    if (savedScores) {
      setScores(JSON.parse(savedScores))
      setShowResults(true)
      // Clear the scores after loading
      sessionStorage.removeItem('ocai_submission_scores')
    }
  }, [])

  const handleContinue = () => {
    router.push('/employee/assessments')
  }

  if (showResults && scores) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Success Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Assessment Completed Successfully!</h1>
                <p className="text-green-50">Thank you for completing the OCAI culture assessment. Here are your results:</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Display */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <OCAIResults scores={scores} onRestart={handleContinue} />
          
          {/* Action Buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => router.push('/employee/assessments')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              Back to Assessments
            </button>

            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Return to Home
            </button>
          </div>

          {/* Privacy Notice */}
          <div className="mt-8 text-center">
            <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <svg className="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Your responses are confidential and will only be used for aggregated organizational analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fallback: Simple thank you if no scores available
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            Your OCAI culture assessment has been submitted successfully.
            Your responses will help us understand and improve our organizational culture.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/employee/assessments')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Assessments
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Return to Home
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Your responses are confidential and will only be used for aggregated analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
