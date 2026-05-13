'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ocaiScoresSchema } from '@/lib/validations'

const responseFormSchema = z.object({
  demographics: z.object({
    department: z.string().optional(),
    role: z.string().optional(),
    experience: z.string().optional(),
  }).optional(),
  nowScores: ocaiScoresSchema,
  preferredScores: ocaiScoresSchema,
})

type ResponseFormData = z.infer<typeof responseFormSchema>

interface SurveyResponseFormProps {
  surveyId: string
  onSuccess?: () => void
}

export function SurveyResponseForm({ surveyId, onSuccess }: SurveyResponseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResponseFormData>({
    resolver: zodResolver(responseFormSchema),
    defaultValues: {
      nowScores: { clan: 25, adhocracy: 25, market: 25, hierarchy: 25 },
      preferredScores: { clan: 25, adhocracy: 25, market: 25, hierarchy: 25 },
    },
  })

  const nowScores = watch('nowScores')
  const preferredScores = watch('preferredScores')

  const onSubmit = async (data: ResponseFormData) => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/surveys/${surveyId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit response')
      }

      setSuccess(true)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Response Submitted Successfully!
            </h3>
            <div className="mt-2 text-sm text-green-700">
              Thank you for participating in this culture assessment.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Demographics Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Demographics (Optional)
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <input
              type="text"
              {...register('demographics.department')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <input
              type="text"
              {...register('demographics.role')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Experience
            </label>
            <select
              {...register('demographics.experience')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select experience</option>
              <option value="0-2 years">0-2 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="6-10 years">6-10 years</option>
              <option value="10+ years">10+ years</option>
            </select>
          </div>
        </div>
      </div>

      {/* Current Culture Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Current Culture
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Please distribute 100 points among the four culture types based on how you perceive your organization currently operates.
        </p>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(['clan', 'adhocracy', 'market', 'hierarchy'] as const).map((culture) => (
            <div key={culture} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {culture}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                {...register(`nowScores.${culture}`, { valueAsNumber: true })}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <div className="text-xs text-gray-500">
                Current total: {Object.values(nowScores).reduce((a, b) => a + b, 0)}/100
              </div>
            </div>
          ))}
        </div>
        
        {errors.nowScores && (
          <div className="mt-2 text-sm text-red-600">
            {errors.nowScores.message}
          </div>
        )}
      </div>

      {/* Preferred Culture Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Preferred Culture
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Please distribute 100 points among the four culture types based on how you would like your organization to operate.
        </p>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(['clan', 'adhocracy', 'market', 'hierarchy'] as const).map((culture) => (
            <div key={culture} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {culture}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                {...register(`preferredScores.${culture}`, { valueAsNumber: true })}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <div className="text-xs text-gray-500">
                Preferred total: {Object.values(preferredScores).reduce((a, b) => a + b, 0)}/100
              </div>
            </div>
          ))}
        </div>
        
        {errors.preferredScores && (
          <div className="mt-2 text-sm text-red-600">
            {errors.preferredScores.message}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Response'}
        </button>
      </div>
    </form>
  )
}
