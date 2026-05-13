import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get comprehensive system-wide statistics
    const [
      organizations,
      users,
      surveys,
      accessKeys,
      ocaiSurveys,
      baldrigeSurveys,
      recentSurveys,
    ] = await Promise.all([
      // Organizations
      prisma.organization.findMany({
        include: {
          _count: {
            select: {
              users: true,
              surveys: true,
            },
          },
        },
      }),

      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),

      // All surveys with responses
      prisma.survey.findMany({
        include: {
          _count: {
            select: {
              responses: true,
            },
          },
        },
      }),

      // Access keys
      prisma.accessKey.findMany(),

      // OCAI surveys with organization data
      prisma.survey.findMany({
        where: { assessmentType: 'OCAI' },
        include: {
          organization: true,
          _count: {
            select: {
              responses: true,
            },
          },
        },
      }),

      // Baldrige surveys with organization data
      prisma.survey.findMany({
        where: { assessmentType: 'BALDRIGE' },
        include: {
          organization: true,
          _count: {
            select: {
              responses: true,
            },
          },
        },
      }),

      // Recent activity
      prisma.survey.findMany({
        take: 15,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          organization: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              responses: true,
            },
          },
        },
      }),
    ])

    // Calculate overview statistics
    const totalOrganizations = organizations.length
    const activeOrganizations = organizations.filter(o => o.isActive).length
    const totalSurveys = surveys.length
    const totalResponses = surveys.reduce((sum, s) => sum + s._count.responses, 0)
    const totalAccessKeys = accessKeys.length
    const activeAccessKeys = accessKeys.filter(k => k.isActive).length

    // User distribution
    const userDistribution = {
      systemAdmins: users.find(u => u.role === 'SYSTEM_ADMIN')?._count || 0,
      facilitators: users.find(u => u.role === 'FACILITATOR')?._count || 0,
      employees: users.find(u => u.role === 'EMPLOYEE')?._count || 0,
    }

    const totalUsers = userDistribution.systemAdmins + userDistribution.facilitators + userDistribution.employees

    // Assessment breakdown
    const ocaiResponses = ocaiSurveys.reduce((sum, s) => sum + s._count.responses, 0)
    const baldrigeResponses = baldrigeSurveys.reduce((sum, s) => sum + s._count.responses, 0)

    const ocaiOrgs = new Set(ocaiSurveys.map(s => s.organizationId)).size
    const baldrigeOrgs = new Set(baldrigeSurveys.map(s => s.organizationId)).size

    // Top organizations by activity
    const orgActivity = organizations.map(org => {
      const orgSurveys = surveys.filter(s => s.organizationId === org.id)
      const responseCount = orgSurveys.reduce((sum, s) => sum + s._count.responses, 0)

      return {
        id: org.id,
        name: org.name,
        surveyCount: orgSurveys.length,
        responseCount,
        userCount: org._count.users,
      }
    })

    const topOrganizations = orgActivity
      .sort((a, b) => b.responseCount - a.responseCount)
      .slice(0, 10)

    // Recent activity
    const recentActivity = recentSurveys.map(s => ({
      id: s.id,
      title: s.title,
      organizationName: s.organization.name,
      assessmentType: s.assessmentType,
      responseCount: s._count.responses,
      createdAt: s.createdAt,
    }))

    return NextResponse.json({
      overview: {
        totalOrganizations,
        activeOrganizations,
        totalUsers,
        totalSurveys,
        totalResponses,
        totalAccessKeys,
        activeAccessKeys,
      },
      assessmentBreakdown: {
        OCAI: {
          surveys: ocaiSurveys.length,
          responses: ocaiResponses,
          organizations: ocaiOrgs,
        },
        BALDRIGE: {
          surveys: baldrigeSurveys.length,
          responses: baldrigeResponses,
          organizations: baldrigeOrgs,
        },
      },
      topOrganizations,
      recentActivity,
      userDistribution,
    })
  } catch (error) {
    console.error('Error fetching admin reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}
