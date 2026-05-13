'use client'

import React from 'react'
import { Star } from 'lucide-react'

interface QuestionProps {
    question: any
    value: any
    onChange: (value: any) => void
    error?: string
}

export default function QuestionRenderer({ question, value = '', onChange, error }: QuestionProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        onChange(e.target.value)
    }

    const handleRadioChange = (option: string) => {
        onChange(option)
    }

    const handleCheckboxChange = (option: string) => {
        const currentValues = Array.isArray(value) ? value : []
        if (currentValues.includes(option)) {
            onChange(currentValues.filter((v: string) => v !== option))
        } else {
            onChange([...currentValues, option])
        }
    }

    const handleRatingChange = (rating: number) => {
        onChange(rating)
    }

    return (
        <div className="mb-6">
            <label className="block text-lg font-medium text-gray-900 mb-2">
                {question.text}
            </label>

            {question.type === 'text' && (
                <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder={question.placeholder}
                    value={value ?? ''}
                    onChange={handleChange}
                />
            )}

            {question.type === 'textarea' && (
                <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={4}
                    placeholder={question.placeholder}
                    value={value ?? ''}
                    onChange={handleChange}
                />
            )}

            {question.type === 'number' && (
                <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder={question.placeholder}
                    value={value ?? ''}
                    onChange={handleChange}
                />
            )}

            {question.type === 'radio' && (
                <div className="space-y-2">
                    {question.options?.map((option: string) => (
                        <div key={option} className="flex items-center">
                            <input
                                type="radio"
                                id={`${question.id}-${option}`}
                                name={question.id}
                                checked={value === option}
                                onChange={() => handleRadioChange(option)}
                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                            />
                            <label htmlFor={`${question.id}-${option}`} className="ml-2 block text-gray-700">
                                {option}
                            </label>
                        </div>
                    ))}
                    {question.hasOther && (
                        <div className="flex items-center mt-2">
                            <input
                                type="radio"
                                id={`${question.id}-other`}
                                name={question.id}
                                checked={value === 'Other' || (value && !question.options.includes(value))}
                                onChange={() => handleRadioChange('Other')}
                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                            />
                            <label htmlFor={`${question.id}-other`} className="ml-2 block text-gray-700 mr-2">
                                Other:
                            </label>
                            {(value === 'Other' || (value && !question.options.includes(value))) && (
                                <input
                                    type="text"
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                                    placeholder="Please specify"
                                    value={question.options.includes(value) ? '' : value === 'Other' ? '' : value}
                                    onChange={(e) => onChange(e.target.value)}
                                    autoFocus
                                />
                            )}
                        </div>
                    )}
                </div>
            )}

            {question.type === 'checkbox' && (
                <div className="space-y-2">
                    {question.options?.map((option: string) => (
                        <div key={option} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`${question.id}-${option}`}
                                checked={Array.isArray(value) && value.includes(option)}
                                onChange={() => handleCheckboxChange(option)}
                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`${question.id}-${option}`} className="ml-2 block text-gray-700">
                                {option}
                            </label>
                        </div>
                    ))}
                    {question.hasOther && (
                        <div className="flex flex-col mt-2">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`${question.id}-other-check`}
                                    checked={Array.isArray(value) && value.some((v: string) => !question.options.includes(v))}
                                    onChange={() => {
                                        // For checkbox, we can't easily toggle "Other" mode without adding a value.
                                        // We'll assume if they check this, they want to add a custom value.
                                        // But since we store values in an array, we need a placeholder or just show the input.
                                        // Let's just show the input if they check it, but we can't "check" it without a value in the array.
                                        // So we'll just check if any value is NOT in the options.
                                        // If they click this checkbox, we can add a placeholder or just focus the input.
                                        // Actually, let's just show the input always if hasOther is true? No.
                                        // Let's rely on the text input being visible if they have a custom value, 
                                        // OR if they click this checkbox we add an empty string to trigger visibility?
                                        const hasOther = Array.isArray(value) && value.some((v: string) => !question.options.includes(v));
                                        if (!hasOther) {
                                            onChange([...(value || []), ""]); // Add empty string to trigger input
                                        } else {
                                            // Remove all non-option values
                                            const standard = value.filter((v: string) => question.options.includes(v));
                                            onChange(standard);
                                        }
                                    }}
                                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`${question.id}-other-check`} className="ml-2 block text-gray-700">
                                    Other (specify below)
                                </label>
                            </div>

                            {(Array.isArray(value) && value.some((v: string) => !question.options.includes(v) || v === "")) && (
                                <input
                                    type="text"
                                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                                    placeholder="Please specify other options separated by comma"
                                    value={value.filter((v: string) => !question.options.includes(v)).join(', ')}
                                    onChange={(e) => {
                                        const others = e.target.value.split(',').map(s => s.trim()); // Don't filter Boolean yet to allow typing
                                        const standard = value.filter((v: string) => question.options.includes(v));
                                        // We need to keep the empty string if they clear the input but want to keep "Other" checked
                                        // But splitting by comma might create empty strings.
                                        // Let's just take the raw string? No, checkbox array needs individual values.
                                        // Simplified: Just update the non-standard values.
                                        // If e.target.value is empty, we keep it as [""] to keep checkbox checked?
                                        if (e.target.value === "") {
                                            onChange([...standard, ""]);
                                        } else {
                                            const newOthers = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                            onChange([...standard, ...newOthers]);
                                        }
                                    }}
                                    autoFocus
                                />
                            )}
                        </div>
                    )}
                </div>
            )}

            {question.type === 'rating' && (
                <div className="flex items-center space-x-2">
                    {[...Array(question.max)].map((_, i) => {
                        const ratingValue = i + 1
                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleRatingChange(ratingValue)}
                                className={`p-1 focus:outline-none transition-colors ${ratingValue <= (value || 0) ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                            >
                                <Star className="w-8 h-8 fill-current" />
                            </button>
                        )
                    })}
                    <span className="ml-2 text-gray-500 text-sm">
                        ({value || 0} / {question.max})
                    </span>
                </div>
            )}

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    )
}
