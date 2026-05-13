'use client'

import { OCAIScores, CULTURE_TYPES } from '@/lib/ocai-data'
import { OCAIRadarChart } from './ocai-radar-chart'
import { OCAIBarChart } from './ocai-bar-chart'

interface OCAIResultsProps {
  scores: OCAIScores
  onRestart?: () => void
}

export function OCAIResults({ scores, onRestart }: OCAIResultsProps) {
  const getCultureType = (scores: OCAIScores['now'] | OCAIScores['preferred']) => {
    const maxScore = Math.max(...Object.values(scores))
    return Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || 'Clan'
  }

  const currentCulture = getCultureType(scores.now)
  const preferredCulture = getCultureType(scores.preferred)

  const getDeltaInsights = () => {
    const insights = []
    
    if (scores.delta.Clan > 5) insights.push(`Strong desire to increase collaboration and teamwork`)
    if (scores.delta.Adhocracy > 5) insights.push(`Strong desire to increase innovation and risk-taking`)
    if (scores.delta.Market > 5) insights.push(`Strong desire to increase competitiveness and results focus`)
    if (scores.delta.Hierarchy > 5) insights.push(`Strong desire to increase structure and control`)
    
    if (scores.delta.Clan < -5) insights.push(`Desire to reduce emphasis on collaboration`)
    if (scores.delta.Adhocracy < -5) insights.push(`Desire to reduce emphasis on innovation`)
    if (scores.delta.Market < -5) insights.push(`Desire to reduce emphasis on competition`)
    if (scores.delta.Hierarchy < -5) insights.push(`Desire to reduce emphasis on structure`)
    
    return insights
  }

  const insights = getDeltaInsights()

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your OCAI Results</h1>
        <p className="text-gray-600">Here's your organizational culture assessment based on the Competing Values Framework.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Culture</h3>
          <div className="flex items-center space-x-3 mb-4">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: CULTURE_TYPES[currentCulture as keyof typeof CULTURE_TYPES].color }}
            />
            <span className="font-medium text-gray-900">
              {CULTURE_TYPES[currentCulture as keyof typeof CULTURE_TYPES].name}
            </span>
          </div>
          <div className="space-y-2">
            {Object.entries(scores.now).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-sm text-gray-600">{key}</span>
                <span className="text-sm font-medium">{value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Culture</h3>
          <div className="flex items-center space-x-3 mb-4">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: CULTURE_TYPES[preferredCulture as keyof typeof CULTURE_TYPES].color }}
            />
            <span className="font-medium text-gray-900">
              {CULTURE_TYPES[preferredCulture as keyof typeof CULTURE_TYPES].name}
            </span>
          </div>
          <div className="space-y-2">
            {Object.entries(scores.preferred).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-sm text-gray-600">{key}</span>
                <span className="text-sm font-medium">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Now vs Preferred Comparison</h3>
          <OCAIRadarChart scores={scores} />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Required (Delta)</h3>
          <OCAIBarChart scores={scores} />
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Key Insights</h3>
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-blue-800">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Culture Type Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Culture Description</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: CULTURE_TYPES[currentCulture as keyof typeof CULTURE_TYPES].color }}
              />
              <span className="font-medium text-gray-900">
                {CULTURE_TYPES[currentCulture as keyof typeof CULTURE_TYPES].name}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {CULTURE_TYPES[currentCulture as keyof typeof CULTURE_TYPES].description}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Culture Description</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: CULTURE_TYPES[preferredCulture as keyof typeof CULTURE_TYPES].color }}
              />
              <span className="font-medium text-gray-900">
                {CULTURE_TYPES[preferredCulture as keyof typeof CULTURE_TYPES].name}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {CULTURE_TYPES[preferredCulture as keyof typeof CULTURE_TYPES].description}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        {/* Retake Assessment button commented out - retakes not allowed for now */}
        {/* {onRestart && (
          <button
            onClick={onRestart}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Retake Assessment
          </button>
        )} */}
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Print Results
        </button>
      </div>
    </div>
  )
}
