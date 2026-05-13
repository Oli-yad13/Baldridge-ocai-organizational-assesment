import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/get-user-id'

// PATCH - Extend expiration date for a batch
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
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
        { error: 'Forbidden - Only admins can update credentials' },
        { status: 403 }
      )
    }

    const { batchId } = await params
    const body = await request.json()
    const { expiresAt, isActive } = body

    if (!expiresAt && isActive === undefined) {
      return NextResponse.json(
        { error: 'expiresAt or isActive is required' },
        { status: 400 }
      )
    }

    // Update all credentials in this batch
    const updateData: any = {}
    if (expiresAt) {
      updateData.expiresAt = new Date(expiresAt)
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    const result = await prisma.assessmentCredential.updateMany({
      where: { batchId },
      data: updateData
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      updated: result.count,
      message: `Updated ${result.count} credentials`
    })

  } catch (error) {
    console.error('Error updating credentials:', error)
    return NextResponse.json(
      { error: 'Failed to update credentials' },
      { status: 500 }
    )
  }
}

// DELETE - Deactivate all credentials in a batch
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
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
        { error: 'Forbidden - Only admins can delete credentials' },
        { status: 403 }
      )
    }

    const { batchId } = await params

    // Delete all credentials in this batch
    const result = await prisma.assessmentCredential.deleteMany({
      where: { batchId }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      deleted: result.count,
      message: `Deleted ${result.count} credentials`
    })

  } catch (error) {
    console.error('Error deleting credentials:', error)
    return NextResponse.json(
      { error: 'Failed to delete credentials' },
      { status: 500 }
    )
  }
}













