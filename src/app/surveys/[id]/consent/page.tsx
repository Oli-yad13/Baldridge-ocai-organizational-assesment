'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, AlertCircle, Shield, Eye, Clock, FileText } from 'lucide-react'

interface ConsentData {
  surveyTitle: string
  organizationName: string
  privacyPolicyUrl?: string
  dataRetentionDays: number
  consentVersion: string
}

export default function ConsentPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.id as string
  
  const [consentData, setConsentData] = useState<ConsentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [consentGiven, setConsentGiven] = useState(false)
  const [anonymousMode, setAnonymousMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchConsentData()
  }, [surveyId])

  const fetchConsentData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/surveys/${surveyId}/consent`)
      const data = await response.json()
      
      if (data.consentData) {
        setConsentData(data.consentData)
      } else {
        setError(data.error || 'Failed to load consent information')
      }
    } catch (err) {
      setError('Failed to load consent information')
      console.error('Error fetching consent data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConsentSubmit = async () => {
    if (!consentGiven) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/surveys/${surveyId}/consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consentGiven: true,
          anonymousMode,
          consentVersion: consentData?.consentVersion
        })
      })

      if (response.ok) {
        router.push(`/surveys/${surveyId}/respond`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to record consent')
      }
    } catch (err) {
      setError('Failed to record consent. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading consent information...</p>
        </div>
      </div>
    )
  }

  if (error || !consentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Consent information not found'}</p>
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

  const retentionYears = Math.round(consentData.dataRetentionDays / 365)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold">Participation Consent</h1>
            <p className="text-blue-100 mt-2">
              {consentData.surveyTitle} - {consentData.organizationName}
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Purpose */}
            <div className="flex items-start space-x-3">
              <FileText className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Purpose of This Assessment</h2>
                <p className="text-gray-600 mt-1">
                  This organizational culture assessment uses the Competing Values Framework (OCAI) 
                  to understand your organization's current culture and preferred culture. The results 
                  will help identify areas for cultural development and improvement.
                </p>
              </div>
            </div>

            {/* Voluntary Participation */}
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Voluntary Participation</h2>
                <p className="text-gray-600 mt-1">
                  Your participation is completely voluntary. You may choose not to participate 
                  or withdraw at any time without any consequences.
                </p>
              </div>
            </div>

            {/* Data Usage */}
            <div className="flex items-start space-x-3">
              <Shield className="h-6 w-6 text-purple-600 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">How Your Data Will Be Used</h2>
                <ul className="text-gray-600 mt-1 space-y-1">
                  <li>• Your responses will be aggregated with others for organizational analysis</li>
                  <li>• Individual responses are never shared or identified in reports</li>
                  <li>• Results are used to create organizational culture insights and recommendations</li>
                  <li>• Data may be used for research purposes in anonymized form</li>
                </ul>
              </div>
            </div>

            {/* Anonymity Option */}
            <div className="flex items-start space-x-3">
              <Eye className="h-6 w-6 text-orange-600 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Anonymity Options</h2>
                <p className="text-gray-600 mt-1">
                  You may choose to participate anonymously. If you select this option, your 
                  responses will not be linked to your identity in any way.
                </p>
                <div className="mt-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={anonymousMode}
                      onChange={(e) => setAnonymousMode(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      I would like to participate anonymously
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Data Retention */}
            <div className="flex items-start space-x-3">
              <Clock className="h-6 w-6 text-indigo-600 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Data Retention</h2>
                <p className="text-gray-600 mt-1">
                  Your data will be retained for up to {retentionYears} years for research and 
                  organizational development purposes, after which it will be securely deleted.
                </p>
              </div>
            </div>

            {/* Privacy Policy */}
            {consentData.privacyPolicyUrl && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Privacy Policy</h3>
                <p className="text-gray-600 text-sm">
                  For detailed information about how we collect, use, and protect your data, 
                  please review our{' '}
                  <a 
                    href={consentData.privacyPolicyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Privacy Policy
                  </a>.
                </p>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Questions or Concerns?</h3>
              <p className="text-gray-600 text-sm">
                If you have any questions about this assessment or your data rights, 
                please contact your organization's data protection officer or HR department.
              </p>
            </div>

            {/* Consent Checkbox */}
            <div className="border-t pt-6">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="consent" className="text-sm text-gray-700">
                  <strong>I have read and understand the information above.</strong> I consent to 
                  participate in this organizational culture assessment and understand how my 
                  data will be used. I acknowledge that my participation is voluntary and I 
                  may withdraw at any time.
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConsentSubmit}
                disabled={!consentGiven || isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'I Consent - Continue to Survey'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
