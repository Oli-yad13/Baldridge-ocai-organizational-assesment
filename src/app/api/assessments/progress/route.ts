import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Load saved progress
export async function GET(request: NextRequest) {
  try {
    console.log('[Assessments Progress API] Starting GET request');
    const { searchParams } = new URL(request.url)
    const credentialEmail = searchParams.get('credentialEmail')
    const surveyId = searchParams.get('surveyId')
    const assessmentType = searchParams.get('assessmentType')

    console.log('[Assessments Progress API] Request params:', { credentialEmail, surveyId, assessmentType });

    if (!credentialEmail || !assessmentType) {
      console.log('[Assessments Progress API] Missing required params');
      return NextResponse.json(
        { error: 'credentialEmail and assessmentType are required' },
        { status: 400 }
      )
    }

    // Test database connection
    console.log('[Assessments Progress API] Connecting to database...');
    await prisma.$connect()

    // Find in-progress response for this user
    const response = await prisma.response.findFirst({
      where: {
        credentialEmail: credentialEmail.toLowerCase().trim(),
        ...(surveyId ? { surveyId } : {}),
        isComplete: false,
        survey: {
          assessmentType: assessmentType === 'OCAI' ? 'OCAI' : 'BALDRIGE'
        }
      },
      orderBy: {
        lastSavedAt: 'desc'
      }
    })

    if (!response) {
      return NextResponse.json({
        hasProgress: false,
        progress: null
      })
    }

    return NextResponse.json({
      hasProgress: true,
      progress: {
        responseId: response.id,
        surveyId: response.surveyId,
        progressData: response.progressData,
        lastSavedAt: response.lastSavedAt
      }
    })

  } catch (error) {
    console.error('[Assessments Progress API] GET ERROR:', error)
    console.error('[Assessments Progress API] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Handle specific database connection errors
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        return NextResponse.json(
          { error: 'Database connection failed. Please try again later.' },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to load progress', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    // Do not disconnect Prisma in Next.js route handlers; client is shared
  }
}

// POST - Save progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      credentialEmail,
      surveyId,
      progressData,
      demographics,
      nowScores,
      preferredScores,
      isComplete,
      ipHash
    } = body

    if (!credentialEmail || !surveyId) {
      return NextResponse.json(
        { error: 'credentialEmail and surveyId are required' },
        { status: 400 }
      )
    }

    // Check if response already exists
    let response = await prisma.response.findFirst({
      where: {
        credentialEmail: credentialEmail.toLowerCase().trim(),
        surveyId,
        isComplete: false
      }
    })

    const responseData = {
      credentialEmail: credentialEmail.toLowerCase().trim(),
      surveyId,
      demographics: demographics || {},
      nowScores: nowScores || {},
      preferredScores: preferredScores || {},
      progressData: progressData || {},
      isComplete: isComplete || false,
      lastSavedAt: new Date(),
      ipHash: ipHash || 'unknown',
      consentGiven: true,
      anonymousMode: false
    }

    if (response) {
      // Update existing response
      response = await prisma.response.update({
        where: { id: response.id },
        data: responseData
      })
    } else {
      // Create new response
      response = await prisma.response.create({
        data: responseData
      })
    }

    return NextResponse.json({
      success: true,
      responseId: response.id,
      message: isComplete ? 'Assessment completed' : 'Progress saved'
    })

  } catch (error) {
    console.error('[Assessments Progress API] POST ERROR:', error)
    console.error('[Assessments Progress API] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Handle specific database connection errors
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        return NextResponse.json(
          { error: 'Database connection failed. Please try again later.' },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to save progress', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    // Do not disconnect Prisma in Next.js route handlers; client is shared
  }
}



