import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/get-user-id';

// GET /api/ocai/check-completion
// Check if user has already completed the OCAI assessment
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
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

    // Get user info to check email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json(
        { success: false, message: 'User or organization not found' },
        { status: 404 }
      );
    }

    // Check if user has completed the OCAI assessment
    // Only check within the SAME organization to prevent false positives
    const response = await prisma.response.findFirst({
      where: {
        isComplete: true, // IMPORTANT: Only check completed responses
        OR: [
          {
            userId: userId,
            survey: {
              assessmentType: 'OCAI',
              organizationId: user.organizationId
            }
          },
          {
            credentialEmail: user.email || undefined,
            survey: {
              assessmentType: 'OCAI',
              organizationId: user.organizationId
            }
          },
          {
            user: {
              email: user.email || undefined,
              organizationId: user.organizationId
            },
            survey: {
              assessmentType: 'OCAI',
              organizationId: user.organizationId
            }
          }
        ]
      },
      include: {
        survey: {
          select: {
            assessmentType: true,
            organizationId: true
          }
        }
      }
    });

    const isCompleted = !!response;

    // Debug logging
    console.log('OCAI Completion Check:', {
      userId,
      userEmail: user.email,
      organizationId: user.organizationId,
      isCompleted,
      responseId: response?.id,
      surveyOrgId: response?.survey?.organizationId
    });

    return NextResponse.json({
      success: true,
      isCompleted,
      responseId: response?.id || null,
      completedAt: response?.submittedAt || null,
      message: isCompleted ? 'Assessment already completed by this email' : 'No completion found'
    });
  } catch (error) {
    console.error('Error checking OCAI completion:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to check completion status',
      },
      { status: 500 }
    );
  }
}

