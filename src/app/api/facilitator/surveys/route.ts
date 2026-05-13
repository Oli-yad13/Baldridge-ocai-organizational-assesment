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

    const surveys = await prisma.survey.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: {
            responses: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ surveys })
  } catch (error) {
    console.error('Error fetching facilitator surveys:', error)
    return NextResponse.json(
      { error: 'Failed to fetch surveys' },
      { status: 500 }
    )
  }
}
