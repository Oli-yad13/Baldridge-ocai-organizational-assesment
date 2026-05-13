import { NextRequest, NextResponse } from 'next/server'
import { WorkshopService } from '@/lib/workshop'
import { getUserId } from '@/lib/get-user-id'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const surveyId = searchParams.get('surveyId')
    
    if (!surveyId) {
      return NextResponse.json(
        { error: 'Survey ID is required' },
        { status: 400 }
      )
    }

    const workshops = await WorkshopService.getWorkshopsForSurvey(surveyId)
    
    return NextResponse.json({ workshops })
  } catch (error) {
    console.error('Error fetching workshops:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workshops' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication - only SYSTEM_ADMIN can create workshops
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
        { error: 'Forbidden - Only admins can create workshops' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { surveyId, title, description, facilitatorId, scheduledAt } = body

    if (!surveyId || !title) {
      return NextResponse.json(
        { error: 'Survey ID and title are required' },
        { status: 400 }
      )
    }

    const workshop = await WorkshopService.createWorkshop({
      surveyId,
      title,
      description,
      facilitatorId,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined
    })
    
    return NextResponse.json({ workshop })
  } catch (error) {
    console.error('Error creating workshop:', error)
    return NextResponse.json(
      { error: 'Failed to create workshop' },
      { status: 500 }
    )
  }
}
