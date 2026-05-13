'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2, ArrowLeft, Shield, LogOut } from 'lucide-react'
import ResultsView from '@/components/facilitator/ResultsView'
import LanguageSwitcher from '@/components/localization/LanguageSwitcher'
import { useLocale } from '@/lib/i18n/context'

export default function AdminSurveyResultsPage() {
    const router = useRouter()
    const params = useParams()
    const { t } = useLocale()
    const [user, setUser] = useState<any>(null)
    const [stats, setStats] = useState<any>(null)
    const [survey, setSurvey] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const surveyId = params.id as string

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (!storedUser) {
            router.push('/auth/signin')
            return
        }
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser.role !== 'SYSTEM_ADMIN') {
            router.push('/')
            return
        }
        setUser(parsedUser)
        fetchData(parsedUser.id)
    }, [router, surveyId])

    const fetchData = async (userId: string) => {
        try {
            setLoading(true)
            const [statsRes, surveyRes] = await Promise.all([
                fetch(`/api/admin/featured-surveys/${surveyId}/stats`, { headers: { 'X-User-Id': userId } }),
                fetch(`/api/admin/featured-surveys/${surveyId}`, { headers: { 'X-User-Id': userId } })
            ])

            if (statsRes.ok) {
                setStats(await statsRes.json())
            }
            if (surveyRes.ok) {
                setSurvey(await surveyRes.json())
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSignOut = () => {
        localStorage.removeItem('user')
        router.push('/')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{t('common.systemAdministration')}</h1>
                                <p className="text-sm text-gray-600">{t('common.tenadamAssessmentHub')}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">{user?.name}</span>
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Surveys
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">{survey?.title || 'Survey Results'}</h2>
                    <p className="text-gray-500">Viewing results for {survey?.title}</p>
                </div>

                {stats && (
                    <ResultsView
                        stats={stats}
                        surveyContent={survey?.content}
                        surveyType={survey?.assessmentType}
                        analyticsUrl={`/api/admin/featured-surveys/${surveyId}/analytics`}
                        exportUrl={`/api/admin/featured-surveys/${surveyId}/export`}
                    />
                )}
            </main>
        </div>
    )
}
