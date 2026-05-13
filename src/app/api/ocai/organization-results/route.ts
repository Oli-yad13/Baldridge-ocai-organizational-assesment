import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/get-user-id';

// GET /api/ocai/organization-results
// Get organization-wide OCAI results aggregated by access key
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is admin or facilitator
    if (user.role !== 'SYSTEM_ADMIN' && user.role !== 'FACILITATOR') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const organizationId = request.nextUrl.searchParams.get('organizationId') || user.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { success: false, message: 'Organization ID required' },
        { status: 400 }
      );
    }

    // For facilitators, ensure they can only access their own organization
    if (user.role === 'FACILITATOR' && user.organizationId !== organizationId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access to organization' },
        { status: 403 }
      );
    }

    // Get organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { success: false, message: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get all responses from users who used this organization's access keys
    const responses = await prisma.response.findMany({
      where: {
        user: {
          organizationId: organizationId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            accessKeyUsed: true,
          },
        },
        survey: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    if (responses.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          organization: {
            id: organization.id,
            name: organization.name,
          },
          totalResponses: 0,
          individualResults: [],
          organizationAggregate: null,
        },
      });
    }

    // Calculate organization-wide aggregate (mean)
    const aggregate = calculateOrganizationAggregate(responses);

    // Get individual results - ONLY for SYSTEM_ADMIN
    // Facilitators should only see aggregate data to protect employee privacy
    let individualResults: any[] = [];

    if (user.role === 'SYSTEM_ADMIN') {
      individualResults = responses.map(response => {
        const nowScores = typeof response.nowScores === 'string'
          ? JSON.parse(response.nowScores)
          : response.nowScores;

        const preferredScores = typeof response.preferredScores === 'string'
          ? JSON.parse(response.preferredScores)
          : response.preferredScores;

        return {
          responseId: response.id,
          userId: response.user?.id,
          userName: response.user?.name || 'Anonymous',
          userEmail: response.user?.email || 'N/A',
          accessKey: response.user?.accessKeyUsed || 'N/A',
          surveyId: response.survey?.id,
          surveyTitle: response.survey?.title || 'Individual Assessment',
          submittedAt: response.submittedAt,
          nowScores,
          preferredScores,
          delta: {
            Clan: round(preferredScores.clan - nowScores.clan),
            Adhocracy: round(preferredScores.adhocracy - nowScores.adhocracy),
            Market: round(preferredScores.market - nowScores.market),
            Hierarchy: round(preferredScores.hierarchy - nowScores.hierarchy),
          },
        };
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        organization: {
          id: organization.id,
          name: organization.name,
        },
        totalResponses: responses.length,
        individualResults,
        organizationAggregate: aggregate,
      },
    });
  } catch (error) {
    console.error('Error fetching OCAI organization results:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}

// Calculate organization-wide aggregate using mean
function calculateOrganizationAggregate(responses: any[]) {
  if (responses.length === 0) return null;

  const totals = {
    now: { clan: 0, adhocracy: 0, market: 0, hierarchy: 0 },
    preferred: { clan: 0, adhocracy: 0, market: 0, hierarchy: 0 },
  };

  responses.forEach(response => {
    const nowScores = typeof response.nowScores === 'string'
      ? JSON.parse(response.nowScores)
      : response.nowScores;

    const preferredScores = typeof response.preferredScores === 'string'
      ? JSON.parse(response.preferredScores)
      : response.preferredScores;

    totals.now.clan += nowScores.clan || 0;
    totals.now.adhocracy += nowScores.adhocracy || 0;
    totals.now.market += nowScores.market || 0;
    totals.now.hierarchy += nowScores.hierarchy || 0;

    totals.preferred.clan += preferredScores.clan || 0;
    totals.preferred.adhocracy += preferredScores.adhocracy || 0;
    totals.preferred.market += preferredScores.market || 0;
    totals.preferred.hierarchy += preferredScores.hierarchy || 0;
  });

  const n = responses.length;

  const nowMean = {
    clan: round(totals.now.clan / n),
    adhocracy: round(totals.now.adhocracy / n),
    market: round(totals.now.market / n),
    hierarchy: round(totals.now.hierarchy / n),
  };

  const preferredMean = {
    clan: round(totals.preferred.clan / n),
    adhocracy: round(totals.preferred.adhocracy / n),
    market: round(totals.preferred.market / n),
    hierarchy: round(totals.preferred.hierarchy / n),
  };

  const delta = {
    clan: round(preferredMean.clan - nowMean.clan),
    adhocracy: round(preferredMean.adhocracy - nowMean.adhocracy),
    market: round(preferredMean.market - nowMean.market),
    hierarchy: round(preferredMean.hierarchy - nowMean.hierarchy),
  };

  return {
    n,
    now: nowMean,
    preferred: preferredMean,
    delta,
  };
}

function round(num: number): number {
  return Math.round(num * 100) / 100;
}
