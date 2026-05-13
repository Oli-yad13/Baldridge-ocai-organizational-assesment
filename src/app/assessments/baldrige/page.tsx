'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Clock, FileText, Award, CheckCircle, Info, BarChart3 } from 'lucide-react'
import { useLocale } from '@/lib/i18n/context'
import LanguageSwitcher from '@/components/localization/LanguageSwitcher'

export default function BaldrigeIntroPage() {
  const router = useRouter()
  const { t } = useLocale()
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has already completed the Baldrige assessment
    const checkCompletion = async () => {
      try {
        const response = await fetch('/api/baldrige/progress')
        if (response.ok) {
          const data = await response.json()
          setIsCompleted(data.progress?.isCompleted || false)
        }
      } catch (error) {
        console.error('Error checking assessment completion:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkCompletion()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src="/tenadam-logo.png"
                  alt="Tenadam Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('baldrigeIntro.title')}</h1>
                <p className="text-sm text-emerald-600 font-medium">{t('baldrigeIntro.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Link
                href="/employee/assessments"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span>{t('common.back')}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
            <Award className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('baldrigeIntro.heroTitle')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('baldrigeIntro.heroDescription')}
          </p>
        </div>

        {/* Assessment Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('baldrigeIntro.duration')}</h3>
            <p className="text-gray-600">{t('baldrigeIntro.durationTime')}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('baldrigeIntro.questions')}</h3>
            <p className="text-gray-600">{t('baldrigeIntro.questionsCount')}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('baldrigeIntro.format')}</h3>
            <p className="text-gray-600">{t('baldrigeIntro.formatType')}</p>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('baldrigeIntro.categoriesTitle')}</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-white rounded-lg border border-emerald-100">
              <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                0
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t('baldrigeIntro.cat0Title')}</h4>
                <p className="text-sm text-gray-600">{t('baldrigeIntro.cat0Desc')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-100">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t('baldrigeIntro.cat1Title')}</h4>
                <p className="text-sm text-gray-600">{t('baldrigeIntro.cat1Desc')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-100">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t('baldrigeIntro.cat2Title')}</h4>
                <p className="text-sm text-gray-600">{t('baldrigeIntro.cat2Desc')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-pink-50 to-white rounded-lg border border-pink-100">
              <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t('baldrigeIntro.cat3Title')}</h4>
                <p className="text-sm text-gray-600">{t('baldrigeIntro.cat3Desc')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-teal-50 to-white rounded-lg border border-teal-100">
              <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t('baldrigeIntro.cat4Title')}</h4>
                <p className="text-sm text-gray-600">{t('baldrigeIntro.cat4Desc')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-orange-50 to-white rounded-lg border border-orange-100">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                5
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t('baldrigeIntro.cat5Title')}</h4>
                <p className="text-sm text-gray-600">{t('baldrigeIntro.cat5Desc')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-indigo-50 to-white rounded-lg border border-indigo-100">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                6
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t('baldrigeIntro.cat6Title')}</h4>
                <p className="text-sm text-gray-600">{t('baldrigeIntro.cat6Desc')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-100">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                7
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t('baldrigeIntro.cat7Title')}</h4>
                <p className="text-sm text-gray-600">{t('baldrigeIntro.cat7Desc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 mb-12">
          <div className="flex items-start space-x-3 mb-4">
            <Info className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-emerald-900 mb-3">{t('baldrigeIntro.howItWorksTitle')}</h3>
              <div className="space-y-3 text-emerald-800">
                <p>
                  <strong>{t('baldrigeIntro.step1Label')}</strong> {t('baldrigeIntro.step1Text')}
                </p>
                <p>
                  <strong>{t('baldrigeIntro.step2Label')}</strong> {t('baldrigeIntro.step2Text')}
                </p>
                <p>
                  <strong>{t('baldrigeIntro.step3Label')}</strong> {t('baldrigeIntro.step3Text')}
                </p>
                <p>
                  <strong>{t('baldrigeIntro.step4Label')}</strong> {t('baldrigeIntro.step4Text')}
                </p>
                <p className="pt-2">
                  <strong>{t('baldrigeIntro.rememberLabel')}</strong> {t('baldrigeIntro.rememberText')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips for Success */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t('baldrigeIntro.tipsTitle')}</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>{t('baldrigeIntro.tip1Label')}</strong> {t('baldrigeIntro.tip1Text')}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>{t('baldrigeIntro.tip2Label')}</strong> {t('baldrigeIntro.tip2Text')}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>{t('baldrigeIntro.tip3Label')}</strong> {t('baldrigeIntro.tip3Text')}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>{t('baldrigeIntro.tip4Label')}</strong> {t('baldrigeIntro.tip4Text')}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>{t('baldrigeIntro.tip5Label')}</strong> {t('baldrigeIntro.tip5Text')}</span>
            </li>
          </ul>
        </div>

        {/* Privacy & Confidentiality */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t('baldrigeIntro.privacyTitle')}</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>{t('baldrigeIntro.privacy1')}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>{t('baldrigeIntro.privacy2')}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>{t('baldrigeIntro.privacy3')}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>{t('baldrigeIntro.privacy4')}</span>
            </li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/employee/assessments"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg"
          >
            {t('baldrigeIntro.backToAssessments')}
          </Link>
          {!isCompleted && !isLoading && (
            <button
              onClick={() => router.push('/baldrige/assessment')}
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl font-medium text-lg"
            >
              {t('baldrigeIntro.startAssessment')}
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          )}
          {isCompleted && (
            <div className="inline-flex items-center justify-center px-8 py-4 bg-green-100 text-green-800 rounded-lg border-2 border-green-300 font-medium text-lg">
              <CheckCircle className="mr-2 w-5 h-5" />
              Assessment Completed
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            {t('common.copyright')}
          </p>
        </div>
      </footer>
    </div>
  )
}
