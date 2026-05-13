import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all surveys
export async function GET(request: NextRequest) {
  try {
    const surveys = await prisma.survey.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ surveys })
  } catch (error) {
    console.error('Error fetching surveys:', error)
    return NextResponse.json(
      { error: 'Failed to fetch surveys' },
      { status: 500 }
    )
  }
}
