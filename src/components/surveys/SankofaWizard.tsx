'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import QuestionRenderer from './QuestionRenderer'

interface SankofaWizardProps {
    content: any
}

export default function SankofaWizard({ content }: SankofaWizardProps) {
    const router = useRouter()
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)

    const sections = content.sections
    const currentSection = sections[currentSectionIndex]
    const isLastSection = currentSectionIndex === sections.length - 1

    const handleAnswerChange = (questionId: string, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }))
    }

    const handleNext = async () => {
        if (isLastSection) {
            await handleSubmit()
        } else {
            setCurrentSectionIndex(prev => prev + 1)
            window.scrollTo(0, 0)
        }
    }

    const handleBack = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(prev => prev - 1)
            window.scrollTo(0, 0)
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/surveys/sankofa/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    respondentType: 'CSO',
                    data: answers,
                    isCompleted: true
                }),
            })

            if (!response.ok) {
                throw new Error('Submission failed')
            }

            setIsCompleted(true)
            window.scrollTo(0, 0)
        } catch (error) {
            console.error('Error submitting survey:', error)
            alert('Failed to submit survey. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isCompleted) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
                <p className="text-lg text-gray-600 mb-8">
                    Your response has been recorded successfully. We appreciate your feedback.
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                    Return to Home
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                    <span>Section {currentSectionIndex + 1} of {sections.length}</span>
                    <span>{Math.round(((currentSectionIndex + 1) / sections.length) * 100)}% Completed</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-teal-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${((currentSectionIndex + 1) / sections.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Section Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                    {currentSection.title}
                </h2>

                <div className="space-y-6">
                    {currentSection.questions.map((question: any) => (
                        <QuestionRenderer
                            key={question.id}
                            question={question}
                            value={answers[question.id]}
                            onChange={(value) => handleAnswerChange(question.id, value)}
                        />
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
                <button
                    onClick={handleBack}
                    disabled={currentSectionIndex === 0 || isSubmitting}
                    className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${currentSectionIndex === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>

                <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="flex items-center px-8 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : isLastSection ? (
                        <>
                            Submit Survey
                            <CheckCircle className="w-5 h-5 ml-2" />
                        </>
                    ) : (
                        <>
                            Next Section
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
