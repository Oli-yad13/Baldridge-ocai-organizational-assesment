import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/get-user-id'

// GET all access keys (SYSTEM_ADMIN only)
export async function GET(request: NextRequest) {
  try {
    // Check authentication - only SYSTEM_ADMIN can view access keys
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
        { error: 'Forbidden - Only admins can view access keys' },
        { status: 403 }
      )
    }

    const accessKeys = await prisma.accessKey.findMany({
      include: {
        organization: {
          select: {
            name: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ accessKeys })
  } catch (error) {
    console.error('Error fetching access keys:', error)
    return NextResponse.json(
      { error: 'Failed to fetch access keys' },
      { status: 500 }
    )
  }
}

// POST create new access key (SYSTEM_ADMIN only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication - only SYSTEM_ADMIN can create access keys
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
        { error: 'Forbidden - Only admins can create access keys' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      key,
      organizationId,
      assessmentTypes,
      maxUses,
      expiresAt,
      description,
      createdBy,
    } = body

    if (!key || !organizationId) {
      return NextResponse.json(
        { error: 'Access key and organization are required' },
        { status: 400 }
      )
    }

    // Check if key already exists
    const existingKey = await prisma.accessKey.findUnique({
      where: { key },
    })

    if (existingKey) {
      return NextResponse.json(
        { error: 'Access key already exists' },
        { status: 400 }
      )
    }

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    const accessKey = await prisma.accessKey.create({
      data: {
        key,
        organizationId,
        assessmentTypes: assessmentTypes || 'OCAI,BALDRIGE',
        maxUses: maxUses || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        description,
        createdBy,
        isActive: true,
        usageCount: 0,
      },
      include: {
        organization: {
          select: {
            name: true,
            isActive: true,
          },
        },
      },
    })

    return NextResponse.json({ accessKey }, { status: 201 })
  } catch (error) {
    console.error('Error creating access key:', error)
    return NextResponse.json(
      { error: 'Failed to create access key' },
      { status: 500 }
    )
  }
}
