import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

        // Check if survey exists
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
                { error: 'Forbidden - You do not have access to this survey' },
                { status: 403 }
            )
        }

        let stats = {
            totalResponses: 0,
            employerResponses: 0,
            employeeResponses: 0,
            recentResponses: [] as any[]
        }

        // Fetch stats based on assessment type
        // Note: Currently assuming FETAN_PAY logic applies to all or checking type
        if (survey.assessmentType === 'FETAN_PAY') {
            const [total, employer, employee, recent] = await Promise.all([
                prisma.fetanPayResponse.count(),
                prisma.fetanPayResponse.count({ where: { respondentType: 'EMPLOYER' } }),
                prisma.fetanPayResponse.count({ where: { respondentType: 'EMPLOYEE' } }),
                prisma.fetanPayResponse.findMany({
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        respondentType: true,
                        createdAt: true,
                        isCompleted: true,
                        data: true
                    }
                })
            ])

            stats = {
                totalResponses: total,
                employerResponses: employer,
                employeeResponses: employee,
                recentResponses: recent
            }
        } else if (survey.assessmentType === 'SANKOFA') {
            const [total, recent] = await Promise.all([
                prisma.sankofaResponse.count(),
                prisma.sankofaResponse.findMany({
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        respondentType: true,
                        createdAt: true,
                        isCompleted: true,
                        data: true
                    }
                })
            ])

            stats = {
                totalResponses: total,
                employerResponses: 0,
                employeeResponses: 0,
                recentResponses: recent
            }
        }

        return NextResponse.json(stats)
    } catch (error) {
        console.error('Error fetching admin stats:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
