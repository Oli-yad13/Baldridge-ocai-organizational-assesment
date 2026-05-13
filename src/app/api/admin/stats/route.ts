import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get counts in parallel for better performance
    const [
      totalOrganizations,
      activeOrganizations,
      totalUsers,
      totalAccessKeys,
      activeAccessKeys,
      totalSurveys,
      totalResponses,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.accessKey.count(),
      prisma.accessKey.count({ where: { isActive: true } }),
      prisma.survey.count(),
      prisma.response.count(),
    ])

    return NextResponse.json({
      totalOrganizations,
      activeOrganizations,
      totalUsers,
      totalAccessKeys,
      activeAccessKeys,
      totalSurveys,
      totalResponses,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
