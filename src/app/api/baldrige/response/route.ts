import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensurePrismaConnected } from '@/lib/prisma';
import { getUserId } from '@/lib/get-user-id';

// POST /api/baldrige/response
// Save or update a response to a Baldrige question
export async function POST(request: NextRequest) {
  try {
    await ensurePrismaConnected();
    console.log('[Baldrige Response API] Starting POST request');
    const userId = await getUserId(request);

    console.log('[Baldrige Response API] User ID:', userId);

    if (!userId) {
      console.log('[Baldrige Response API] No user ID - returning 401');
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { questionId, responseText, surveyId, timeSpent } = body;

    console.log('[Baldrige Response API] Request body:', { questionId, responseTextLength: responseText?.length, surveyId, timeSpent });

    if (!questionId) {
      return NextResponse.json(
        {
          success: false,
          message: 'questionId is required',
        },
        { status: 400 }
      );
    }

    // Allow empty responses (user can skip questions)
    const trimmedResponse = responseText?.trim() || '';

    // Verify question exists
    const question = await prisma.baldrigeQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          message: 'Question not found',
        },
        { status: 404 }
      );
    }

    // Normalize surveyId to null if undefined or empty string
    const normalizedSurveyId = surveyId || null;

    // Find existing response
    // Note: Explicitly handle null surveyId for proper Prisma query matching
    const existingResponse = await prisma.baldrigeResponse.findFirst({
      where: {
        userId: userId,
        questionId: questionId,
        ...(normalizedSurveyId ? { surveyId: normalizedSurveyId } : { surveyId: null }),
      },
    });

    let response;
    if (existingResponse) {
      // Short-circuit if unchanged to reduce DB writes
      if ((existingResponse.responseText || '') === trimmedResponse) {
        return NextResponse.json({
          success: true,
          message: 'No changes to save',
          data: { id: existingResponse.id, responseText: existingResponse.responseText, updatedAt: existingResponse.updatedAt },
        });
      }
      // Update existing response
      response = await prisma.baldrigeResponse.update({
        where: { id: existingResponse.id },
        data: {
          responseText: trimmedResponse,
          timeSpent: timeSpent || 0,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new response
      response = await prisma.baldrigeResponse.create({
        data: {
          userId: userId,
          questionId: questionId,
          surveyId: normalizedSurveyId,
          responseText: trimmedResponse,
          timeSpent: timeSpent || 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Response saved successfully',
      data: {
        id: response.id,
        responseText: response.responseText,
        updatedAt: response.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('[Baldrige Response API] ERROR:', error);
    console.error('[Baldrige Response API] Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to save response',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
