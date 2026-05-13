import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/get-user-id'
import { generateSurveyCSV } from '@/lib/csv-helper'
import { FETAN_PAY_CONTENT } from '@/lib/fetan-pay-content'
import { SANKOFA_CONTENT } from '@/lib/sankofa-content'

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

        if (!survey) {
            return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
        }

        // Allow access if user is admin OR is the assigned facilitator for this survey
        const isAdmin = user.role === 'SYSTEM_ADMIN'
        const isFacilitator = user.role === 'FACILITATOR' && survey.facilitatorId === userId

        if (!isAdmin && !isFacilitator) {
            return NextResponse.json(
                { error: 'Forbidden - You do not have access to export this survey' },
                { status: 403 }
            )
        }

        console.log(`[Export] Fetching responses for survey ${surveyId} (${survey.assessmentType})`)
        let responses: any[] = []
        let content: any = null

        if (survey.assessmentType === 'FETAN_PAY') {
            responses = await prisma.fetanPayResponse.findMany({
                orderBy: { createdAt: 'desc' }
            })
            // Check if content is empty or null
            const hasContent = survey.content && Object.keys(survey.content as object).length > 0
            content = hasContent ? (survey.content as any) : FETAN_PAY_CONTENT
            console.log(`[Export] Using ${hasContent ? 'DB' : 'Static'} content for FETAN_PAY`)
        } else if (survey.assessmentType === 'SANKOFA') {
            responses = await prisma.sankofaResponse.findMany({
                orderBy: { createdAt: 'desc' }
            })
            // Check if content is empty or null
            const hasContent = survey.content && Object.keys(survey.content as object).length > 0
            content = hasContent ? (survey.content as any) : SANKOFA_CONTENT
            console.log(`[Export] Using ${hasContent ? 'DB' : 'Static'} content for SANKOFA`)
        }

        console.log(`[Export] Found ${responses.length} responses. Generating CSV...`)

        const csvContent = generateSurveyCSV(responses, content, survey.assessmentType)
        console.log(`[Export] CSV generated successfully (${csvContent.length} bytes)`)

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${survey.assessmentType.toLowerCase()}_responses_${new Date().toISOString().split('T')[0]}.csv"`
            }
        })
    } catch (error) {
        console.error('Error exporting responses:', error)
        // Log the full error stack if available
        if (error instanceof Error) {
            console.error(error.stack)
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
