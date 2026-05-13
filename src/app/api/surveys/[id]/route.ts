import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[Survey API] Fetching survey with ID:', id)

    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    })

    if (!survey) {
      console.log('[Survey API] Survey not found in database:', id)
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    console.log('[Survey API] Survey found:', {
      id: survey.id,
      status: survey.status,
      organizationId: survey.organizationId,
      title: survey.title
    })

    // Check if survey is open
    if (survey.status !== 'OPEN') {
      console.log('[Survey API] Survey is not open, status:', survey.status)
      return NextResponse.json(
        { error: 'Survey is not currently open' },
        { status: 403 }
      )
    }

    return NextResponse.json(survey)
  } catch (error) {
    console.error('[Survey API] Error fetching survey:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
