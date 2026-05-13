import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const userId = request.headers.get('X-User-Id')

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Get the survey assigned to this facilitator
    const survey = await prisma.featuredSurvey.findFirst({
      where: { facilitatorId: userId },
    })

    if (!survey) {
      return NextResponse.json({ error: 'No survey assigned' }, { status: 404 })
    }

    let stats = {
      totalResponses: 0,
      employerResponses: 0,
      employeeResponses: 0,
      recentResponses: [] as any[]
    }

    // 2. Fetch stats based on assessment type
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
            // We might want to select specific data fields later for the table
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
    console.error('Error fetching facilitator stats:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
