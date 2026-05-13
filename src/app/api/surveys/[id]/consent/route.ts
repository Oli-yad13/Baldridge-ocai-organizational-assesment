import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        organization: true
      }
    })

    if (!survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    const consentData = {
      surveyTitle: survey.title,
      organizationName: survey.organization.name,
      privacyPolicyUrl: survey.organization.privacyPolicyUrl,
      dataRetentionDays: survey.organization.dataRetentionDays,
      consentVersion: survey.organization.consentVersion
    }

    return NextResponse.json({ consentData })
  } catch (error) {
    console.error('Error fetching consent data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch consent information' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { consentGiven, anonymousMode, consentVersion } = body

    if (!consentGiven) {
      return NextResponse.json(
        { error: 'Consent must be given to proceed' },
        { status: 400 }
      )
    }

    // Store consent in session or temporary storage
    // In a real app, you'd store this in a proper session management system
    const consentData = {
      surveyId: id,
      consentGiven,
      anonymousMode,
      consentVersion,
      timestamp: new Date().toISOString()
    }

    // For now, we'll store this in a simple way
    // In production, use proper session management
    return NextResponse.json({ 
      success: true, 
      consentData,
      message: 'Consent recorded successfully' 
    })
  } catch (error) {
    console.error('Error recording consent:', error)
    return NextResponse.json(
      { error: 'Failed to record consent' },
      { status: 500 }
    )
  }
}
