'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Building2, User, PlayCircle, Loader2 } from 'lucide-react'
import { useLocale } from '@/lib/i18n/context'

interface FeaturedSurvey {
  id: string
  assessmentType: string
  title: string
  description: string | null
  isActive: boolean
}

export default function FeaturedSurveys() {
  const { t } = useLocale()
  const [surveys, setSurveys] = useState<FeaturedSurvey[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSurveys()
  }, [])

  const fetchSurveys = async () => {
    try {
      const res = await fetch('/api/featured-surveys')
      if (res.ok) {
        const data = await res.json()
        setSurveys(data)
      }
    } catch (error) {
      console.error('Error fetching featured surveys:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check which surveys are active
  const isFetanPayActive = surveys.some(s => s.assessmentType === 'FETAN_PAY')
  const isSankofaActive = surveys.some(s => s.assessmentType === 'SANKOFA')

  // If no active surveys, don't render the section
  if (!loading && surveys.length === 0) {
    return null
  }

  if (loading) {
    return (
      <section className="py-12 sm:py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">
            Featured Surveys
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
            Participate in our featured assessments. No account required.
          </p>
        </div>

        <div className={`grid grid-cols-1 ${isFetanPayActive && isSankofaActive ? 'md:grid-cols-2' : ''} gap-8 max-w-5xl mx-auto`}>
          {/* Fetan Pay Survey Card */}
          {isFetanPayActive && (
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group animate-fade-in-up animation-delay-300 flex flex-col">
            <div className="h-48 bg-gradient-to-br from-teal-600 to-emerald-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-opacity-90 font-bold text-3xl tracking-wider">Fetan Pay</div>
              </div>
            </div>
            <div className="p-6 sm:p-8 flex-1 flex flex-col">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-teal-700 transition-colors">
                  {surveys.find(s => s.assessmentType === 'FETAN_PAY')?.title || 'Fetan Pay Survey'}
              </h3>
              <p className="text-gray-600 mb-6 flex-1">
                  {surveys.find(s => s.assessmentType === 'FETAN_PAY')?.description || 
                    'Help us validate a new Payroll & Employee Financial Services solution. Your feedback on payroll processing, tax compliance, and financial benefits will shape the future of work in Ethiopia.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
                <Link
                  href="/surveys/fetan-pay/employer"
                  className="flex items-center justify-center px-4 py-3 bg-white border-2 border-teal-600 text-teal-700 rounded-xl font-semibold hover:bg-teal-50 transition-colors group/btn"
                >
                  <Building2 className="w-5 h-5 mr-2 group-hover/btn:scale-110 transition-transform" />
                  For Employers
                </Link>
                <Link
                  href="/surveys/fetan-pay/employee"
                  className="flex items-center justify-center px-4 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors shadow-md hover:shadow-lg group/btn"
                >
                  <User className="w-5 h-5 mr-2 group-hover/btn:scale-110 transition-transform" />
                  For Employees
                </Link>
              </div>
            </div>
          </div>
          )}

          {/* Sankofa Survey Card */}
          {isSankofaActive && (
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group animate-fade-in-up animation-delay-400 flex flex-col">
            <div className="h-48 bg-gradient-to-br from-emerald-700 to-teal-900 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-opacity-90 font-bold text-3xl tracking-wider">CSankofa (cso.et)</div>
              </div>
            </div>
            <div className="p-6 sm:p-8 flex-1 flex flex-col">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-800 transition-colors">
                  {surveys.find(s => s.assessmentType === 'SANKOFA')?.title || 'CSankofa CSO Assessment'}
              </h3>
              <p className="text-gray-600 mb-6 flex-1">
                  {surveys.find(s => s.assessmentType === 'SANKOFA')?.description || 
                    'Let us understand about your Civil Society Organization more. Using your feedback, we can develop our products more and make them more value adding to your Civil Society Organization.'}
              </p>

              <div className="mt-auto">
                <Link
                  href="/surveys/sankofa"
                  className="flex items-center justify-center w-full px-6 py-3.5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-xl font-semibold hover:from-emerald-800 hover:to-teal-900 transition-all shadow-md hover:shadow-lg group/btn"
                >
                  <PlayCircle className="w-5 h-5 mr-2 group-hover/btn:scale-110 transition-transform" />
                  Start Survey
                  <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </section>
  )
}
