import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single access key
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const accessKey = await prisma.accessKey.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    })

    if (!accessKey) {
      return NextResponse.json(
        { error: 'Access key not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ accessKey })
  } catch (error) {
    console.error('Error fetching access key:', error)
    return NextResponse.json(
      { error: 'Failed to fetch access key' },
      { status: 500 }
    )
  }
}

// PATCH update access key
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // If updating expiresAt, convert to Date
    if (body.expiresAt) {
      body.expiresAt = new Date(body.expiresAt)
    }

    const accessKey = await prisma.accessKey.update({
      where: { id },
      data: body,
      include: {
        organization: {
          select: {
            name: true,
            isActive: true,
          },
        },
      },
    })

    return NextResponse.json({ accessKey })
  } catch (error) {
    console.error('Error updating access key:', error)
    return NextResponse.json(
      { error: 'Failed to update access key' },
      { status: 500 }
    )
  }
}

// DELETE access key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.accessKey.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting access key:', error)
    return NextResponse.json(
      { error: 'Failed to delete access key' },
      { status: 500 }
    )
  }
}
