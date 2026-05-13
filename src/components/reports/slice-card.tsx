'use client'

import { useState } from 'react'
import { AggregateData } from '@/lib/aggregation'
import { SliceChart } from './slice-chart'

interface SliceCardProps {
  data: AggregateData
}

export function SliceCard({ data }: SliceCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getDominantCulture = (scores: { Clan: number; Adhocracy: number; Market: number; Hierarchy: number }) => {
    const entries = Object.entries(scores)
    const maxEntry = entries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )
    return maxEntry[0]
  }

  const getConfidenceLevel = (n: number) => {
    if (n >= 20) return { level: 'High', color: 'text-green-600', bgColor: 'bg-green-50' }
    if (n >= 10) return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
    return { level: 'Low', color: 'text-red-600', bgColor: 'bg-red-50' }
  }

  const currentScores = {
    Clan: data.currentClan,
    Adhocracy: data.currentAdhocracy,
    Market: data.currentMarket,
    Hierarchy: data.currentHierarchy
  }

  const preferredScores = {
    Clan: data.preferredClan,
    Adhocracy: data.preferredAdhocracy,
    Market: data.preferredMarket,
    Hierarchy: data.preferredHierarchy
  }

  const currentDominant = getDominantCulture(currentScores)
  const preferredDominant = getDominantCulture(preferredScores)
  const confidence = getConfidenceLevel(data.n)

  const significantChanges = Object.entries(data.delta)
    .filter(([, value]) => Math.abs(value) >= 5)
    .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-gray-900 text-sm">{data.sliceLabel}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${confidence.bgColor} ${confidence.color}`}>
            {confidence.level}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>n = {data.n}</span>
          <span>{Math.round(data.participationRate * 100)}% participation</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Current vs Preferred */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Current:</span>
            <span className="font-medium">{currentDominant} ({data[`current${currentDominant}` as keyof AggregateData] as number}%)</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Preferred:</span>
            <span className="font-medium">{preferredDominant} ({data[`preferred${preferredDominant}` as keyof AggregateData] as number}%)</span>
          </div>
        </div>

        {/* Key Changes */}
        {significantChanges.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Key Changes</h4>
            <div className="space-y-1">
              {significantChanges.slice(0, 2).map(([culture, delta]) => (
                <div key={culture} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{culture}:</span>
                  <span className={`font-medium ${delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {delta > 0 ? '+' : ''}{delta}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Congruence */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">Congruence:</span>
            <span className="font-medium">
              {Math.round(Object.values(data.congruenceIndicators).reduce((sum, val) => sum + val, 0) / 4 * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-blue-600 h-1 rounded-full" 
              style={{ 
                width: `${Object.values(data.congruenceIndicators).reduce((sum, val) => sum + val, 0) / 4 * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Toggle Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Detailed View */}
      {showDetails && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="space-y-4">
            {/* Chart */}
            <div className="h-48">
              <SliceChart data={data} />
            </div>

            {/* Detailed Scores */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2">Detailed Scores</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['Clan', 'Adhocracy', 'Market', 'Hierarchy'].map((culture) => (
                  <div key={culture} className="space-y-1">
                    <div className="font-medium text-gray-900">{culture}</div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Now:</span>
                      <span>{data[`current${culture}` as keyof AggregateData] as number}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pref:</span>
                      <span>{data[`preferred${culture}` as keyof AggregateData] as number}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Δ:</span>
                      <span className={data.delta[culture] > 0 ? 'text-green-600' : 'text-red-600'}>
                        {data.delta[culture] > 0 ? '+' : ''}{data.delta[culture]}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Size Warning */}
            {data.n < 7 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Sample size below k-anonymity threshold. 
                  Results are suppressed for privacy protection.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
