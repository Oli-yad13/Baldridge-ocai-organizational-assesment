import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensurePrismaConnected } from '@/lib/prisma';
import { getUserId } from '@/lib/get-user-id';

// GET /api/baldrige/progress
// Get user's Baldrige assessment progress
export async function GET(request: NextRequest) {
  try {
    await ensurePrismaConnected();
    console.log('[Baldrige Progress API] Starting GET request');
    const userId = await getUserId(request);

    console.log('[Baldrige Progress API] User ID:', userId);

    if (!userId) {
      console.log('[Baldrige Progress API] No user ID - returning 401');
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get('surveyId');

    // Normalize surveyId to null if undefined or empty string
    const normalizedSurveyId = surveyId || null;

    console.log('[Baldrige Progress API] Looking up progress for:', { userId, surveyId: normalizedSurveyId });

    // Note: Explicitly handle null surveyId for proper Prisma query matching
    const progress = await prisma.baldrigeProgress.findFirst({
      where: {
        userId: userId,
        ...(normalizedSurveyId ? { surveyId: normalizedSurveyId } : { surveyId: null }),
      },
    });

    console.log('[Baldrige Progress API] Progress found:', !!progress);

    if (!progress) {
      return NextResponse.json({
        success: true,
        data: {
          completedQuestions: [],
          isCompleted: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('[Baldrige Progress API] ERROR:', error);
    console.error('[Baldrige Progress API] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch progress',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/baldrige/progress
// Update user's Baldrige assessment progress
export async function POST(request: NextRequest) {
  try {
    await ensurePrismaConnected();
    console.log('[Baldrige Progress API] Starting POST request');
    const userId = await getUserId(request);

    console.log('[Baldrige Progress API] User ID:', userId);

    if (!userId) {
      console.log('[Baldrige Progress API] No user ID - returning 401');
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { completedQuestions, surveyId, isCompleted } = body;

    console.log('[Baldrige Progress API] Request body:', { 
      completedQuestionsCount: completedQuestions?.length, 
      surveyId, 
      isCompleted 
    });

    // Normalize surveyId to null if undefined or empty string
    const normalizedSurveyId = surveyId || null;

    // Find existing progress
    // Note: Explicitly handle null surveyId for proper Prisma query matching
    const existingProgress = await prisma.baldrigeProgress.findFirst({
      where: {
        userId: userId,
        ...(normalizedSurveyId ? { surveyId: normalizedSurveyId } : { surveyId: null }),
      },
    });

    let progress;
    if (existingProgress) {
      // Update existing progress
      progress = await prisma.baldrigeProgress.update({
        where: { id: existingProgress.id },
        data: {
          completedQuestions: completedQuestions || [],
          isCompleted: isCompleted || false,
          completedAt: isCompleted ? new Date() : null,
        },
      });
    } else {
      // Create new progress
      progress = await prisma.baldrigeProgress.create({
        data: {
          userId: userId,
          surveyId: normalizedSurveyId,
          completedQuestions: completedQuestions || [],
          isCompleted: isCompleted || false,
          completedAt: isCompleted ? new Date() : null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('[Baldrige Progress API] POST ERROR:', error);
    console.error('[Baldrige Progress API] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to save progress',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
