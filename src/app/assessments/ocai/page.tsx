'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Clock, Users, BarChart3, CheckCircle, Info } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLocale } from '@/lib/i18n/context'
import LanguageSwitcher from '@/components/localization/LanguageSwitcher'

export default function OCAIIntroPage() {
  const router = useRouter()
  const { t } = useLocale()
  const [creatingAssessment, setCreatingAssessment] = useState(false)
  const [surveyId, setSurveyId] = useState<string | null>(null)
  const [checkingCompletion, setCheckingCompletion] = useState(true)

  useEffect(() => {
    const checkCompletionAndInit = async () => {
      // Check if user has already completed OCAI
      const storedUser = localStorage.getItem('user')
      const storedOrg = localStorage.getItem('organization')

      if (storedUser) {
        const user = JSON.parse(storedUser)

        // Server-side completion check for credential users
        if (user.id) {
          try {
            const completionCheck = await fetch(`/api/ocai/check-completion`, {
              headers: {
                'x-user-id': user.id
              }
            })

            if (completionCheck.ok) {
              const completionData = await completionCheck.json()
              if (completionData.isCompleted) {
                // Already completed - redirect to results
                alert(t('ocaiIntro.alreadyCompleted'))
                router.push('/ocai/my-results')
                return
              }
            }
          } catch (error) {
            console.error('Error checking completion:', error)
          }
        }
      }

      // FIXED: Instead of using localStorage, fetch actual survey from database
      // Always clear any stale localStorage survey ID first
      localStorage.removeItem('currentSurveyId')

      if (storedOrg || (storedUser && JSON.parse(storedUser).organizationId)) {
        try {
          const org = storedOrg ? JSON.parse(storedOrg) : null
          const user = storedUser ? JSON.parse(storedUser) : null
          const orgId = org?.id || user?.organizationId

          if (orgId) {
            // Fetch existing OCAI survey for this organization from database
            const checkResponse = await fetch(`/api/surveys?organizationId=${orgId}&type=OCAI&status=OPEN`)

            if (checkResponse.ok) {
              const checkData = await checkResponse.json()

              if (checkData.surveys && checkData.surveys.length > 0) {
                // Found existing survey - use it and verify it exists
                const existingSurvey = checkData.surveys[0]

                // Verify the survey exists by fetching it directly
                const verifyResponse = await fetch(`/api/surveys/${existingSurvey.id}`)
                if (verifyResponse.ok) {
                  console.log('Found and verified existing OCAI survey:', existingSurvey.id)
                  setSurveyId(existingSurvey.id)
                  localStorage.setItem('currentSurveyId', existingSurvey.id)
                } else {
                  console.log('Survey found in list but not accessible, will create new one')
                  setSurveyId(null)
                }
              } else {
                // No survey found - clear old localStorage
                console.log('No existing OCAI survey found, will create on button click')
                setSurveyId(null)
              }
            }
          }
        } catch (error) {
          console.error('Error fetching survey:', error)
          // Clear potentially invalid survey ID
          localStorage.removeItem('currentSurveyId')
          setSurveyId(null)
        }
      }

      setCheckingCompletion(false)
    }

    checkCompletionAndInit()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
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
                <h1 className="text-2xl font-bold text-gray-900">{t('ocaiIntro.title')}</h1>
                <p className="text-sm text-blue-600 font-medium">{t('ocaiIntro.subtitle')}</p>
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <BarChart3 className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('ocaiIntro.heroTitle')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('ocaiIntro.heroDescription')}
          </p>
        </div>

        {/* Assessment Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('ocaiIntro.duration')}</h3>
            <p className="text-gray-600">{t('ocaiIntro.durationTime')}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('ocaiIntro.questions')}</h3>
            <p className="text-gray-600">{t('ocaiIntro.questionsCount')}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('ocaiIntro.format')}</h3>
            <p className="text-gray-600">{t('ocaiIntro.formatType')}</p>
          </div>
        </div>

        {/* What You'll Assess */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('ocaiIntro.whatYouAssess')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">{t('ocaiIntro.sixDimensions')}</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{t('questionDimensions.dominant_characteristics.title')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{t('questionDimensions.leadership.title')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{t('questionDimensions.management_employees.title')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{t('questionDimensions.organization_glue.title')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{t('questionDimensions.strategic_emphases.title')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{t('questionDimensions.criteria_success.title')}</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">{t('ocaiIntro.fourCultureTypes')}</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2 mt-1 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-gray-900">{t('cultureTypes.clan')}</span>
                    <p className="text-sm text-gray-600">{t('cultureTypes.clanDesc')}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-4 h-4 bg-purple-500 rounded-full mr-2 mt-1 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-gray-900">{t('cultureTypes.adhocracy')}</span>
                    <p className="text-sm text-gray-600">{t('cultureTypes.adhocracyDesc')}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2 mt-1 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-gray-900">{t('cultureTypes.market')}</span>
                    <p className="text-sm text-gray-600">{t('cultureTypes.marketDesc')}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-2 mt-1 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-gray-900">{t('cultureTypes.hierarchy')}</span>
                    <p className="text-sm text-gray-600">{t('cultureTypes.hierarchyDesc')}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
          <div className="flex items-start space-x-3 mb-4">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">{t('ocaiIntro.howItWorksTitle')}</h3>
              <div className="space-y-3 text-blue-800">
                <p>
                  <strong>{t('ocaiIntro.step1Label')}</strong> {t('ocaiIntro.step1Text')}
                </p>
                <p>
                  <strong>{t('ocaiIntro.step2Label')}</strong> {t('ocaiIntro.step2Text')}
                </p>
                <p>
                  <strong>{t('ocaiIntro.step3Label')}</strong> {t('ocaiIntro.step3Text')}
                </p>
                <ul className="ml-6 space-y-1">
                  <li>• <strong>{t('ocaiIntro.nowLabel')}</strong> {t('ocaiIntro.nowText')}</li>
                  <li>• <strong>{t('ocaiIntro.preferredLabel')}</strong> {t('ocaiIntro.preferredText')}</li>
                </ul>
                <p className="pt-2">
                  <strong>{t('ocaiIntro.rememberLabel')}</strong> {t('ocaiIntro.rememberText')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Example */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t('ocaiIntro.exampleQuestion')}</h3>
          <p className="text-gray-700 mb-4 font-medium">{t('questionDimensions.dominant_characteristics.title')}</p>
          <div className="space-y-3 mb-4">
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-900">A.</span>
              <span className="text-gray-700 flex-1">{t('questionDimensions.dominant_characteristics.optionA')}</span>
              <input type="number" className="w-20 ml-4 px-3 py-1 border border-gray-300 rounded" placeholder="25" disabled />
            </div>
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-900">B.</span>
              <span className="text-gray-700 flex-1">{t('questionDimensions.dominant_characteristics.optionB')}</span>
              <input type="number" className="w-20 ml-4 px-3 py-1 border border-gray-300 rounded" placeholder="30" disabled />
            </div>
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-900">C.</span>
              <span className="text-gray-700 flex-1">{t('questionDimensions.dominant_characteristics.optionC')}</span>
              <input type="number" className="w-20 ml-4 px-3 py-1 border border-gray-300 rounded" placeholder="20" disabled />
            </div>
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-900">D.</span>
              <span className="text-gray-700 flex-1">{t('questionDimensions.dominant_characteristics.optionD')}</span>
              <input type="number" className="w-20 ml-4 px-3 py-1 border border-gray-300 rounded" placeholder="25" disabled />
            </div>
          </div>
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <strong>{t('ocaiIntro.totalPoints')}</strong> (25 + 30 + 20 + 25 = 100)
          </div>
        </div>

        {/* Privacy & Confidentiality */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t('ocaiIntro.privacyTitle')}</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>{t('ocaiIntro.privacy1')}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>{t('ocaiIntro.privacy2')}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>{t('ocaiIntro.privacy3')}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>{t('ocaiIntro.privacy4')}</span>
            </li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/employee/assessments"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg"
          >
            {t('ocaiIntro.backToAssessments')}
          </Link>
          <button
            onClick={async () => {
              setCreatingAssessment(true)

              try {
                const storedOrg = localStorage.getItem('organization')
                const storedUser = localStorage.getItem('user')

                if (!storedOrg && !storedUser) {
                  alert(t('ocaiIntro.orgNotFound'))
                  router.push('/auth/signin')
                  return
                }

                const org = storedOrg ? JSON.parse(storedOrg) : null
                const user = storedUser ? JSON.parse(storedUser) : null
                const orgId = org?.id || user?.organizationId

                if (!orgId) {
                  alert(t('ocaiIntro.orgNotFound'))
                  router.push('/auth/signin')
                  return
                }

                // Always fetch fresh from database - check if an OCAI survey already exists
                const checkResponse = await fetch(`/api/surveys?organizationId=${orgId}&type=OCAI&status=OPEN`)

                if (checkResponse.ok) {
                  const checkData = await checkResponse.json()

                  if (checkData.surveys && checkData.surveys.length > 0) {
                    // Use existing survey - verify it's accessible
                    const existingSurvey = checkData.surveys[0]

                    const verifyResponse = await fetch(`/api/surveys/${existingSurvey.id}`)
                    if (verifyResponse.ok) {
                      localStorage.setItem('currentSurveyId', existingSurvey.id)
                      setSurveyId(existingSurvey.id)
                      router.push(`/surveys/${existingSurvey.id}/respond`)
                      return
                    } else {
                      console.error('Survey found but not accessible, will create new one')
                    }
                  }
                }

                // No existing survey or survey not accessible - create one for this organization
                const response = await fetch('/api/surveys', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: `${org?.name || 'Organization'} - OCAI Culture Assessment`,
                    description: 'Organizational Culture Assessment Instrument',
                    assessmentType: 'OCAI',
                    status: 'OPEN',
                    organizationId: orgId,
                    allowAnonymous: true,
                    requireOrgEmailDomain: false,
                  }),
                })

                if (response.ok) {
                  const data = await response.json()
                  const newSurveyId = data.id

                  // Store survey ID
                  localStorage.setItem('currentSurveyId', newSurveyId)
                  setSurveyId(newSurveyId)

                  // Navigate to survey
                  router.push(`/surveys/${newSurveyId}/respond`)
                } else {
                  const error = await response.json()
                  console.error('Survey creation error:', error)
                  alert(error.error || error.message || t('ocaiIntro.createFailed'))
                }
              } catch (error) {
                console.error('Error with OCAI survey:', error)
                alert(t('ocaiIntro.errorOccurred'))
              } finally {
                setCreatingAssessment(false)
              }
            }}
            disabled={creatingAssessment}
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creatingAssessment ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t('ocaiIntro.preparing')}
              </>
            ) : (
              <>
                {t('ocaiIntro.startAssessment')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </button>
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
