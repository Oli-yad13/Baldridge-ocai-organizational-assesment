'use client'

import { AggregateData } from '@/lib/aggregation'

interface NarrativeSummaryProps {
  data: AggregateData
}

export function NarrativeSummary({ data }: NarrativeSummaryProps) {
  const getDominantCulture = (scores: { Clan: number; Adhocracy: number; Market: number; Hierarchy: number }) => {
    const entries = Object.entries(scores)
    const maxEntry = entries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )
    return maxEntry[0]
  }

  const getCultureDescription = (culture: string) => {
    const descriptions = {
      Clan: 'collaborative and team-oriented',
      Adhocracy: 'innovative and entrepreneurial',
      Market: 'competitive and results-driven',
      Hierarchy: 'structured and controlled'
    }
    return descriptions[culture as keyof typeof descriptions] || culture
  }

  const getChangeDirection = (delta: number) => {
    if (delta > 5) return 'strong increase'
    if (delta > 0) return 'increase'
    if (delta === 0) return 'no change'
    if (delta > -5) return 'decrease'
    return 'strong decrease'
  }

  const currentDominant = getDominantCulture({
    Clan: data.currentClan,
    Adhocracy: data.currentAdhocracy,
    Market: data.currentMarket,
    Hierarchy: data.currentHierarchy
  })

  const preferredDominant = getDominantCulture({
    Clan: data.preferredClan,
    Adhocracy: data.preferredAdhocracy,
    Market: data.preferredMarket,
    Hierarchy: data.preferredHierarchy
  })

  const significantChanges = Object.entries(data.delta)
    .filter(([, value]) => Math.abs(value) >= 5)
    .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))

  const congruenceScore = Object.values(data.congruenceIndicators).reduce((sum, val) => sum + val, 0) / 4

  return (
    <div className="space-y-4">
      {/* Current State */}
      <div>
        <h3 className="font-medium text-gray-900 mb-2">Current Organizational Culture</h3>
        <p className="text-gray-700">
          Your organization currently exhibits a <strong>{getCultureDescription(currentDominant)}</strong> culture,
          with {currentDominant} scoring {data[`current${currentDominant}` as keyof AggregateData] as number}%.
          This suggests a focus on {getCultureDescription(currentDominant).toLowerCase()} approaches
          to leadership, management, and organizational processes.
        </p>
      </div>

      {/* Preferred State */}
      <div>
        <h3 className="font-medium text-gray-900 mb-2">Preferred Organizational Culture</h3>
        <p className="text-gray-700">
          The preferred culture is <strong>{getCultureDescription(preferredDominant)}</strong>,
          with {preferredDominant} scoring {data[`preferred${preferredDominant}` as keyof AggregateData] as number}%.
          This indicates a desire to shift toward more {getCultureDescription(preferredDominant).toLowerCase()}
          approaches across the organization.
        </p>
      </div>

      {/* Key Changes */}
      {significantChanges.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Key Cultural Shifts Desired</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {significantChanges.map(([culture, delta]) => (
              <li key={culture}>
                <strong>{culture}:</strong> {getChangeDirection(delta)} by {Math.abs(delta)}%
                (from {data[`current${culture}` as keyof AggregateData] as number}% to {data[`preferred${culture}` as keyof AggregateData] as number}%)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Congruence Analysis */}
      <div>
        <h3 className="font-medium text-gray-900 mb-2">Cultural Congruence</h3>
        <p className="text-gray-700">
          The overall congruence between current and preferred cultures is{' '}
          <strong>{Math.round(congruenceScore * 100)}%</strong>, indicating{' '}
          {congruenceScore > 0.7 ? 'high alignment' : 
           congruenceScore > 0.5 ? 'moderate alignment' : 'low alignment'} 
          between where the organization is and where it wants to be.
        </p>
      </div>

      {/* Sample Size Note */}
      {data.n < 7 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> These insights are based on {data.n} responses, which is below 
            the recommended minimum of 7 for reliable analysis. Results should be interpreted 
            as indicative rather than determinative.
          </p>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <h3 className="font-medium text-gray-900 mb-2">Recommendations</h3>
        <div className="space-y-2 text-gray-700">
          {currentDominant !== preferredDominant && (
            <p>
              • Focus on transitioning from {getCultureDescription(currentDominant)} to{' '}
              {getCultureDescription(preferredDominant)} culture through targeted interventions
            </p>
          )}
          {congruenceScore < 0.5 && (
            <p>
              • Address the significant gap between current and preferred cultures through 
              comprehensive change management initiatives
            </p>
          )}
          {significantChanges.length > 0 && (
            <p>
              • Prioritize the {significantChanges[0][0]} dimension for immediate attention, 
              as it shows the largest desired change
            </p>
          )}
          <p>
            • Consider conducting follow-up assessments to track progress and adjust strategies
          </p>
        </div>
      </div>
    </div>
  )
}
