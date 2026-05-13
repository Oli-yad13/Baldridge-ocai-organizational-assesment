'use client'

import { AggregateData } from '@/lib/aggregation'

interface DeltaHeatTilesProps {
  data: AggregateData
}

export function DeltaHeatTiles({ data }: DeltaHeatTilesProps) {
  const cultureTypes = [
    { key: 'Clan', name: 'Clan (Collaborate)', color: '#3B82F6' },
    { key: 'Adhocracy', name: 'Adhocracy (Create)', color: '#10B981' },
    { key: 'Market', name: 'Market (Compete)', color: '#F59E0B' },
    { key: 'Hierarchy', name: 'Hierarchy (Control)', color: '#EF4444' }
  ]

  const getDeltaValue = (cultureType: string) => {
    return data.delta[cultureType] || 0
  }

  const getDeltaColor = (value: number) => {
    if (value > 10) return 'bg-green-100 text-green-800 border-green-200'
    if (value > 5) return 'bg-green-50 text-green-700 border-green-100'
    if (value > 0) return 'bg-blue-50 text-blue-700 border-blue-100'
    if (value === 0) return 'bg-gray-50 text-gray-700 border-gray-200'
    if (value > -5) return 'bg-yellow-50 text-yellow-700 border-yellow-100'
    if (value > -10) return 'bg-orange-50 text-orange-700 border-orange-100'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const getDeltaIcon = (value: number) => {
    if (value > 5) return '↗️'
    if (value > 0) return '↗'
    if (value === 0) return '→'
    if (value > -5) return '↘'
    return '↘️'
  }

  const getDeltaDescription = (value: number) => {
    if (value > 10) return 'Strong increase desired'
    if (value > 5) return 'Moderate increase desired'
    if (value > 0) return 'Slight increase desired'
    if (value === 0) return 'No change needed'
    if (value > -5) return 'Slight decrease desired'
    if (value > -10) return 'Moderate decrease desired'
    return 'Strong decrease desired'
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {cultureTypes.map((culture) => {
          const deltaValue = getDeltaValue(culture.key)
          const colorClass = getDeltaColor(deltaValue)
          const icon = getDeltaIcon(deltaValue)
          const description = getDeltaDescription(deltaValue)

          return (
            <div
              key={culture.key}
              className={`border-2 rounded-lg p-4 ${colorClass}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">{culture.name}</h3>
                <span className="text-lg">{icon}</span>
              </div>
              
              <div className="text-2xl font-bold mb-1">
                {deltaValue > 0 ? '+' : ''}{deltaValue}%
              </div>
              
              <div className="text-xs opacity-75">
                {description}
              </div>
              
              <div className="mt-2 text-xs">
                <div className="flex justify-between">
                  <span>Current: {data[`current${culture.key}` as keyof AggregateData] as number}%</span>
                  <span>Preferred: {data[`preferred${culture.key}` as keyof AggregateData] as number}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Change Summary</h4>
        <div className="text-sm text-gray-600 space-y-1">
          {Object.entries(data.delta)
            .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
            .slice(0, 2)
            .map(([culture, value]) => (
              <div key={culture}>
                <span className="font-medium">{culture}:</span> {value > 0 ? 'Increase' : 'Decrease'} by {Math.abs(value)}%
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
