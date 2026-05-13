import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensurePrismaConnected } from '@/lib/prisma';
import { getUserId } from '@/lib/get-user-id';

// Generate unique assessment ID for organization
async function generateAssessmentId(organizationId: string | null): Promise<string> {
  const year = new Date().getFullYear();
  const orgPrefix = organizationId ? organizationId.substring(0, 6).toUpperCase() : 'INDV';

  // Count existing submissions for this organization this year
  const startOfYear = new Date(year, 0, 1);
  const count = await prisma.baldrigeSubmission.count({
    where: {
      organizationId: organizationId,
      createdAt: {
        gte: startOfYear,
      },
    },
  });

  const sequenceNumber = String(count + 1).padStart(3, '0');
  return `BLD-${orgPrefix}-${year}-${sequenceNumber}`;
}

// POST /api/baldrige/submit
// Submit completed Baldrige assessment
export async function POST(request: NextRequest) {
  try {
    await ensurePrismaConnected();
    console.log('[Baldrige Submit API] Starting POST request');
    const userId = await getUserId(request);

    console.log('[Baldrige Submit API] User ID:', userId);

    if (!userId) {
      console.log('[Baldrige Submit API] No user ID - returning 401');
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { surveyId } = body;

    // Normalize surveyId to null if undefined or empty string
    const normalizedSurveyId = surveyId || null;

    console.log('[Baldrige Submit API] Survey ID:', normalizedSurveyId);

    // Get total question count (ALL questions including Organizational Profile)
    const totalQuestions = await prisma.baldrigeQuestion.count();
    console.log('[Baldrige Submit API] Total questions in system:', totalQuestions);

    // Get user's answered questions count (including empty responses - count all viewed questions)
    // Note: Explicitly handle null surveyId for proper Prisma query matching
    const answeredQuestions = await prisma.baldrigeResponse.count({
      where: {
        userId: userId,
        ...(normalizedSurveyId ? { surveyId: normalizedSurveyId } : { surveyId: null }),
        responseText: {
          not: null,
        },
      },
    });

    // Get count of questions with non-empty responses for reporting
    const nonEmptyResponses = await prisma.baldrigeResponse.count({
      where: {
        userId: userId,
        ...(normalizedSurveyId ? { surveyId: normalizedSurveyId } : { surveyId: null }),
        AND: [
          {
            responseText: {
              not: null,
            },
          },
          {
            responseText: {
              not: '',
            },
          },
        ],
      },
    });

    console.log(
      `[Baldrige Submit API] User ${userId} attempting submission: ${nonEmptyResponses}/${totalQuestions} questions answered (${answeredQuestions} total responses including skipped)`
    );

    // Get user details with organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        organizationId: true,
        accessKeyUsed: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Check if user already has a submission for this survey
    const existingSubmission = await prisma.baldrigeSubmission.findFirst({
      where: {
        userId: user.id,
        ...(normalizedSurveyId ? { surveyId: normalizedSurveyId } : { surveyId: null }),
      },
    });

    if (existingSubmission) {
      console.log('[Baldrige Submit API] User already has a submission - returning existing submission');
      return NextResponse.json({
        success: true,
        message: 'Assessment already submitted',
        data: {
          submissionId: existingSubmission.id,
          assessmentId: existingSubmission.assessmentId,
          submittedAt: existingSubmission.submittedAt,
          totalQuestions: existingSubmission.totalQuestions,
          answeredQuestions: existingSubmission.answeredQuestions,
          alreadySubmitted: true,
        },
      });
    }

    // Generate unique assessment ID
    const assessmentId = await generateAssessmentId(user.organizationId);

    // Create submission record
    const submission = await prisma.baldrigeSubmission.create({
      data: {
        assessmentId,
        userId: user.id,
        organizationId: user.organizationId,
        surveyId: normalizedSurveyId,
        accessKey: user.accessKeyUsed,
        submittedAt: new Date(),
        isCompleted: true,
        totalQuestions,
        answeredQuestions: nonEmptyResponses,
        metadata: {
          userName: user.name,
          userEmail: user.email,
          submissionTimestamp: new Date().toISOString(),
          totalResponses: answeredQuestions,
          skippedQuestions: totalQuestions - answeredQuestions,
        },
      },
    });

    // Mark assessment as completed
    const existingProgress = await prisma.baldrigeProgress.findFirst({
      where: {
        userId: userId,
        ...(normalizedSurveyId ? { surveyId: normalizedSurveyId } : { surveyId: null }),
      },
    });

    if (existingProgress) {
      await prisma.baldrigeProgress.update({
        where: { id: existingProgress.id },
        data: {
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    } else {
      await prisma.baldrigeProgress.create({
        data: {
          userId: userId,
          surveyId: normalizedSurveyId,
          completedQuestions: [],
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message:
        'Thank you for completing the Baldrige Excellence Framework Assessment! Your responses have been successfully submitted.',
      data: {
        submissionId: submission.id,
        assessmentId: submission.assessmentId,
        submittedAt: submission.submittedAt,
        totalQuestions,
        answeredQuestions: nonEmptyResponses,
        skippedQuestions: totalQuestions - answeredQuestions,
        completionRate: Math.round((nonEmptyResponses / totalQuestions) * 100),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error('[Baldrige Submit API] ERROR:', error);
    console.error('[Baldrige Submit API] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit assessment',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
