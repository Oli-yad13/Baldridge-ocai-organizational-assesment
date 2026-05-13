import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/baldrige/questions/:subcategoryId
// Get all questions for a specific subcategory with user responses
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subcategoryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { subcategoryId } = await params;

    const subcategory = await prisma.baldrigeSubcategory.findUnique({
      where: { id: subcategoryId },
      include: {
        category: { select: { name: true } },
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!subcategory) {
      return NextResponse.json(
        {
          success: false,
          message: 'Subcategory not found',
        },
        { status: 404 }
      );
    }

    // Get user's existing responses if authenticated
    let userResponses: any[] = [];
    if (session?.user?.id) {
      userResponses = await prisma.baldrigeResponse.findMany({
        where: {
          userId: session.user.id,
          questionId: {
            in: subcategory.questions.map((q) => q.id),
          },
        },
      });
    }

    const responseMap = new Map(
      userResponses.map((response) => [response.questionId, response])
    );

    // Format questions with user responses
    const questionsWithResponses = subcategory.questions.map((question) => ({
      id: question.id,
      itemCode: question.itemCode,
      questionText: question.questionText,
      orderIndex: question.orderIndex,
      instructions: question.instructions,
      userResponse: responseMap.has(question.id)
        ? {
            responseText: responseMap.get(question.id)?.responseText,
            timeSpent: responseMap.get(question.id)?.timeSpent,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        subcategory: {
          id: subcategory.id,
          name: subcategory.name,
          description: subcategory.description,
          points: subcategory.points,
          categoryName: subcategory.category.name,
        },
        questions: questionsWithResponses,
      },
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch questions',
      },
      { status: 500 }
    );
  }
}
