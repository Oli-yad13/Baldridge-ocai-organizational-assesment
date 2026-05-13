'use client'

import React from 'react'
import SankofaWizard from '@/components/surveys/SankofaWizard'
import { SANKOFA_CONTENT } from '@/lib/sankofa-content'

export default function SankofaSurveyPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div 
                    className="w-full h-48 md:h-64 relative overflow-hidden bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url(/Sankofa.png)'
                    }}
                >
                    <div className="absolute inset-0 bg-black/40 flex items-end">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">CSankofa CSO Assessment</h1>
                            <p className="text-white/90 text-lg font-medium drop-shadow-md">Questionnaire for Ethiopian Civil Society Organizations</p>
                        </div>
                    </div>
                </div>
            </div>

            <SurveyLoader
                type="SANKOFA"
                staticContent={SANKOFA_CONTENT.cso}
            />
        </div>
    )
}

function SurveyLoader({ type, staticContent }: { type: string, staticContent: any }) {
    const [content, setContent] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        fetch(`/api/surveys/content?type=${type}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.cso) {
                    setContent(data.cso)
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

    return <SankofaWizard content={content} />
}
