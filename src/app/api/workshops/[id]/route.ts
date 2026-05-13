import { NextRequest, NextResponse } from 'next/server'
import { WorkshopService } from '@/lib/workshop'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const workshop = await WorkshopService.getWorkshop(id)
    
    if (!workshop) {
      return NextResponse.json(
        { error: 'Workshop not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ workshop })
  } catch (error) {
    console.error('Error fetching workshop:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workshop' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Update workshop logic would go here
    // For now, just return success
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating workshop:', error)
    return NextResponse.json(
      { error: 'Failed to update workshop' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Delete workshop logic would go here
    // For now, just return success
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting workshop:', error)
    return NextResponse.json(
      { error: 'Failed to delete workshop' },
      { status: 500 }
    )
  }
}
