import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashIP, getClientIP } from '@/lib/security'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { demographics, nowScores, preferredScores, userId, consentGiven } = body

    // Verify survey exists and is open
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: { organization: true },
    })

    if (!survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    if (survey.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Survey is not currently open' },
        { status: 403 }
      )
    }

    // Hash the user's IP for privacy
    const clientIP = getClientIP(request)
    const ipHash = hashIP(clientIP)

    // Get user email if userId is provided (for tracking credential users)
    let credentialEmail = null;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, role: true }
      });
      
      // Save email for credential users (EMPLOYEE role from credentials)
      if (user && user.email) {
        credentialEmail = user.email;
      }
    }

    // Create the response
    const response = await prisma.response.create({
      data: {
        surveyId: id,
        userId: userId || null,
        credentialEmail: credentialEmail, // Track email for duplicate prevention
        demographics: demographics || {},
        nowScores,
        preferredScores,
        ipHash,
        consentGiven: consentGiven || false,
        consentTimestamp: consentGiven ? new Date() : null,
        consentVersion: survey.organization?.consentVersion || '1.0',
        isComplete: true, // Mark as complete when submitted
      },
    })

    // If this is an OCAI survey, trigger aggregation update
    if (survey.assessmentType === 'OCAI' && survey.organizationId) {
      try {
        // Trigger aggregation update in the background
        fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3010'}/api/ocai/update-aggregation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId || 'system',
          },
          body: JSON.stringify({
            organizationId: survey.organizationId,
            surveyId: id
          })
        }).catch(error => {
          console.error('Failed to trigger aggregation update:', error);
          // Don't fail the main request if aggregation update fails
        });
      } catch (error) {
        console.error('Error triggering aggregation update:', error);
        // Don't fail the main request if aggregation update fails
      }
    }

    return NextResponse.json({
      success: true,
      responseId: response.id,
    })
  } catch (error) {
    console.error('Error submitting response:', error)
    return NextResponse.json(
      { error: 'Failed to submit response' },
      { status: 500 }
    )
  }
}
