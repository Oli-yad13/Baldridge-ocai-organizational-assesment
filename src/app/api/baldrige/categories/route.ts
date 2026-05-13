import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/get-user-id';

// GET /api/baldrige/categories
// Get all Baldrige categories with subcategories and questions
// Also loads user's existing responses for resuming assessment
export async function GET(request: NextRequest) {
  try {
    console.log('[Baldrige Categories API] Starting request');
    
    const userId = await getUserId(request);
    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get('surveyId') || null;

    console.log('[Baldrige Categories API] Request params:', { userId, surveyId });

    // Get categories with questions
    console.log('[Baldrige Categories API] Fetching categories from database...');
    const categories = await prisma.baldrigeCategory.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        subcategories: {
          orderBy: { displayOrder: 'asc' },
          include: {
            questions: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    console.log('[Baldrige Categories API] Categories fetched:', categories.length);

    // If user is authenticated, load their existing responses
    let userResponses: any[] = [];
    if (userId) {
      console.log('[Baldrige Categories API] Fetching user responses...');
      userResponses = await prisma.baldrigeResponse.findMany({
        where: {
          userId: userId,
          surveyId: surveyId,
        },
      });
      console.log('[Baldrige Categories API] User responses fetched:', userResponses.length);
    }

    // Map responses to questions
    const responseMap = new Map(
      userResponses.map(r => [r.questionId, r])
    );

    // Attach responses to questions
    const categoriesWithResponses = categories.map(cat => ({
      ...cat,
      subcategories: cat.subcategories.map(sub => ({
        ...sub,
        questions: sub.questions.map(q => ({
          ...q,
          userResponse: responseMap.get(q.id) || null,
        })),
      })),
    }));

    console.log('[Baldrige Categories API] Success - returning data');
    return NextResponse.json({
      success: true,
      data: categoriesWithResponses,
    });
  } catch (error) {
    console.error('[Baldrige Categories API] ERROR:', error);
    console.error('[Baldrige Categories API] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch categories',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
