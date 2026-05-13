'use client'

import React from 'react'
import { Trash2, Plus, GripVertical } from 'lucide-react'

interface Question {
    id: string
    type: string
    text: string
    placeholder?: string
    options?: string[]
    min?: number
    max?: number
    hasOther?: boolean
}

interface QuestionEditorProps {
    question: Question
    onUpdate: (updatedQuestion: Question) => void
    onDelete: () => void
}

export default function QuestionEditor({ question, onUpdate, onDelete }: QuestionEditorProps) {
    const handleChange = (field: keyof Question, value: any) => {
        onUpdate({ ...question, [field]: value })
    }

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...(question.options || [])]
        newOptions[index] = value
        onUpdate({ ...question, options: newOptions })
    }

    const addOption = () => {
        const newOptions = [...(question.options || []), 'New Option']
        onUpdate({ ...question, options: newOptions })
    }

    const removeOption = (index: number) => {
        const newOptions = [...(question.options || [])]
        newOptions.splice(index, 1)
        onUpdate({ ...question, options: newOptions })
    }

    return (
        <div className="bg-white border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                <div className="mt-2 text-gray-400 cursor-move">
                    <GripVertical className="w-5 h-5" />
                </div>

                <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Question Text</label>
                            <input
                                type="text"
                                value={question.text}
                                onChange={(e) => handleChange('text', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                            <select
                                value={question.type}
                                onChange={(e) => handleChange('type', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="text">Text Input</option>
                                <option value="textarea">Long Text</option>
                                <option value="radio">Single Choice (Radio)</option>
                                <option value="checkbox">Multiple Choice</option>
                                <option value="number">Number</option>
                                <option value="rating">Rating (1-5)</option>
                            </select>
                        </div>
                    </div>

                    {(question.type === 'radio' || question.type === 'checkbox') && (
                        <div className="bg-gray-50 p-3 rounded-md">
                            <label className="block text-xs font-medium text-gray-500 mb-2">Options</label>
                            <div className="space-y-2">
                                {question.options?.map((option, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                                            className="flex-1 px-2 py-1 text-sm border rounded focus:ring-teal-500 focus:border-teal-500"
                                        />
                                        <button
                                            onClick={() => removeOption(idx)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={addOption}
                                    className="flex items-center text-sm text-teal-600 hover:text-teal-800 font-medium"
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Add Option
                                </button>
                            </div>

                            <div className="mt-3">
                                <label className="flex items-center space-x-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={question.hasOther || false}
                                        onChange={(e) => handleChange('hasOther', e.target.checked)}
                                        className="rounded text-teal-600 focus:ring-teal-500"
                                    />
                                    <span>Allow "Other" option</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {question.type === 'rating' && (
                        <div className="flex gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Min</label>
                                <input
                                    type="number"
                                    value={question.min || 1}
                                    onChange={(e) => handleChange('min', parseInt(e.target.value))}
                                    className="w-20 px-2 py-1 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Max</label>
                                <input
                                    type="number"
                                    value={question.max || 5}
                                    onChange={(e) => handleChange('max', parseInt(e.target.value))}
                                    className="w-20 px-2 py-1 border rounded"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={onDelete}
                    className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title="Delete Question"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
