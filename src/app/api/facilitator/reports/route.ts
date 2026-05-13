import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    // Get aggregate data
    const [surveys, ocaiData, baldrigeSubmissions, recentSurveys] = await Promise.all([
      // Total surveys and responses
      prisma.survey.findMany({
        where: { organizationId },
        include: {
          _count: {
            select: {
              responses: true,
            },
          },
        },
      }),

      // OCAI data
      prisma.survey.findMany({
        where: {
          organizationId,
          assessmentType: 'OCAI',
        },
        include: {
          _count: {
            select: {
              responses: true,
            },
          },
        },
      }),

      // Baldrige data - get submissions for this organization
      prisma.baldrigeSubmission.findMany({
        where: {
          organizationId,
        },
      }),

      // Recent activity
      prisma.survey.findMany({
        where: { organizationId },
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          assessmentType: true,
          createdAt: true,
          _count: {
            select: {
              responses: true,
            },
          },
        },
      }),
    ])

    const totalResponses = surveys.reduce((sum, s) => sum + s._count.responses, 0)
    const ocaiResponses = ocaiData.reduce((sum, s) => sum + s._count.responses, 0)
    const baldrigeResponses = baldrigeSubmissions.length // Each submission = 1 completed assessment

    return NextResponse.json({
      totalSurveys: surveys.length + baldrigeSubmissions.length, // Include Baldrige submissions
      totalResponses: totalResponses + baldrigeResponses,
      byAssessmentType: {
        OCAI: {
          surveys: ocaiData.length,
          responses: ocaiResponses,
        },
        BALDRIGE: {
          surveys: baldrigeSubmissions.length, // Count of completed Baldrige assessments
          responses: baldrigeResponses, // Same as surveys for Baldrige
        },
      },
      recentActivity: recentSurveys.map((s) => ({
        id: s.id,
        title: s.title,
        assessmentType: s.assessmentType,
        responseCount: s._count.responses,
        createdAt: s.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching facilitator reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}
