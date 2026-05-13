'use client'

import React from 'react'
import FetanPayWizard from '@/components/surveys/FetanPayWizard'
import { FETAN_PAY_CONTENT } from '@/lib/fetan-pay-content'

export default function EmployeeSurveyPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="w-full h-48 md:h-64 relative overflow-hidden">
                    <img
                        src="/Fetan_pay.png"
                        alt="Fetan Pay Ecosystem Assessment"
                        className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-end">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">Fetan Pay Ecosystem Assessment</h1>
                            <p className="text-white/90 text-lg font-medium drop-shadow-md">For Employees (Workers)</p>
                        </div>
                    </div>
                </div>
            </div>

            <SurveyLoader
                type="FETAN_PAY"
                respondentType="EMPLOYEE"
                staticContent={FETAN_PAY_CONTENT.employee}
            />
        </div>
    )
}

function SurveyLoader({ type, respondentType, staticContent }: { type: string, respondentType: string, staticContent: any }) {
    const [content, setContent] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        fetch(`/api/surveys/content?type=${type}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.employee) {
                    setContent(data.employee)
                } else {
                    // Fallback to static content if DB fetch fails or structure differs
                    setContent(staticContent)
                }
            })
            .catch(err => {
                console.error("Failed to load dynamic content", err)
                setContent(staticContent)
            })
            .finally(() => setLoading(false))
    }, [type, staticContent])

    if (loading) {
        return <div className="flex justify-center py-12">Loading survey...</div>
    }

    return <FetanPayWizard content={content} respondentType={respondentType as any} />
}
