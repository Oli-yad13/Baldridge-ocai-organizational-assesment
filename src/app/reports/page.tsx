'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BarChart3, Users, TrendingUp, Shield } from 'lucide-react'

function ReportsContent() {
  const searchParams = useSearchParams()
  const surveyId = searchParams.get('surveyId') || '1'
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  const reportCards = [
    {
      title: 'Organization Overview',
      description: 'High-level culture assessment with dual radar charts, stacked bars, and delta heat tiles',
      icon: BarChart3,
      href: `/reports/org-overview?surveyId=${surveyId}`,
      features: [
        'Dual radar charts (Now vs Preferred)',
        'Stacked bar charts',
        'Delta heat tiles',
        'Concise narrative summary',
        'Methodology notes'
      ]
    },
    {
      title: 'Demographic Slices',
      description: 'Filterable demographic breakdowns with k-anonymity protection and participation rates',
      icon: Users,
      href: `/reports/slices?surveyId=${surveyId}`,
      features: [
        'Filterable demographic cards',
        'K-anonymity protection (k≥7)',
        'Participation rate tracking',
        'Sample size confidence levels',
        'Leadership vs All comparison'
      ]
    },
    {
      title: 'Trend Analysis',
      description: 'Historical trends and change tracking over time (coming soon)',
      icon: TrendingUp,
      href: '#',
      features: [
        'Historical trend analysis',
        'Change tracking over time',
        'Progress monitoring',
        'Benchmark comparisons'
      ],
      comingSoon: true
    },
    {
      title: 'Privacy & Security',
      description: 'Data protection and privacy compliance dashboard (coming soon)',
      icon: Shield,
      href: '#',
      features: [
        'K-anonymity compliance',
        'Data retention policies',
        'Privacy impact assessment',
        'Security audit logs'
      ],
      comingSoon: true
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600">Comprehensive assessment insights and analysis powered by Tenadam</p>
            </div>
            <div className="text-sm text-gray-500">
              Survey ID: {surveyId}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* K-Anonymity Notice */}
        <div className="mb-8 bg-teal-50 border border-teal-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-teal-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-teal-800">Privacy Protection</h3>
              <div className="mt-2 text-sm text-teal-700">
                <p>
                  All reports are protected by k-anonymity (k≥7), ensuring individual privacy while 
                  enabling meaningful demographic analysis. Groups with fewer than 7 responses are 
                  automatically suppressed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportCards.map((report) => {
            const Icon = report.icon
            return (
              <div
                key={report.title}
                className={`bg-white rounded-lg shadow border border-gray-200 overflow-hidden ${
                  report.comingSoon ? 'opacity-75' : 'hover:shadow-lg transition-shadow'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className={`p-3 rounded-lg ${
                        report.comingSoon ? 'bg-gray-100' : 'bg-teal-100'
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          report.comingSoon ? 'text-gray-500' : 'text-teal-700'
                        }`} />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {report.title}
                        </h3>
                        {report.comingSoon && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {report.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {report.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <span className="text-green-500 mr-2">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6">
                    {report.comingSoon ? (
                      <button
                        disabled
                        className="w-full px-4 py-2 bg-gray-100 text-gray-400 rounded-md cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    ) : (
                        <Link
                        href={report.href}
                        className="block w-full px-4 py-2 bg-teal-700 text-white text-center rounded-md hover:bg-teal-800 transition-colors"
                      >
                        View Report
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Methodology Note */}
        <div className="mt-8 bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Methodology & Data Quality</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Sample Size Guidelines</h4>
              <ul className="space-y-1">
                <li>• <strong>7+ responses:</strong> K-anonymity compliant, results shown</li>
                <li>• <strong>10-19 responses:</strong> Low confidence, indicative results</li>
                <li>• <strong>20+ responses:</strong> High confidence, reliable insights</li>
                <li>• <strong>50+ responses:</strong> Very high confidence, robust analysis</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Data Protection</h4>
              <ul className="space-y-1">
                <li>• Individual responses are never displayed</li>
                <li>• All data aggregated using mean scores</li>
                <li>• K-anonymity ensures privacy protection</li>
                <li>• Results are indicative, not determinative</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    }>
      <ReportsContent />
    </Suspense>
  )
}
