import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get user from localStorage (sent via headers or query params)
    // For now, we'll rely on the client sending userId
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      );
    }

    // Find the user's most recent OCAI response
    const response = await prisma.response.findFirst({
      where: {
        userId: userId,
      },
      orderBy: {
        submittedAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!response) {
      return NextResponse.json(
        { response: null },
        { status: 200 }
      );
    }

    // Parse scores
    const nowScores = typeof response.nowScores === 'string'
      ? JSON.parse(response.nowScores)
      : response.nowScores;

    const preferredScores = typeof response.preferredScores === 'string'
      ? JSON.parse(response.preferredScores)
      : response.preferredScores;

    // Calculate deltas
    const delta = {
      clan: (preferredScores.clan || 0) - (nowScores.clan || 0),
      adhocracy: (preferredScores.adhocracy || 0) - (nowScores.adhocracy || 0),
      market: (preferredScores.market || 0) - (nowScores.market || 0),
      hierarchy: (preferredScores.hierarchy || 0) - (nowScores.hierarchy || 0),
    };

    return NextResponse.json({
      response: {
        responseId: response.id,
        submittedAt: response.submittedAt,
        nowScores: nowScores,
        preferredScores: preferredScores,
        delta: delta,
      },
    });
  } catch (error) {
    console.error('Error fetching user OCAI response:', error);
    return NextResponse.json(
      { error: 'Failed to fetch response' },
      { status: 500 }
    );
  }
}
