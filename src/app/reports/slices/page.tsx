'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AggregateData } from '@/lib/aggregation'
import { SliceCard } from '@/components/reports/slice-card'
import { SliceFilters } from '@/components/reports/slice-filters'
import { LeadershipComparison } from '@/components/reports/leadership-comparison'

function SlicesContent() {
  const searchParams = useSearchParams()
  const surveyId = searchParams.get('surveyId') || '1'
  
  const [aggregates, setAggregates] = useState<AggregateData[]>([])
  const [filteredSlices, setFilteredSlices] = useState<AggregateData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    demographicType: 'all',
    minSampleSize: 0,
    sortBy: 'sampleSize'
  })

  useEffect(() => {
    fetchAggregates()
  }, [surveyId])

  useEffect(() => {
    applyFilters()
  }, [aggregates, filters])

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
      setError('Failed to load demographic slices data')
      console.error('Error fetching aggregates:', err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = aggregates.filter(agg => agg.sliceKey !== 'whole_org')

    // Filter by demographic type
    if (filters.demographicType !== 'all') {
      filtered = filtered.filter(agg => agg.sliceKey.startsWith(filters.demographicType))
    }

    // Filter by minimum sample size
    filtered = filtered.filter(agg => agg.n >= filters.minSampleSize)

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'sampleSize':
          return b.n - a.n
        case 'participationRate':
          return b.participationRate - a.participationRate
        case 'alphabetical':
          return a.sliceLabel.localeCompare(b.sliceLabel)
        default:
          return 0
      }
    })

    setFilteredSlices(filtered)
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const demographicTypes = Array.from(
    new Set(aggregates
      .filter(agg => agg.sliceKey !== 'whole_org')
      .map(agg => agg.sliceKey.split(':')[0])
    )
  )

  const leadershipData = aggregates.find(agg => 
    agg.sliceKey.includes('laborUnit') && 
    agg.sliceLabel.toLowerCase().includes('leadership')
  )

  const overallData = aggregates.find(agg => agg.sliceKey === 'whole_org')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading demographic slices...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Demographic Slices</h1>
              <p className="text-gray-600">Culture assessment results by demographic groups</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Print Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Leadership vs All Comparison */}
        {leadershipData && overallData && (
          <div className="mb-8">
            <LeadershipComparison 
              leadership={leadershipData} 
              overall={overallData} 
            />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <SliceFilters
            demographicTypes={demographicTypes}
            filters={filters}
            onFilterChange={handleFilterChange}
            totalSlices={filteredSlices.length}
          />
        </div>

        {/* Slices Grid */}
        {filteredSlices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Demographic Slices Found</h3>
            <p className="text-gray-600">
              No demographic groups meet the current filter criteria or k-anonymity requirements.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSlices.map((slice) => (
              <SliceCard key={slice.id} data={slice} />
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {filteredSlices.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Summary Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredSlices.length}</div>
                <div className="text-sm text-gray-600">Demographic Groups</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(filteredSlices.reduce((sum, slice) => sum + slice.n, 0) / filteredSlices.length)}
                </div>
                <div className="text-sm text-gray-600">Avg Sample Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(filteredSlices.reduce((sum, slice) => sum + slice.participationRate, 0) / filteredSlices.length * 100)}%
                </div>
                <div className="text-sm text-gray-600">Avg Participation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredSlices.filter(slice => slice.n >= 20).length}
                </div>
                <div className="text-sm text-gray-600">High Confidence</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SlicesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading demographic slices...</p>
        </div>
      </div>
    }>
      <SlicesContent />
    </Suspense>
  )
}
