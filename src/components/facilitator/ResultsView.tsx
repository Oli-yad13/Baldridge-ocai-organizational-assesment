'use client'

import React, { useState, useEffect } from 'react'
import { Users, Building2, Clock, CheckCircle, Download, Eye, X, BarChart3, List, ChevronLeft, ChevronRight, FileText, Calendar, Star } from 'lucide-react'

interface ResultsViewProps {
    stats: {
        totalResponses: number
        employerResponses: number
        employeeResponses: number
        recentResponses: any[]
    }
    surveyContent?: any
    surveyType?: string
    analyticsUrl?: string
    exportUrl?: string
}

export default function ResultsView({
    stats,
    surveyContent,
    surveyType,
    analyticsUrl = '/api/facilitator/analytics',
    exportUrl = '/api/facilitator/export'
}: ResultsViewProps) {
    const [activeTab, setActiveTab] = useState<'summary' | 'individual'>('summary')
    const [analytics, setAnalytics] = useState<any>(null)
    const [responses, setResponses] = useState<any[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(false)
    const [exporting, setExporting] = useState(false)

    // Helper to get sections based on survey type - handles both { cso: { sections } } and { sections } formats
    const getSections = (content: any, type: string) => {
        if (!content) return []
        // Check if content has the type key (e.g., 'cso', 'employer', 'employee')
        if (content[type]?.sections) {
            return content[type].sections
        }
        // Fallback: check if content has sections directly (for Sankofa stored without 'cso' wrapper)
        if (type === 'cso' && content.sections) {
            return content.sections
        }
        return []
    }

    // Helper to find question definition
    const getQuestionDef = (questionId: string) => {
        if (!surveyContent) return null

        const types = surveyType === 'SANKOFA' ? ['cso'] : ['employer', 'employee']
        for (const type of types) {
            const sections = getSections(surveyContent, type)
            for (const section of sections) {
                const question = section.questions.find((q: any) => q.id === questionId)
                if (question) return question
            }
        }
        return null
    }

    // Fetch analytics when tab changes to summary
    useEffect(() => {
        if (activeTab === 'summary' && !analytics) {
            fetchAnalytics()
        }
        if (activeTab === 'individual' && responses.length === 0) {
            fetchAllResponses()
        }
    }, [activeTab])

    const fetchAnalytics = async () => {
        setLoading(true)
        try {
            const userId = JSON.parse(localStorage.getItem('user') || '{}').id
            const res = await fetch(analyticsUrl, {
                headers: { 'X-User-Id': userId }
            })
            if (res.ok) {
                setAnalytics(await res.json())
            }
        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchAllResponses = async () => {
        setLoading(true)
        try {
            setResponses(stats.recentResponses)
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async () => {
        setExporting(true)
        try {
            const userId = JSON.parse(localStorage.getItem('user') || '{}').id
            const res = await fetch(exportUrl, {
                headers: { 'X-User-Id': userId }
            })

            if (res.ok) {
                const blob = await res.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                const prefix = surveyType ? surveyType.toLowerCase() : 'survey'
                a.download = `${prefix}_responses_${new Date().toISOString().split('T')[0]}.csv`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            } else {
                alert('Failed to export responses')
            }
        } catch (error) {
            console.error('Export error:', error)
            alert('An error occurred during export')
        } finally {
            setExporting(false)
        }
    }

    const currentResponse = responses[currentIndex]

    // Helper to render a chart/summary for a question
    const renderQuestionSummary = (questionId: string, data: any) => {
        const questionDef = getQuestionDef(questionId)
        const questionText = questionDef?.text || questionId
        const type = questionDef?.type || 'text'

        // Determine visualization based on type
        let content

        if (type === 'rating') {
            // Rating Distribution
            const maxRating = questionDef?.max || 5
            const distribution = Array.from({ length: maxRating }, (_, i) => i + 1).map(r => {
                const count = data.counts[String(r)] || 0
                return { rating: r, count, percentage: Math.round((count / data.total) * 100) }
            })

            content = (
                <div className="space-y-3 mt-4">
                    {distribution.map((item) => (
                        <div key={item.rating} className="flex items-center text-sm">
                            <div className="w-8 font-medium text-gray-600 flex items-center justify-end mr-3">
                                {item.rating} <Star className="w-3 h-3 ml-1 text-yellow-500 fill-yellow-500" />
                            </div>
                            <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                                <div
                                    className="absolute top-0 left-0 h-full bg-yellow-400 rounded-full transition-all duration-500"
                                    style={{ width: `${item.percentage}%` }}
                                ></div>
                                <span className="absolute inset-0 flex items-center justify-start pl-2 text-xs font-medium text-gray-700 z-10">
                                    {item.count > 0 && `${item.count} (${item.percentage}%)`}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )
        } else if (type === 'radio' || type === 'checkbox') {
            // Choice Bar Chart
            const sortedOptions = Object.entries(data.counts)
                .sort(([, a]: [string, any], [, b]: [string, any]) => b - a)

            content = (
                <div className="space-y-4 mt-4">
                    {sortedOptions.map(([option, count]: [string, any]) => {
                        const percentage = Math.round((count / data.total) * 100)
                        return (
                            <div key={option} className="relative">
                                <div className="flex justify-between text-sm mb-1 font-medium">
                                    <span className="text-gray-700">{option}</span>
                                    <span className="text-teal-700">{count} ({percentage}%)</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-teal-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )
        } else {
            // Text Responses (Default)
            content = (
                <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                        <span>{data.total} responses</span>
                        <span>Latest answers</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {data.answers.slice(0, 10).map((ans: string, i: number) => (
                            <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-700 italic">
                                "{ans}"
                            </div>
                        ))}
                        {data.answers.length > 10 && (
                            <p className="text-xs text-center text-gray-400 italic">...and {data.answers.length - 10} more</p>
                        )}
                    </div>
                </div>
            )
        }

        return (
            <div key={questionId} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 break-inside-avoid hover:shadow-md transition-shadow">
                <h4 className="font-medium text-gray-900 text-lg leading-snug">{questionText}</h4>
                {content}
            </div>
        )
    }

    // Helper to render individual response content
    const renderIndividualResponse = (response: any) => {
        if (!surveyContent) {
            // Fallback if no content available
            return (
                <div className="space-y-6">
                    {response.data && Object.entries(response.data).map(([key, value]: [string, any]) => (
                        <div key={key} className="border-b border-gray-100 pb-4 last:border-0">
                            <p className="text-sm font-medium text-gray-700 mb-2">{key}</p>
                            <div className="bg-gray-50 p-3 rounded text-gray-900 text-sm">
                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        const type = response.respondentType.toLowerCase()
        const sections = getSections(surveyContent, type)

        return (
            <div className="space-y-8">
                {sections.map((section: any) => {
                    // Check if this section has any answers
                    const hasAnswers = section.questions.some((q: any) => response.data && response.data[q.id] !== undefined)
                    if (!hasAnswers) return null

                    return (
                        <div key={section.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-900 text-lg">{section.title}</h3>
                            </div>
                            <div className="p-6 space-y-8">
                                {section.questions.map((question: any) => {
                                    const answer = response.data ? response.data[question.id] : undefined
                                    if (answer === undefined) return null

                                    let displayAnswer = String(answer)
                                    if (Array.isArray(answer)) displayAnswer = answer.join(', ')
                                    if (question.type === 'rating') {
                                        displayAnswer = `${answer} / ${question.max || 5}`
                                    }

                                    return (
                                        <div key={question.id} className="group">
                                            <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                                                {question.text}
                                            </p>
                                            <div className="text-gray-900 text-base font-medium bg-white p-3 rounded border border-gray-100 shadow-sm">
                                                {question.type === 'rating' ? (
                                                    <div className="flex items-center text-yellow-500">
                                                        {Array.from({ length: Number(answer) }).map((_, i) => (
                                                            <Star key={i} className="w-5 h-5 fill-current" />
                                                        ))}
                                                        <span className="ml-2 text-gray-600 text-sm">({answer})</span>
                                                    </div>
                                                ) : (
                                                    displayAnswer
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Debug Info */}
            <div className="text-xs text-gray-400 mb-4 bg-gray-100 p-2 rounded">
                DEBUG: Content Type: {typeof surveyContent}, Keys: {surveyContent ? Object.keys(surveyContent).join(', ') : 'None'}
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Responses</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalResponses}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                {surveyType !== 'SANKOFA' && (
                    <>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Employer</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.employerResponses}</p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Employee</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.employeeResponses}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* View Tabs & Export */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('summary')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center ${activeTab === 'summary' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Summary
                    </button>
                    <button
                        onClick={() => setActiveTab('individual')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center ${activeTab === 'individual' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <List className="w-4 h-4 mr-2" />
                        Individual
                    </button>
                </div>

                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 text-sm font-medium shadow-sm"
                >
                    {exporting ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    ) : (
                        <Download className="w-4 h-4 mr-2" />
                    )}
                    Export CSV
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'summary' && (
                <div className="space-y-6">
                    {analytics ? (
                        (() => {
                            const summaries: React.ReactNode[] = []
                            const processedIds = new Set<string>()

                            const processSections = (sections: any[]) => {
                                if (!sections) return
                                sections.forEach(section => {
                                    section.questions.forEach((question: any) => {
                                        // Skip if already processed (avoid duplicate keys)
                                        if (processedIds.has(question.id)) return
                                        if (analytics[question.id]) {
                                            processedIds.add(question.id)
                                            summaries.push(renderQuestionSummary(question.id, analytics[question.id]))
                                        }
                                    })
                                })
                            }

                            if (surveyContent) {
                                if (surveyType === 'SANKOFA') {
                                    processSections(getSections(surveyContent, 'cso'))
                                } else {
                                    processSections(getSections(surveyContent, 'employer'))
                                    processSections(getSections(surveyContent, 'employee'))
                                }
                            } else {
                                // Fallback if no content available
                                Object.entries(analytics).forEach(([qId, data]) => {
                                    if (!processedIds.has(qId)) {
                                        processedIds.add(qId)
                                    summaries.push(renderQuestionSummary(qId, data))
                                    }
                                })
                            }

                            return summaries.length > 0 ? summaries : (
                                <div className="text-center py-12 text-gray-500">
                                    No data available yet.
                                </div>
                            )
                        })()
                    ) : (
                        <div className="text-center py-12">
                            <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading analytics...</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'individual' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Navigation Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <button
                            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                            disabled={currentIndex === 0}
                            className="p-2 hover:bg-white hover:shadow-sm rounded-full disabled:opacity-30 transition-all text-gray-600"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="text-center">
                            <span className="font-bold text-gray-900 text-lg">Response {currentIndex + 1}</span>
                            <span className="text-gray-500 mx-2 text-sm">of</span>
                            <span className="text-gray-900 font-medium">{responses.length}</span>
                        </div>

                        <button
                            onClick={() => setCurrentIndex(Math.min(responses.length - 1, currentIndex + 1))}
                            disabled={currentIndex === responses.length - 1}
                            className="p-2 hover:bg-white hover:shadow-sm rounded-full disabled:opacity-30 transition-all text-gray-600"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Response Detail */}
                    {currentResponse ? (
                        <div className="p-8 bg-gray-50/50 min-h-[500px]">
                            {/* Response Metadata Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg ${currentResponse.respondentType === 'EMPLOYER' ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'}`}>
                                            {currentResponse.respondentType === 'EMPLOYER' ? <Building2 className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Respondent</p>
                                            <p className="font-medium text-gray-900">{currentResponse.respondentType}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Submitted</p>
                                            <p className="font-medium text-gray-900">{new Date(currentResponse.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg ${currentResponse.isCompleted ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            {currentResponse.isCompleted ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                                            <p className="font-medium text-gray-900">{currentResponse.isCompleted ? 'Completed' : 'In Progress'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Questionnaire Content */}
                            {renderIndividualResponse(currentResponse)}
                        </div>
                    ) : (
                        <div className="p-20 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No responses yet</h3>
                            <p className="text-gray-500 mt-1">Waiting for participants to submit their surveys.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
