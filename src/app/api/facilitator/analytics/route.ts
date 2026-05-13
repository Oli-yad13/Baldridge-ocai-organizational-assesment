import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { FETAN_PAY_CONTENT } from '@/lib/fetan-pay-content'
import { SANKOFA_CONTENT } from '@/lib/sankofa-content'

export async function GET(request: Request) {
    const userId = request.headers.get('X-User-Id')

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Verify facilitator access
        const survey = await prisma.featuredSurvey.findFirst({
            where: { facilitatorId: userId },
        })

        if (!survey) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        let responses: any[] = []
        let content: any = null

        if (survey.assessmentType === 'FETAN_PAY') {
            responses = await prisma.fetanPayResponse.findMany({
                orderBy: { createdAt: 'desc' },
            })
            // Check if content is empty or null
            const hasContent = survey.content && Object.keys(survey.content as object).length > 0
            content = hasContent ? (survey.content as any) : FETAN_PAY_CONTENT
        } else if (survey.assessmentType === 'SANKOFA') {
            responses = await prisma.sankofaResponse.findMany({
                orderBy: { createdAt: 'desc' },
            })
            // Check if content is empty or null
            const hasContent = survey.content && Object.keys(survey.content as object).length > 0
            content = hasContent ? (survey.content as any) : SANKOFA_CONTENT
        }

        console.log(`[Analytics] Found ${responses.length} responses for ${survey.assessmentType}`)

        // Aggregate Data
        // Structure: { [questionId]: { total: number, counts: { [option]: number }, answers: string[] } }
        const analytics: Record<string, any> = {}

        // Helper to get sections - handles both { cso: { sections } } and { sections } formats
        const getSections = (contentObj: any, type: string) => {
            if (!contentObj) return []
            if (contentObj[type]?.sections) return contentObj[type].sections
            // Fallback for Sankofa stored without 'cso' wrapper
            if (type === 'cso' && contentObj.sections) return contentObj.sections
            return []
        }

        // Initialize analytics structure from content first
        const processSections = (sections: any[]) => {
            if (!sections) return
            sections.forEach((section: any) => {
                section.questions.forEach((q: any) => {
                    analytics[q.id] = {
                        total: 0,
                        counts: {},
                        answers: []
                    }
                })
            })
        }

        // Initialize from content structure
        if (content) {
            processSections(getSections(content, 'employer'))
            processSections(getSections(content, 'employee'))
            processSections(getSections(content, 'cso'))
        }

        // Populate with response data
        responses.forEach(response => {
            const data = response.data as any || {}

            Object.entries(data).forEach(([questionId, answer]) => {
                if (!analytics[questionId]) {
                    analytics[questionId] = { total: 0, counts: {}, answers: [] }
                }

                analytics[questionId].total++

                // Handle different answer types
                if (typeof answer === 'string' || typeof answer === 'number') {
                    const val = String(answer)
                    analytics[questionId].counts[val] = (analytics[questionId].counts[val] || 0) + 1

                    // Also store as raw answer
                    if (analytics[questionId].answers.length < 20) {
                        analytics[questionId].answers.push(val)
                    }
                } else if (Array.isArray(answer)) {
                    // Multiple choice (checkboxes)
                    answer.forEach(val => {
                        const sVal = String(val)
                        analytics[questionId].counts[sVal] = (analytics[questionId].counts[sVal] || 0) + 1
                    })
                }
            })
        })

        console.log(`[Analytics] Generated analytics for ${Object.keys(analytics).length} questions`)
        return NextResponse.json(analytics)
    } catch (error) {
        console.error('Error fetching analytics:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
