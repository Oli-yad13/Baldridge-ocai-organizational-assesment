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
        // Optional: Verify user role in DB if strict security is needed, 
        // but for now we trust the client-side check + ID presence to match existing pattern

        const survey = await prisma.featuredSurvey.findFirst({
            where: { facilitatorId: userId },
        })

        if (!survey) {
            return NextResponse.json({ error: 'No survey assigned' }, { status: 404 })
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
        console.error('Error fetching facilitator survey:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const userId = request.headers.get('X-User-Id')

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { content } = body

        const survey = await prisma.featuredSurvey.findFirst({
            where: { facilitatorId: userId },
        })

        if (!survey) {
            return NextResponse.json({ error: 'No survey assigned' }, { status: 404 })
        }

        // Update pendingContent for admin approval
        await prisma.featuredSurvey.update({
            where: { id: survey.id },
            data: {
                pendingContent: content,
            },
        })

        return NextResponse.json({ success: true, message: 'Changes submitted for approval' })
    } catch (error) {
        console.error('Error updating survey content:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
