'use client'

import { useState } from 'react'

interface FilterState {
  demographicType: string
  minSampleSize: number
  sortBy: string
}

interface SliceFiltersProps {
  demographicTypes: string[]
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  totalSlices: number
}

export function SliceFilters({ demographicTypes, filters, onFilterChange, totalSlices }: SliceFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFilterChange({
      demographicType: 'all',
      minSampleSize: 0,
      sortBy: 'sampleSize'
    })
  }

  const hasActiveFilters = filters.demographicType !== 'all' || filters.minSampleSize > 0

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <span className="text-sm text-gray-600">
              {totalSlices} demographic group{totalSlices !== 1 ? 's' : ''} found
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {isExpanded ? 'Hide' : 'Show'} Filters
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Demographic Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demographic Type
              </label>
              <select
                value={filters.demographicType}
                onChange={(e) => handleFilterChange('demographicType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {demographicTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Sample Size Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Sample Size
              </label>
              <select
                value={filters.minSampleSize}
                onChange={(e) => handleFilterChange('minSampleSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>All Sizes</option>
                <option value={7}>7+ (k-anonymity)</option>
                <option value={10}>10+ (Low confidence)</option>
                <option value={20}>20+ (High confidence)</option>
                <option value={50}>50+ (Very high confidence)</option>
              </select>
            </div>

            {/* Sort By Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sampleSize">Sample Size (High to Low)</option>
                <option value="participationRate">Participation Rate (High to Low)</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>
        )}

        {/* Quick Filter Pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange('minSampleSize', 20)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              filters.minSampleSize === 20
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            High Confidence (20+)
          </button>
          <button
            onClick={() => handleFilterChange('minSampleSize', 10)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              filters.minSampleSize === 10
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Medium+ Confidence (10+)
          </button>
          <button
            onClick={() => handleFilterChange('minSampleSize', 7)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              filters.minSampleSize === 7
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            K-Anonymity (7+)
          </button>
        </div>
      </div>
    </div>
  )
}
