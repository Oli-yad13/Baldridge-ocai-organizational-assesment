'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Download, Eye, Lock, CheckCircle } from 'lucide-react'

interface SurveyData {
  id: string
  title: string
  status: string
  allowAnonymous: boolean
  requireOrgEmailDomain: boolean
  openAt: string
  closeAt: string
  organization: {
    name: string
    primaryColor: string
  }
}

export default function InstrumentPage() {
  const params = useParams()
  const surveyId = params.id as string
  
  const [survey, setSurvey] = useState<SurveyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSurveyData()
  }, [surveyId])

  const fetchSurveyData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/surveys/${surveyId}`)
      const data = await response.json()
      
      if (data.survey) {
        setSurvey(data.survey)
      } else {
        setError(data.error || 'Failed to load survey')
      }
    } catch (err) {
      setError('Failed to load survey data')
      console.error('Error fetching survey:', err)
    } finally {
      setLoading(false)
    }
  }

  const downloadInstrument = () => {
    // In production, this would generate a PDF of the instrument
    const instrumentData = {
      title: survey?.title,
      organization: survey?.organization.name,
      status: survey?.status,
      dimensions: [
        {
          name: 'Dominant Characteristics',
          description: 'What the organization emphasizes and rewards',
          options: [
            { letter: 'A', text: 'The organization is a very personal place. It is like an extended family. People seem to share a lot of themselves.', quadrant: 'Clan (Collaborate)' },
            { letter: 'B', text: 'The organization is a very dynamic and entrepreneurial place. People are willing to stick their necks out and take risks.', quadrant: 'Adhocracy (Create)' },
            { letter: 'C', text: 'The organization is very results-oriented. A major concern is with getting the job done. People are very competitive and achievement-oriented.', quadrant: 'Market (Compete)' },
            { letter: 'D', text: 'The organization is a very controlled and structured place. Formal procedures generally govern what people do.', quadrant: 'Hierarchy (Control)' }
          ]
        },
        {
          name: 'Leadership',
          description: 'The style of leadership that is generally encouraged',
          options: [
            { letter: 'A', text: 'The leadership in the organization is generally considered to exemplify mentoring, facilitating, or nurturing.', quadrant: 'Clan (Collaborate)' },
            { letter: 'B', text: 'The leadership in the organization is generally considered to exemplify entrepreneurship, innovating, or risk taking.', quadrant: 'Adhocracy (Create)' },
            { letter: 'C', text: 'The leadership in the organization is generally considered to exemplify a no-nonsense, aggressive, results-oriented focus.', quadrant: 'Market (Compete)' },
            { letter: 'D', text: 'The leadership in the organization is generally considered to exemplify coordinating, organizing, or smooth-running efficiency.', quadrant: 'Hierarchy (Control)' }
          ]
        },
        {
          name: 'Management of Employees',
          description: 'The management approach and philosophy',
          options: [
            { letter: 'A', text: 'The management style in the organization is characterized by teamwork, consensus, and participation.', quadrant: 'Clan (Collaborate)' },
            { letter: 'B', text: 'The management style in the organization is characterized by individual risk-taking, innovation, freedom, and uniqueness.', quadrant: 'Adhocracy (Create)' },
            { letter: 'C', text: 'The management style in the organization is characterized by hard-driving competitiveness, high demands, and achievement.', quadrant: 'Market (Compete)' },
            { letter: 'D', text: 'The management style in the organization is characterized by security of employment, conformity, predictability, and stability in relationships.', quadrant: 'Hierarchy (Control)' }
          ]
        },
        {
          name: 'Organization Glue',
          description: 'What holds the organization together',
          options: [
            { letter: 'A', text: 'The organization is held together by loyalty and tradition. Commitment to this organization runs high.', quadrant: 'Clan (Collaborate)' },
            { letter: 'B', text: 'The organization is held together by commitment to innovation and development. There is an emphasis on being on the cutting edge.', quadrant: 'Adhocracy (Create)' },
            { letter: 'C', text: 'The organization is held together by emphasis on achievement and goal accomplishment. Aggression and winning are common themes.', quadrant: 'Market (Compete)' },
            { letter: 'D', text: 'The organization is held together by formal rules and policies. Maintaining a smooth-running organization is important.', quadrant: 'Hierarchy (Control)' }
          ]
        },
        {
          name: 'Strategic Emphases',
          description: 'What the organization emphasizes in its strategy',
          options: [
            { letter: 'A', text: 'The organization emphasizes human development. High trust, openness, and participation persist.', quadrant: 'Clan (Collaborate)' },
            { letter: 'B', text: 'The organization emphasizes acquiring new resources and creating new challenges. Trying new things and prospecting for opportunities are valued.', quadrant: 'Adhocracy (Create)' },
            { letter: 'C', text: 'The organization emphasizes competitive actions and achievement. Hitting stretch targets and winning in the marketplace are dominant.', quadrant: 'Market (Compete)' },
            { letter: 'D', text: 'The organization emphasizes permanence and stability. Efficiency, control, and smooth operations are valued.', quadrant: 'Hierarchy (Control)' }
          ]
        },
        {
          name: 'Criteria of Success',
          description: 'How the organization defines success',
          options: [
            { letter: 'A', text: 'The organization defines success on the basis of the development of human resources, teamwork, employee commitment, and concern for people.', quadrant: 'Clan (Collaborate)' },
            { letter: 'B', text: 'The organization defines success on the basis of having the most unique or newest products. It is a product leader and innovator.', quadrant: 'Adhocracy (Create)' },
            { letter: 'C', text: 'The organization defines success on the basis of winning in the marketplace and outpacing the competition. Competitive market leadership is key.', quadrant: 'Market (Compete)' },
            { letter: 'D', text: 'The organization defines success on the basis of efficiency. Dependable delivery, smooth scheduling, and low-cost production are critical.', quadrant: 'Hierarchy (Control)' }
          ]
        }
      ]
    }

    // Create a downloadable text file
    const content = generateInstrumentText(instrumentData)
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${survey?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_instrument.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateInstrumentText = (data: any) => {
    let content = `OCAI INSTRUMENT - ${data.title.toUpperCase()}\n`
    content += `Organization: ${data.organization}\n`
    content += `Status: ${data.status}\n`
    content += `Generated: ${new Date().toLocaleDateString()}\n\n`
    content += `INSTRUCTIONS:\n`
    content += `For each dimension, distribute 100 points among the four options (A, B, C, D) based on how well each option describes your organization.\n`
    content += `Do this twice: once for how your organization IS NOW, and once for how you would PREFER it to be.\n\n`

    data.dimensions.forEach((dimension: any, index: number) => {
      content += `${index + 1}. ${dimension.name.toUpperCase()}\n`
      content += `${dimension.description}\n\n`
      
      dimension.options.forEach((option: any) => {
        content += `${option.letter}. ${option.text}\n`
        content += `   (${option.quadrant})\n\n`
      })
      
      content += `NOW: A: ___ B: ___ C: ___ D: ___ (Total: 100)\n`
      content += `PREFERRED: A: ___ B: ___ C: ___ D: ___ (Total: 100)\n\n`
      content += `${'='.repeat(80)}\n\n`
    })

    content += `SCORING SUMMARY:\n`
    content += `- Clan (Collaborate): Average of A responses across all dimensions\n`
    content += `- Adhocracy (Create): Average of B responses across all dimensions\n`
    content += `- Market (Compete): Average of C responses across all dimensions\n`
    content += `- Hierarchy (Control): Average of D responses across all dimensions\n\n`
    content += `Delta = Preferred - Now (positive values indicate desired increases)\n`

    return content
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading instrument...</p>
        </div>
      </div>
    )
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Survey not found'}</p>
          <button
            onClick={fetchSurveyData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const isLocked = survey.status === 'OPEN'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Survey Instrument</h1>
              <p className="text-gray-600">{survey.title}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={downloadInstrument}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Instrument</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Survey Status */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isLocked ? (
                <Lock className="h-6 w-6 text-red-500" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-500" />
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Survey Status: {survey.status}
                </h2>
                <p className="text-gray-600">
                  {isLocked 
                    ? 'Survey is currently open. Core OCAI items are locked and cannot be modified.'
                    : 'Survey is in draft mode. All items can be modified.'
                  }
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <div>Open: {new Date(survey.openAt).toLocaleDateString()}</div>
              <div>Close: {new Date(survey.closeAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Instrument Preview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">OCAI Instrument Preview</h2>
          <p className="text-gray-600 mb-6">
            This is the official OCAI (Organizational Culture Assessment Instrument) questionnaire. 
            The instrument consists of six dimensions, each with four options representing the four 
            culture types in the Competing Values Framework.
          </p>

          <div className="space-y-6">
            {[
              {
                name: 'Dominant Characteristics',
                description: 'What the organization emphasizes and rewards',
                locked: isLocked
              },
              {
                name: 'Leadership', 
                description: 'The style of leadership that is generally encouraged',
                locked: isLocked
              },
              {
                name: 'Management of Employees',
                description: 'The management approach and philosophy',
                locked: isLocked
              },
              {
                name: 'Organization Glue',
                description: 'What holds the organization together',
                locked: isLocked
              },
              {
                name: 'Strategic Emphases',
                description: 'What the organization emphasizes in its strategy',
                locked: isLocked
              },
              {
                name: 'Criteria of Success',
                description: 'How the organization defines success',
                locked: isLocked
              }
            ].map((dimension, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">
                    {index + 1}. {dimension.name}
                  </h3>
                  {dimension.locked && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      Locked
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{dimension.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { letter: 'A', text: 'Clan (Collaborate) - Personal, family-like, shared values' },
                    { letter: 'B', text: 'Adhocracy (Create) - Dynamic, entrepreneurial, innovative' },
                    { letter: 'C', text: 'Market (Compete) - Results-oriented, competitive, achievement-focused' },
                    { letter: 'D', text: 'Hierarchy (Control) - Controlled, structured, formal procedures' }
                  ].map((option) => (
                    <div key={option.letter} className="flex items-center space-x-2">
                      <span className="font-medium text-gray-700">{option.letter}.</span>
                      <span className="text-sm text-gray-600">{option.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex space-x-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">NOW:</span>
                    <span className="ml-2 text-gray-600">A: ___ B: ___ C: ___ D: ___ (Total: 100)</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">PREFERRED:</span>
                    <span className="ml-2 text-gray-600">A: ___ B: ___ C: ___ D: ___ (Total: 100)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scoring Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Scoring Instructions</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Distribute exactly 100 points among the four options (A, B, C, D) for each dimension</li>
              <li>• Complete the assessment twice: once for how your organization IS NOW, once for how you PREFER it to be</li>
              <li>• Scores are averaged across the six dimensions to calculate overall culture type scores</li>
              <li>• Delta = Preferred - Now (positive values indicate desired increases)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
