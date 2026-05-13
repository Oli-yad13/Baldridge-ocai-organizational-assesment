'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AggregateData } from '@/lib/aggregation'
import { OrgOverviewCharts } from '@/components/reports/org-overview-charts'
import { DeltaHeatTiles } from '@/components/reports/delta-heat-tiles'
import { NarrativeSummary } from '@/components/reports/narrative-summary'
import { MethodologyNote } from '@/components/reports/methodology-note'

function OrgOverviewContent() {
  const searchParams = useSearchParams()
  const surveyId = searchParams.get('surveyId') || '1'
  
  const [aggregates, setAggregates] = useState<AggregateData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAggregates()
  }, [surveyId])

  const fetchAggregates = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/surveys/${surveyId}/aggregate`)
      const data = await response.json()
      
      if (data.aggregates) {
        setAggregates(data.aggregates)
      } else {
        setError(data.error || 'Failed to load data')
      }
    } catch (err) {
      setError('Failed to load organization overview data')
      console.error('Error fetching aggregates:', err)
    } finally {
      setLoading(false)
    }
  }

  const triggerAggregation = async () => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}/aggregate`, {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        // Refresh data after aggregation
        await fetchAggregates()
      } else {
        setError(data.error || 'Failed to trigger aggregation')
      }
    } catch (err) {
      setError('Failed to trigger aggregation')
      console.error('Aggregation error:', err)
    }
  }

  const wholeOrgData = aggregates.find(agg => agg.sliceKey === 'whole_org')
  const demographicSlices = aggregates.filter(agg => agg.sliceKey !== 'whole_org')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organization overview...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAggregates}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!wholeOrgData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Data Available</h1>
          <p className="text-gray-600 mb-4">
            No aggregated data found for this survey. This may be because there are insufficient responses 
            or aggregation hasn't been run yet.
          </p>
          <button
            onClick={triggerAggregation}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Run Aggregation
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Organization Overview</h1>
              <p className="text-gray-600">Culture assessment results and insights</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={triggerAggregation}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Refresh Data
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Print Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Sample Size Warning */}
        {wholeOrgData.n < 7 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Insufficient Sample Size</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Current sample size ({wholeOrgData.n}) is below the minimum threshold (7) for reliable analysis. 
                    Results should be interpreted with caution and are indicative rather than determinative.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Now vs Preferred Comparison</h2>
            <OrgOverviewCharts data={wholeOrgData} />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Required (Delta)</h2>
            <DeltaHeatTiles data={wholeOrgData} />
          </div>
        </div>

        {/* Narrative Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h2>
          <NarrativeSummary data={wholeOrgData} />
        </div>

        {/* Demographic Slices */}
        {demographicSlices.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Demographic Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demographicSlices.map((slice) => (
                <div key={slice.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{slice.sliceLabel}</h3>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Sample Size:</span> {slice.n} responses
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Participation:</span> {Math.round(slice.participationRate * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Dominant Culture:</span> {
                      Object.entries({
                        Clan: slice.currentClan,
                        Adhocracy: slice.currentAdhocracy,
                        Market: slice.currentMarket,
                        Hierarchy: slice.currentHierarchy
                      }).sort(([,a], [,b]) => b - a)[0][0]
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Methodology Note */}
        <MethodologyNote />
      </div>
    </div>
  )
}

export default function OrgOverviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organization overview...</p>
        </div>
      </div>
    }>
      <OrgOverviewContent />
    </Suspense>
  )
}
