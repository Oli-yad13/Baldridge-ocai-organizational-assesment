import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { FETAN_PAY_CONTENT } from '@/lib/fetan-pay-content'
import { SANKOFA_CONTENT } from '@/lib/sankofa-content'
import { getUserId } from '@/lib/get-user-id'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: surveyId } = await params
        // Check authentication
        const userId = await getUserId(request)

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 403 }
            )
        }

        const survey = await prisma.featuredSurvey.findUnique({
            where: { id: surveyId }
        })

        if (!survey) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        // Allow access if user is admin OR is the assigned facilitator for this survey
        const isAdmin = user.role === 'SYSTEM_ADMIN'
        const isFacilitator = user.role === 'FACILITATOR' && survey.facilitatorId === userId

        if (!isAdmin && !isFacilitator) {
            return NextResponse.json(
                { error: 'Forbidden - You do not have access to this survey' },
                { status: 403 }
            )
        }

        let responses: any[] = []
        let content: any = null

        if (survey.assessmentType === 'FETAN_PAY') {
            responses = await prisma.fetanPayResponse.findMany({
                select: {
                    data: true,
                    respondentType: true
                }
            })
            // Check if content is empty or null
            const hasContent = survey.content && Object.keys(survey.content as object).length > 0
            content = hasContent ? (survey.content as any) : FETAN_PAY_CONTENT
        } else if (survey.assessmentType === 'SANKOFA') {
            responses = await prisma.sankofaResponse.findMany({
                select: {
                    data: true,
                    respondentType: true
                }
            })
            // Check if content is empty or null
            const hasContent = survey.content && Object.keys(survey.content as object).length > 0
            content = hasContent ? (survey.content as any) : SANKOFA_CONTENT
        } else {
            return NextResponse.json({})
        }

        const analytics: any = {}

        // Helper to get sections - handles both { cso: { sections } } and { sections } formats
        const getSections = (contentObj: any, type: string) => {
            if (!contentObj) return []
            if (contentObj[type]?.sections) return contentObj[type].sections
            // Fallback for Sankofa stored without 'cso' wrapper
            if (type === 'cso' && contentObj.sections) return contentObj.sections
            return []
        }

        // Initialize analytics structure from content
        const processSections = (sections: any[]) => {
            if (!sections) return
            sections.forEach((section: any) => {
                section.questions.forEach((q: any) => {
                    analytics[q.id] = {
                        total: 0,
                        counts: {}, // For choice/rating questions
                        answers: [] // For text questions
                    }
                })
            })
        }

        // Use the survey's content if available, otherwise fallback to default
        processSections(getSections(content, 'employer'))
        processSections(getSections(content, 'employee'))
        processSections(getSections(content, 'cso'))

        // Aggregate data
        responses.forEach(response => {
            const data = response.data as any
            if (!data) return

            Object.entries(data).forEach(([qId, answer]) => {
                if (analytics[qId]) {
                    analytics[qId].total++

                    // Handle different types of answers
                    if (typeof answer === 'string' || typeof answer === 'number') {
                        const val = String(answer)
                        analytics[qId].counts[val] = (analytics[qId].counts[val] || 0) + 1
                        analytics[qId].answers.push(val)
                    } else if (Array.isArray(answer)) {
                        answer.forEach(val => {
                            const sVal = String(val)
                            analytics[qId].counts[sVal] = (analytics[qId].counts[sVal] || 0) + 1
                        })
                    }
                }
            })
        })

        // Reverse answers to show newest first
        Object.keys(analytics).forEach(key => {
            analytics[key].answers.reverse()
        })

        return NextResponse.json(analytics)
    } catch (error) {
        console.error('Error fetching admin analytics:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
