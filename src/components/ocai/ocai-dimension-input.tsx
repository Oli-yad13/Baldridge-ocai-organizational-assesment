'use client'

import { useState, useEffect } from 'react'
import { OCAIDimension, OCAIResponse, validateOCAIResponse } from '@/lib/ocai-data'
import { useLocale } from '@/lib/i18n/context'

interface OCAIDimensionInputProps {
  dimension: OCAIDimension
  phase: 'now' | 'preferred'
  response?: OCAIResponse
  onChange: (values: { A: number; B: number; C: number; D: number }) => void
}

export function OCAIDimensionInput({ dimension, phase, response, onChange }: OCAIDimensionInputProps) {
  const { t } = useLocale()
  const [values, setValues] = useState({ A: 25, B: 25, C: 25, D: 25 })
  const [errors, setErrors] = useState<string[]>([])
  const [lastModifiedKey, setLastModifiedKey] = useState<'A' | 'B' | 'C' | 'D' | null>(null)

  useEffect(() => {
    if (response) {
      setValues(response[phase])
    }
  }, [response, phase])

  const updateValue = (key: 'A' | 'B' | 'C' | 'D', newValue: number) => {
    const clampedValue = Math.max(0, Math.min(100, newValue))
    setLastModifiedKey(key)

    // Calculate how much we need to distribute among other keys
    const remainingPoints = 100 - clampedValue
    const allKeys = ['A', 'B', 'C', 'D'] as const
    const otherKeys = allKeys.filter(k => k !== key)

    const newValues = { ...values, [key]: clampedValue }

    if (remainingPoints === 0) {
      // If new value is 100, set all others to 0
      otherKeys.forEach(otherKey => {
        newValues[otherKey] = 0
      })
    } else if (remainingPoints > 0) {
      // Adjust only the keys that come after the current key in order
      const currentIndex = allKeys.indexOf(key)
      const keysToAdjust = allKeys.filter((k, idx) => idx > currentIndex)

      if (keysToAdjust.length > 0) {
        // Get current total of keys to adjust
        const adjustTotal = keysToAdjust.reduce((sum, k) => sum + values[k], 0)

        if (adjustTotal > 0) {
          // Proportionally distribute among keys to adjust
          let assignedTotal = 0
          keysToAdjust.forEach((adjustKey, index) => {
            if (index === keysToAdjust.length - 1) {
              // Last key gets the remainder to ensure total is correct
              const keysBeforeTotal = allKeys
                .filter((k, idx) => idx <= currentIndex || !keysToAdjust.includes(k))
                .reduce((sum, k) => sum + (k === key ? clampedValue : newValues[k] || values[k]), 0)
              newValues[adjustKey] = 100 - keysBeforeTotal - assignedTotal
            } else {
              // Proportional distribution
              const proportion = values[adjustKey] / adjustTotal
              const newVal = Math.round((100 - clampedValue - allKeys.filter((k, idx) => idx <= currentIndex && k !== key).reduce((sum, k) => sum + values[k], 0)) * proportion)
              newValues[adjustKey] = Math.max(0, newVal)
              assignedTotal += newValues[adjustKey]
            }
          })
        } else {
          // If keys to adjust are all 0, distribute equally
          const equalShare = Math.floor(remainingPoints / keysToAdjust.length)
          const remainder = remainingPoints % keysToAdjust.length
          keysToAdjust.forEach((adjustKey, index) => {
            newValues[adjustKey] = equalShare + (index < remainder ? 1 : 0)
          })
        }
      }
    }

    setValues(newValues)
    onChange(newValues)

    // Validate
    const validation = validateOCAIResponse({
      dimensionId: dimension.id,
      now: phase === 'now' ? newValues : response?.now || { A: 25, B: 25, C: 25, D: 25 },
      preferred: phase === 'preferred' ? newValues : response?.preferred || { A: 25, B: 25, C: 25, D: 25 }
    })
    setErrors(validation.errors)
  }

  const handleKeyDown = (key: 'A' | 'B' | 'C' | 'D', event: React.KeyboardEvent) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      updateValue(key, values[key] + 1)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      updateValue(key, values[key] - 1)
    }
  }

  const total = Object.values(values).reduce((sum, val) => sum + val, 0)
  const isValid = total === 100 && errors.length === 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {dimension.title} - {phase === 'now' ? t('ocaiAssessment.currentState') : t('ocaiAssessment.preferredState')}
        </h2>
        <p className="text-gray-600 mb-4">{dimension.description}</p>
      </div>

      <div className="max-h-[900px] overflow-y-auto space-y-6 pr-2 border border-gray-200 rounded-lg p-6 bg-gray-50">
        {Object.entries(dimension.options).map(([key, option]) => (
          <div key={key} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900 text-lg">
                    Option {key}: {option.culture}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => updateValue(key as 'A' | 'B' | 'C' | 'D', values[key as keyof typeof values] - 1)}
                      disabled={values[key as keyof typeof values] <= 0}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-gray-300 text-gray-700 font-bold transition-colors"
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={values[key as keyof typeof values]}
                      onChange={(e) => updateValue(key as 'A' | 'B' | 'C' | 'D', parseInt(e.target.value) || 0)}
                      onKeyDown={(e) => handleKeyDown(key as 'A' | 'B' | 'C' | 'D', e)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded text-center text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    />
                    <button
                      type="button"
                      onClick={() => updateValue(key as 'A' | 'B' | 'C' | 'D', values[key as keyof typeof values] + 1)}
                      disabled={values[key as keyof typeof values] >= 100}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-gray-300 text-gray-700 font-bold transition-colors"
                      aria-label="Increase"
                    >
                      +
                    </button>
                    <span className="text-lg text-gray-500 font-medium">%</span>
                  </div>
                </div>
                <p className="text-base text-gray-700 leading-relaxed">{option.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total and Validation */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">{t('ocaiAssessment.totalLabel')}</span>
          <div className="flex items-center space-x-2">
            <span className={`text-lg font-semibold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
              {total}%
            </span>
            {isValid && <span className="text-green-600">{t('ocaiAssessment.checkmark')}</span>}
          </div>
        </div>

        {!isValid && (
          <div className="mt-2 text-sm text-red-600">
            {total !== 100 && <p>{t('ocaiAssessment.instruction4')}</p>}
            {errors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}

        <div className="mt-2 text-xs text-gray-500">
          {t('ocaiAssessment.arrowKeysHint')}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">{t('ocaiAssessment.instructionsTitle')}</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• {t('ocaiAssessment.instruction1')}</li>
          <li>• {t('ocaiAssessment.instruction2')}</li>
          <li>• {t('ocaiAssessment.instruction3')}</li>
          <li>• {t('ocaiAssessment.instruction4')}</li>
        </ul>
      </div>
    </div>
  )
}
