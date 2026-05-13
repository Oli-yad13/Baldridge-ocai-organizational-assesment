import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/get-user-id';

// GET /api/baldrige/check-completion
// Check if user has already completed the Baldrige assessment
export async function GET(request: NextRequest) {
  try {
    console.log('[Baldrige Check Completion API] Starting request');
    const userId = await getUserId(request);

    console.log('[Baldrige Check Completion API] User ID:', userId);

    if (!userId) {
      console.log('[Baldrige Check Completion API] No user ID - returning 401');
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get('surveyId') || null;

    console.log('[Baldrige Check Completion API] Survey ID:', surveyId);

    // Get user info to check email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, organizationId: true }
    });

    if (!user) {
      console.log('[Baldrige Check Completion API] User not found in database');
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    console.log('[Baldrige Check Completion API] User found:', { email: user.email, orgId: user.organizationId });

    // Check if user has a completed submission
    const submission = await prisma.baldrigeSubmission.findFirst({
      where: {
        userId: userId,
        isCompleted: true
      },
    });

    console.log('[Baldrige Check Completion API] Submission found:', !!submission);

    // Also check progress table
    const progress = await prisma.baldrigeProgress.findFirst({
      where: {
        userId: userId,
        isCompleted: true
      },
    });

    console.log('[Baldrige Check Completion API] Progress found:', !!progress);

    const isCompleted = !!(submission || progress);

    console.log('[Baldrige Check Completion API] Final result - isCompleted:', isCompleted);

    return NextResponse.json({
      success: true,
      isCompleted,
      submissionId: submission?.id || null,
      assessmentId: submission?.assessmentId || null,
      completedAt: submission?.submittedAt || progress?.completedAt || null,
      message: isCompleted ? 'Assessment already completed by this email' : 'No completion found'
    });
  } catch (error) {
    console.error('[Baldrige Check Completion API] ERROR:', error);
    console.error('[Baldrige Check Completion API] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to check completion status',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
