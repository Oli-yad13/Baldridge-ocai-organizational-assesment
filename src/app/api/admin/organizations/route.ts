import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/get-user-id'
import bcrypt from 'bcryptjs'

// GET all organizations
export async function GET(request: NextRequest) {
  try {
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

    if (!user || user.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Only admins can view organizations' },
        { status: 403 }
      )
    }

    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            surveys: true,
            accessKeys: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ organizations })
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    )
  }
}

// POST create new organization
export async function POST(request: NextRequest) {
  try {
    // Check authentication - only SYSTEM_ADMIN
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

    if (!user || user.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Only admins can create organizations' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      industry,
      size,
      country,
      subscribedAssessments,
      logoUrl,
      primaryColor,
      createdById,
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      )
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        industry,
        size,
        country,
        subscribedAssessments: subscribedAssessments || 'OCAI,BALDRIGE',
        logoUrl,
        primaryColor: primaryColor || '#3B82F6',
        isActive: true,
        createdById,
      },
    })

    // Auto-create default surveys for the subscribed assessments
    const assessmentTypes = (subscribedAssessments || 'OCAI,BALDRIGE').split(',').map((t: string) => t.trim())

    for (const assessmentType of assessmentTypes) {
      if (assessmentType === 'OCAI' || assessmentType === 'BALDRIGE') {
        await prisma.survey.create({
          data: {
            title: `${name} - ${assessmentType === 'OCAI' ? 'OCAI Culture Assessment' : 'Baldrige Excellence Assessment'}`,
            assessmentType: assessmentType as 'OCAI' | 'BALDRIGE',
            status: 'OPEN',
            organizationId: organization.id,
            allowAnonymous: true,
            requireOrgEmailDomain: false,
          },
        })
      }
    }

    return NextResponse.json({ organization }, { status: 201 })
  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    )
  }
}
