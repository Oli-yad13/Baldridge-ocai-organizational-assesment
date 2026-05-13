import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/get-user-id'

// GET single organization
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        accessKeys: true,
        surveys: {
          include: {
            _count: {
              select: {
                responses: true,
              },
            },
          },
        },
      },
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ organization })
  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    )
  }
}

// PATCH update organization (SYSTEM_ADMIN only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication - only SYSTEM_ADMIN can update organizations
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
        { error: 'Forbidden - Only admins can update organizations' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const organization = await prisma.organization.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ organization })
  } catch (error) {
    console.error('Error updating organization:', error)
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    )
  }
}

// DELETE organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.organization.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting organization:', error)
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    )
  }
}
