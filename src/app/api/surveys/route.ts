import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { surveyCreateSchema } from '@/lib/validations'
import { checkRateLimit, getClientIP, hashIP } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    // If query params provided, use them (for employee access)
    if (organizationId) {
      const where: any = { organizationId }

      if (type) {
        where.assessmentType = type
      }

      if (status) {
        where.status = status
      }

      console.log('[Surveys API] Fetching surveys with filters:', where)

      const surveys = await prisma.survey.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { responses: true },
          },
        },
      })

      console.log('[Surveys API] Found surveys:', surveys.length, surveys.map(s => ({ id: s.id, title: s.title, status: s.status })))

      return NextResponse.json({ surveys })
    }

    // Otherwise, require session (for admin access)
    const session = await getServerSession(authOptions)

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const surveys = await prisma.survey.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { responses: true },
        },
      },
    })

    return NextResponse.json(surveys)
  } catch (error) {
    console.error('Error fetching surveys:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    let organizationId: string | null = null
    let isEmployeeRequest = false

    // Check for session-based auth (admin only - facilitators cannot create surveys)
    if (session?.user?.organizationId) {
      // Only SYSTEM_ADMIN can create surveys
      if (!['SYSTEM_ADMIN'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden - Only admins can create surveys' }, { status: 403 })
      }
      organizationId = session.user.organizationId
    }
    // Check for employee access (via organizationId in request body)
    else if (body.organizationId) {
      // Validate the organizationId exists
      const org = await prisma.organization.findUnique({
        where: { id: body.organizationId }
      })

      if (!org) {
        return NextResponse.json({ error: 'Invalid organization' }, { status: 400 })
      }

      organizationId = body.organizationId
      isEmployeeRequest = true
    }
    else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check rate limiting
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(clientIP)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const validatedData = surveyCreateSchema.parse(body)

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    const survey = await prisma.survey.create({
      data: {
        ...validatedData,
        organizationId: organizationId,
      },
      include: {
        _count: {
          select: { responses: true },
        },
      },
    })

    return NextResponse.json(survey, { status: 201 })
  } catch (error) {
    console.error('Error creating survey:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
