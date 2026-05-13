import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSurveyCSV } from '@/lib/csv-helper'
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

        // ... existing code ...

        let responses: any[] = []
        let content: any = null

        if (survey.assessmentType === 'FETAN_PAY') {
            responses = await prisma.fetanPayResponse.findMany({
                orderBy: { createdAt: 'desc' },
            })
            content = survey.content ? (survey.content as any) : FETAN_PAY_CONTENT
        } else if (survey.assessmentType === 'SANKOFA') {
            responses = await prisma.sankofaResponse.findMany({
                orderBy: { createdAt: 'desc' },
            })
            content = survey.content ? (survey.content as any) : SANKOFA_CONTENT
        }

        if (responses.length === 0) {
            return new NextResponse('No responses found', {
                status: 200,
                headers: { 'Content-Type': 'text/csv' }
            })
        }

        const csvContent = generateSurveyCSV(responses, content, survey.assessmentType)

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${survey.assessmentType.toLowerCase()}_responses_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        })

    } catch (error) {
        console.error('Error exporting responses:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
