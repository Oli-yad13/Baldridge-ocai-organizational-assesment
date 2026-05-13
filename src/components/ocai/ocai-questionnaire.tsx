'use client'

import { useState, useEffect, useMemo } from 'react'
import { getLocalizedOCAIDimensions, OCAIResponse, validateOCAIResponse, calculateOCAIScores, OCAIScores } from '@/lib/ocai-data'
import { OCAIDimensionInput } from './ocai-dimension-input'
import { OCAIHelpPanel } from './ocai-help-panel'
import { OCAIResults } from './ocai-results'
import { useLocale } from '@/lib/i18n/context'

interface Demographics {
  department?: string
  team?: string
  tenure?: string
  location?: string
  gender?: string
  laborUnit?: string
}

interface OCAIQuestionnaireProps {
  surveyId: string
  onComplete?: (scores: OCAIScores, demographics: Demographics) => void
}

export function OCAIQuestionnaire({ surveyId, onComplete }: OCAIQuestionnaireProps) {
  const { t, locale, setLocale } = useLocale()
  const OCAI_DIMENSIONS = useMemo(() => {
    console.log(`OCAI: Generating dimensions for locale: ${locale}`)
    const dims = getLocalizedOCAIDimensions(t)
    console.log(`OCAI: First dimension title: ${dims[0]?.title}`)
    return dims
  }, [t, locale])
  
  const [currentPhase, setCurrentPhase] = useState<'now' | 'preferred' | 'demographics' | 'results'>('now')
  const [currentDimension, setCurrentDimension] = useState(0)
  const [responses, setResponses] = useState<OCAIResponse[]>([])
  const [demographics, setDemographics] = useState<Demographics>({})
  const [scores, setScores] = useState<OCAIScores | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Scroll to top when component mounts (important for mobile)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Initialize responses and load from localStorage
  useEffect(() => {
    const storageKey = `ocai_progress_${surveyId}`
    const savedProgress = localStorage.getItem(storageKey)

    if (savedProgress) {
      const parsed = JSON.parse(savedProgress)
      setResponses(parsed.responses || [])
      setCurrentPhase(parsed.currentPhase || 'now')
      setCurrentDimension(parsed.currentDimension || 0)
      setDemographics(parsed.demographics || {})
    } else if (responses.length === 0) {
      const initialResponses = OCAI_DIMENSIONS.map(dimension => ({
        dimensionId: dimension.id,
        now: { A: 25, B: 25, C: 25, D: 25 },
        preferred: { A: 25, B: 25, C: 25, D: 25 }
      }))
      setResponses(initialResponses)
    }
  }, [surveyId, OCAI_DIMENSIONS])

  // Save progress to localStorage and server whenever state changes
  useEffect(() => {
    if (responses.length > 0 && currentPhase !== 'results') {
      const storageKey = `ocai_progress_${surveyId}`
      const progressData = {
        responses,
        currentPhase,
        currentDimension,
        demographics,
        lastSaved: new Date().toISOString()
      }
      localStorage.setItem(storageKey, JSON.stringify(progressData))

      // Also save to server if credential user
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user.role === 'CREDENTIAL_USER') {
          // Auto-save to server (debounced)
          saveProgressToServer(user.email, surveyId, progressData)
        }
      }
    }
  }, [responses, currentPhase, currentDimension, demographics, surveyId])

  // Server save function (with debounce)
  const saveProgressToServer = async (email: string, surveyId: string, progressData: any) => {
    try {
      await fetch('/api/assessments/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentialEmail: email,
          surveyId,
          progressData,
          demographics: progressData.demographics,
          nowScores: {}, // Will be filled on completion
          preferredScores: {}, // Will be filled on completion
          isComplete: false,
          ipHash: 'auto-saved'
        })
      })
    } catch (error) {
      console.error('Failed to auto-save progress:', error)
      // Fail silently - localStorage still works
    }
  }

  const handleDimensionChange = (dimensionId: string, phase: 'now' | 'preferred', values: { A: number; B: number; C: number; D: number }) => {
    setResponses(prev => prev.map(response => 
      response.dimensionId === dimensionId 
        ? { ...response, [phase]: values }
        : response
    ))
  }

  const handleNext = () => {
    setIsTransitioning(true)

    // Scroll to top of page for better mobile experience
    window.scrollTo({ top: 0, behavior: 'smooth' })

    if (currentPhase === 'now') {
      if (currentDimension < OCAI_DIMENSIONS.length - 1) {
        setCurrentDimension(prev => prev + 1)
      } else {
        setCurrentPhase('preferred')
        setCurrentDimension(0)
      }
    } else if (currentPhase === 'preferred') {
      if (currentDimension < OCAI_DIMENSIONS.length - 1) {
        setCurrentDimension(prev => prev + 1)
      } else {
        setCurrentPhase('demographics')
      }
    } else if (currentPhase === 'demographics') {
      // Calculate scores and submit (no longer showing results inline)
      const calculatedScores = calculateOCAIScores(responses)
      setScores(calculatedScores)

      // Clear saved progress since assessment is complete
      const storageKey = `ocai_progress_${surveyId}`
      localStorage.removeItem(storageKey)

      if (onComplete) {
        onComplete(calculatedScores, demographics)
      }
    }

    setTimeout(() => setIsTransitioning(false), 300)
  }

  const handlePrevious = () => {
    setIsTransitioning(true)

    // Scroll to top of page for better mobile experience
    window.scrollTo({ top: 0, behavior: 'smooth' })

    if (currentPhase === 'preferred') {
      if (currentDimension > 0) {
        setCurrentDimension(prev => prev - 1)
      } else {
        setCurrentPhase('now')
        setCurrentDimension(OCAI_DIMENSIONS.length - 1)
      }
    } else if (currentPhase === 'demographics') {
      setCurrentPhase('preferred')
      setCurrentDimension(OCAI_DIMENSIONS.length - 1)
    }

    setTimeout(() => setIsTransitioning(false), 300)
  }

  const getCurrentResponse = () => {
    return responses.find(r => r.dimensionId === OCAI_DIMENSIONS[currentDimension].id)
  }

  const isCurrentDimensionValid = () => {
    const response = getCurrentResponse()
    if (!response) return false
    
    const validation = validateOCAIResponse(response)
    return validation.isValid
  }

  const canProceed = () => {
    if (currentPhase === 'now' || currentPhase === 'preferred') {
      return isCurrentDimensionValid()
    } else if (currentPhase === 'demographics') {
      return true // Demographics are optional
    }
    return false
  }

  const getProgress = () => {
    if (currentPhase === 'now') {
      return ((currentDimension + 1) / OCAI_DIMENSIONS.length) * 50
    } else if (currentPhase === 'preferred') {
      return 50 + ((currentDimension + 1) / OCAI_DIMENSIONS.length) * 50
    } else if (currentPhase === 'demographics') {
      return 100
    }
    return 100
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Warning Banner */}
      <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-amber-800">{t('ocaiAssessment.importantNoticeTitle')}</h3>
            <div className="mt-1 text-sm text-amber-700">
              <p>• {t('ocaiAssessment.autoSaveNotice')}</p>
              <p>• {t('ocaiAssessment.reviewNotice')}</p>
              <p>• {t('ocaiAssessment.noModifyNotice')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t('ocaiAssessment.title')}
          </h1>
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setLocale('en')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  locale === 'en'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale('am')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  locale === 'am'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                አማ
              </button>
            </div>

            <button
              onClick={() => setShowHelp(!showHelp)}
              className="group px-5 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 font-medium transform hover:scale-105 active:scale-95 flex items-center space-x-2 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{showHelp ? t('ocaiAssessment.hideHelp') : t('ocaiAssessment.showHelp')}</span>
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${getProgress()}%` }}
          >
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            {currentPhase === 'now' && t('ocaiAssessment.nowPhase', { current: currentDimension + 1, total: OCAI_DIMENSIONS.length })}
            {currentPhase === 'preferred' && t('ocaiAssessment.preferredPhase', { current: currentDimension + 1, total: OCAI_DIMENSIONS.length })}
            {currentPhase === 'demographics' && t('ocaiAssessment.demographicsPhase')}
          </span>
          <span>{t('ocaiAssessment.percentComplete', { percent: Math.round(getProgress()) })}</span>
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-8 ${showHelp ? 'lg:grid-cols-5' : ''}`}>
        {/* Main Content */}
        <div className={`${showHelp ? 'lg:col-span-4' : ''} transition-all duration-300 ease-in-out ${
          isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
        }`}>
          {currentPhase === 'demographics' ? (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-semibold text-gray-900">{t('ocaiAssessment.demographicsTitle')}</h2>
              <p className="text-gray-600">{t('ocaiAssessment.demographicsDesc')}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('ocaiAssessment.department')}</label>
                  <input
                    type="text"
                    value={demographics.department || ''}
                    onChange={(e) => setDemographics(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('ocaiAssessment.departmentPlaceholder')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('ocaiAssessment.team')}</label>
                  <input
                    type="text"
                    value={demographics.team || ''}
                    onChange={(e) => setDemographics(prev => ({ ...prev, team: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('ocaiAssessment.teamPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('ocaiAssessment.tenure')}</label>
                  <select
                    value={demographics.tenure || ''}
                    onChange={(e) => setDemographics(prev => ({ ...prev, tenure: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('ocaiAssessment.selectTenure')}</option>
                    <option value="less-than-1">{t('ocaiAssessment.tenureLessThan1')}</option>
                    <option value="1-2">{t('ocaiAssessment.tenure1to2')}</option>
                    <option value="3-5">{t('ocaiAssessment.tenure3to5')}</option>
                    <option value="6-10">{t('ocaiAssessment.tenure6to10')}</option>
                    <option value="more-than-10">{t('ocaiAssessment.tenureMoreThan10')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('ocaiAssessment.location')}</label>
                  <input
                    type="text"
                    value={demographics.location || ''}
                    onChange={(e) => setDemographics(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('ocaiAssessment.locationPlaceholder')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('ocaiAssessment.gender')}</label>
                  <select
                    value={demographics.gender || ''}
                    onChange={(e) => setDemographics(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('ocaiAssessment.selectGender')}</option>
                    <option value="male">{t('ocaiAssessment.genderMale')}</option>
                    <option value="female">{t('ocaiAssessment.genderFemale')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('ocaiAssessment.laborUnit')}</label>
                  <input
                    type="text"
                    value={demographics.laborUnit || ''}
                    onChange={(e) => setDemographics(prev => ({ ...prev, laborUnit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('ocaiAssessment.laborUnitPlaceholder')}
                  />
                </div>
              </div>
            </div>
          ) : (
            <OCAIDimensionInput
              dimension={OCAI_DIMENSIONS[currentDimension]}
              phase={currentPhase as 'now' | 'preferred'}
              response={getCurrentResponse()}
              onChange={(values) => handleDimensionChange(OCAI_DIMENSIONS[currentDimension].id, currentPhase as 'now' | 'preferred', values)}
            />
          )}
        </div>

        {/* Help Panel */}
        {showHelp && (
          <div className="lg:col-span-1 animate-slideInRight">
            <OCAIHelpPanel />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevious}
          disabled={currentPhase === 'now' && currentDimension === 0}
          className="group px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>{t('ocaiAssessment.previous')}</span>
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed() || isTransitioning}
          className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <span>{currentPhase === 'demographics' ? t('ocaiAssessment.viewResults') : t('ocaiAssessment.next')}</span>
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
