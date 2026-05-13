'use client'

import { useState } from 'react'
import { AggregateData } from '@/lib/aggregation'
import { LeadershipChart } from './leadership-chart'

interface LeadershipComparisonProps {
  leadership: AggregateData
  overall: AggregateData
}

export function LeadershipComparison({ leadership, overall }: LeadershipComparisonProps) {
  const [activeTab, setActiveTab] = useState<'radar' | 'bars'>('radar')

  const getConfidenceLevel = (n: number) => {
    if (n >= 20) return { level: 'High', color: 'text-green-600', bgColor: 'bg-green-50' }
    if (n >= 10) return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
    return { level: 'Low', color: 'text-red-600', bgColor: 'bg-red-50' }
  }

  const leadershipConfidence = getConfidenceLevel(leadership.n)
  const overallConfidence = getConfidenceLevel(overall.n)

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Leadership vs All</h2>
            <p className="text-gray-600">Comparison between leadership and overall organization culture</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                activeTab === 'radar'
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Radar View
            </button>
            <button
              onClick={() => setActiveTab('bars')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                activeTab === 'bars'
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Bar View
            </button>
          </div>
        </div>

        {/* Sample Size Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Leadership</div>
              <div className="text-sm text-gray-600">n = {leadership.n} responses</div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${leadershipConfidence.bgColor} ${leadershipConfidence.color}`}>
              {leadershipConfidence.level} Confidence
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Overall Organization</div>
              <div className="text-sm text-gray-600">n = {overall.n} responses</div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${overallConfidence.bgColor} ${overallConfidence.color}`}>
              {overallConfidence.level} Confidence
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <LeadershipChart 
            leadership={leadership} 
            overall={overall} 
            chartType={activeTab}
          />
        </div>

        {/* Key Differences */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Leadership Culture</h3>
            <div className="space-y-2 text-sm">
              {Object.entries({
                Clan: leadership.currentClan,
                Adhocracy: leadership.currentAdhocracy,
                Market: leadership.currentMarket,
                Hierarchy: leadership.currentHierarchy
              }).sort(([,a], [,b]) => b - a).map(([culture, score]) => (
                <div key={culture} className="flex justify-between">
                  <span className="text-gray-600">{culture}:</span>
                  <span className="font-medium">{score}%</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Overall Organization</h3>
            <div className="space-y-2 text-sm">
              {Object.entries({
                Clan: overall.currentClan,
                Adhocracy: overall.currentAdhocracy,
                Market: overall.currentMarket,
                Hierarchy: overall.currentHierarchy
              }).sort(([,a], [,b]) => b - a).map(([culture, score]) => (
                <div key={culture} className="flex justify-between">
                  <span className="text-gray-600">{culture}:</span>
                  <span className="font-medium">{score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Differences Analysis */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Key Differences</h3>
          <div className="text-sm text-blue-800 space-y-1">
            {Object.entries({
              Clan: leadership.currentClan - overall.currentClan,
              Adhocracy: leadership.currentAdhocracy - overall.currentAdhocracy,
              Market: leadership.currentMarket - overall.currentMarket,
              Hierarchy: leadership.currentHierarchy - overall.currentHierarchy
            }).filter(([, diff]) => Math.abs(diff) >= 5).map(([culture, diff]) => (
              <div key={culture}>
                <strong>{culture}:</strong> Leadership is {Math.abs(diff)}% more {diff > 0 ? 'focused' : 'focused on other areas'} than overall organization
              </div>
            ))}
            {Object.entries({
              Clan: leadership.currentClan - overall.currentClan,
              Adhocracy: leadership.currentAdhocracy - overall.currentAdhocracy,
              Market: leadership.currentMarket - overall.currentMarket,
              Hierarchy: leadership.currentHierarchy - overall.currentHierarchy
            }).filter(([, diff]) => Math.abs(diff) < 5).length === 4 && (
              <div>Leadership and overall organization show similar cultural patterns</div>
            )}
          </div>
        </div>

        {/* Sample Size Warnings */}
        {(leadership.n < 7 || overall.n < 7) && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Sample Size Warning</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    {leadership.n < 7 && 'Leadership sample size is below k-anonymity threshold. '}
                    {overall.n < 7 && 'Overall sample size is below k-anonymity threshold. '}
                    Results should be interpreted with caution.
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
