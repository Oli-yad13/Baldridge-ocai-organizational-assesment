'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BarChart3, Target, Award, CheckCircle, ArrowRight, LogOut, Eye, PlayCircle } from 'lucide-react'
import { getAllAssessmentStatuses, AssessmentProgress } from '@/lib/assessment-progress'
import { useLocale } from '@/lib/i18n/context'
import LanguageSwitcher from '@/components/localization/LanguageSwitcher'

interface Organization {
  id: string
  name: string
  logoUrl?: string
  primaryColor?: string
}

interface AssessmentOption {
  type: 'OCAI' | 'BALDRIGE'
  title: string
  description: string
  duration: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}

function EmployeeAssessmentsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLocale()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [assessmentTypes, setAssessmentTypes] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [ocaiSurveyId, setOcaiSurveyId] = useState<string | null>(null)
  const [assessmentStatuses, setAssessmentStatuses] = useState<{
    OCAI?: AssessmentProgress;
    BALDRIGE?: AssessmentProgress;
  }>({})

  useEffect(() => {
    const initDashboard = async () => {
      // Load from localStorage
      const storedUser = localStorage.getItem('user')
      const storedOrg = localStorage.getItem('organization')
      const storedTypes = localStorage.getItem('assessmentTypes')

      if (!storedUser) {
        router.push('/auth/signin')
        return
      }

      const parsedUser = JSON.parse(storedUser)
      
      // Handle different user types
      if (parsedUser.role === 'CREDENTIAL_USER') {
        // For credential users, organization data is in the user object
        if (!parsedUser.organizationId || !parsedUser.assessmentTypes) {
          router.push('/auth/signin')
          return
        }
        
        setUser(parsedUser)
        setOrganization({
          id: parsedUser.organizationId,
          name: parsedUser.organizationName,
          logoUrl: undefined,
          primaryColor: undefined
        })
        setAssessmentTypes(parsedUser.assessmentTypes)
        
        // Check server-side completion status for each assessment
        await checkServerCompletionStatus(parsedUser)
        
        // Fetch OCAI survey for this organization
        fetchOcaiSurvey(parsedUser.organizationId)
      } else {
        // For access key users, organization data is stored separately
        if (!storedOrg || !storedTypes) {
          router.push('/auth/signin')
          return
        }
        
        const parsedOrg = JSON.parse(storedOrg)
        
        setUser(parsedUser)
        setOrganization(parsedOrg)
        setAssessmentTypes(JSON.parse(storedTypes))
        
        // Load assessment progress statuses
        const statuses = getAllAssessmentStatuses(parsedOrg.id, parsedUser.id)
        setAssessmentStatuses(statuses)
        
        // Fetch OCAI survey for this organization
        fetchOcaiSurvey(parsedOrg.id)
      }
    }

    initDashboard()
  }, [router])

  const checkServerCompletionStatus = async (user: any) => {
    try {
      // Check OCAI completion
      const ocaiCheck = await fetch('/api/ocai/check-completion', {
        headers: { 'x-user-id': user.id }
      })
      
      if (ocaiCheck.ok) {
        const ocaiData = await ocaiCheck.json()
        if (ocaiData.isCompleted) {
          setAssessmentStatuses(prev => ({
            ...prev,
            OCAI: {
              assessmentType: 'OCAI',
              organizationId: user.organizationId,
              accessKey: user.accessKey || '',
              userId: user.id,
              status: 'completed',
              progress: { percentage: 100 },
              timestamps: {
                completedAt: ocaiData.completedAt || new Date().toISOString()
              }
            }
          }))
        }
      }

      // Check Baldrige completion
      const baldrigeCheck = await fetch('/api/baldrige/check-completion', {
        headers: { 'x-user-id': user.id }
      })
      
      if (baldrigeCheck.ok) {
        const baldrigeData = await baldrigeCheck.json()
        if (baldrigeData.isCompleted) {
          setAssessmentStatuses(prev => ({
            ...prev,
            BALDRIGE: {
              assessmentType: 'BALDRIGE',
              organizationId: user.organizationId,
              accessKey: user.accessKey || '',
              userId: user.id,
              status: 'completed',
              progress: { percentage: 100 },
              timestamps: {
                completedAt: baldrigeData.completedAt || new Date().toISOString()
              }
            }
          }))
        }
      }
    } catch (error) {
      console.error('Error checking completion status:', error)
      // Fall back to localStorage status
      const statuses = getAllAssessmentStatuses(user.organizationId, user.credentialId || user.id)
      setAssessmentStatuses(statuses)
    }
  }

  const fetchOcaiSurvey = async (orgId: string) => {
    try {
      const response = await fetch(`/api/surveys?organizationId=${orgId}&type=OCAI&status=OPEN`)
      const data = await response.json()

      if (data.surveys && data.surveys.length > 0) {
        setOcaiSurveyId(data.surveys[0].id)
      }
    } catch (error) {
      console.error('Error fetching survey:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('organization')
    localStorage.removeItem('assessmentTypes')
    localStorage.removeItem('currentSurveyId')
    router.push('/')
  }

  const assessmentOptions: AssessmentOption[] = [
    {
      type: 'OCAI',
      title: t('employee.ocaiTitle'),
      description: t('employee.ocaiDescription'),
      duration: t('employee.ocaiDuration'),
      icon: <Target className="w-8 h-8" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      type: 'BALDRIGE',
      title: t('employee.baldrigeTitle'),
      description: t('employee.baldrigeDescription'),
      duration: t('employee.baldrigeDuration'),
      icon: <Award className="w-8 h-8" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
  ]

  // Filter available assessments based on access key
  const availableAssessments = assessmentOptions.filter(a =>
    assessmentTypes.includes(a.type)
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {organization?.logoUrl ? (
                <img
                  src={organization.logoUrl}
                  alt={organization.name}
                  className="h-12 w-12 object-contain"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg"
                  style={{
                    background: organization?.primaryColor
                      ? `linear-gradient(to br, ${organization.primaryColor}, ${organization.primaryColor}dd)`
                      : 'linear-gradient(to br, #3b82f6, #6366f1)',
                  }}
                >
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{organization?.name}</h1>
                <p className="text-sm text-gray-600">{t('employee.assessmentPortal')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">{t('nav.signOut')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {t('employee.welcome', { name: user?.name })}
          </h2>
          <p className="text-lg text-gray-600">
            {t('employee.selectAssessment', { org: organization?.name || '' })}
          </p>
        </div>

        {/* Assessment Cards */}
        {availableAssessments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {availableAssessments.map((assessment) => {
              const status = assessmentStatuses[assessment.type]
              const isCompleted = status?.status === 'completed'
              const isInProgress = status?.status === 'in_progress'
              const progressPercent = status?.progress?.percentage || 0

              const getAssessmentLink = () => {
                if (isCompleted) {
                  // Redirect to results/answers page
                  if (assessment.type === 'OCAI') {
                    return '/ocai/my-results'
                  } else if (assessment.type === 'BALDRIGE') {
                    return '/baldrige/answers'
                  }
                }

                // Normal assessment link
                if (assessment.type === 'OCAI') {
                  // If there's a survey, use it; otherwise go to intro page
                  return ocaiSurveyId ? `/assessments/ocai?surveyId=${ocaiSurveyId}` : '/assessments/ocai'
                } else if (assessment.type === 'BALDRIGE') {
                  return '/assessments/baldrige'
                }
                return '#'
              }

              const handleClick = (e: React.MouseEvent) => {
                // Block access if already completed
                if (isCompleted) {
                  // Already redirects to results page via getAssessmentLink()
                  return
                }
                
                if (assessment.type === 'OCAI' && ocaiSurveyId) {
                  localStorage.setItem('currentSurveyId', ocaiSurveyId)
                }
                // Allow OCAI access even without survey - will create one dynamically
              }

              const getButtonContent = () => {
                if (isCompleted) {
                  return (
                    <span className="flex items-center space-x-2 text-green-600 font-medium group-hover:text-green-700">
                      <Eye className="w-4 h-4" />
                      <span>{assessment.type === 'OCAI' ? t('employee.viewResults') : t('employee.viewAnswers')}</span>
                    </span>
                  )
                } else if (isInProgress) {
                  return (
                    <span className="flex items-center space-x-2 text-blue-600 font-medium group-hover:text-blue-700">
                      <PlayCircle className="w-4 h-4" />
                      <span>{t('employee.continue')} ({progressPercent}%)</span>
                    </span>
                  )
                } else {
                  return (
                    <span className="flex items-center space-x-2 text-blue-600 font-medium group-hover:text-blue-700">
                      <span>{t('employee.startAssessment')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )
                }
              }

              return (
              <Link
                key={assessment.type}
                href={getAssessmentLink()}
                onClick={handleClick}
                className={`${assessment.bgColor} border-2 ${assessment.borderColor} rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer group block relative`}
              >
                {isCompleted && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>{t('employee.completed')}</span>
                    </div>
                  </div>
                )}

                <div className={`${assessment.color} mb-4`}>
                  {assessment.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {assessment.title}
                </h3>
                <p className="text-gray-700 mb-4 text-sm">
                  {assessment.description}
                </p>

                {isInProgress && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>{t('employee.progress')}</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    ⏱ {assessment.duration}
                  </span>
                  {getButtonContent()}
                </div>
              </Link>
            )})}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-600">{t('employee.noAssessments')}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">{t('employee.importantInfo')}</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• {t('employee.infoOnce')}</li>
                <li>• {t('employee.infoConfidential')}</li>
                <li>• {t('employee.infoAutoSave')}</li>
                <li>• {t('employee.infoHonest')}</li>
                <li>• {t('employee.infoCompleted')}</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function SuspenseFallback() {
  const { t } = useLocale()
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{t('employee.loadingAssessments')}</p>
      </div>
    </div>
  )
}

export default function EmployeeAssessmentsPage() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <EmployeeAssessmentsContent />
    </Suspense>
  )
}
