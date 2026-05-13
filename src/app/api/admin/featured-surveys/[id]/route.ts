import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { FETAN_PAY_CONTENT } from '@/lib/fetan-pay-content'
import { SANKOFA_CONTENT } from '@/lib/sankofa-content'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: surveyId } = await params
    const userId = request.headers.get('X-User-Id')

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const survey = await prisma.featuredSurvey.findUnique({
            where: { id: surveyId },
            include: {
                facilitator: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        if (!survey) {
            return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
        }

        // Fallback to static content if DB content is empty
        if (!survey.content || Object.keys(survey.content as object).length === 0) {
            if (survey.assessmentType === 'FETAN_PAY') {
                survey.content = FETAN_PAY_CONTENT as any
            } else if (survey.assessmentType === 'SANKOFA') {
                survey.content = SANKOFA_CONTENT as any
            }
        }

        return NextResponse.json(survey)
    } catch (error) {
        console.error('Error fetching survey:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
