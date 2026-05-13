import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/get-user-id';

// POST /api/ocai/update-aggregation
// Update organization-wide aggregation when new OCAI assessment is submitted
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { organizationId, surveyId } = body;

    if (!organizationId || !surveyId) {
      return NextResponse.json(
        { success: false, message: 'Organization ID and Survey ID are required' },
        { status: 400 }
      );
    }

    // Get all OCAI responses for this organization
    const responses = await prisma.response.findMany({
      where: {
        survey: {
          organizationId: organizationId,
          assessmentType: 'OCAI'
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            accessKeyUsed: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    if (responses.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No responses found for aggregation',
        data: {
          organizationId,
          totalResponses: 0,
          organizationAggregate: null
        }
      });
    }

    // Calculate organization-wide aggregate
    const organizationAggregate = calculateOrganizationAggregate(responses);

    // Get organization info
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true }
    });

    if (!organization) {
      return NextResponse.json(
        { success: false, message: 'Organization not found' },
        { status: 404 }
      );
    }

    // Prepare individual results
    const individualResults = responses.map(response => {
      const nowScores = typeof response.nowScores === 'string'
        ? JSON.parse(response.nowScores)
        : response.nowScores;

      const preferredScores = typeof response.preferredScores === 'string'
        ? JSON.parse(response.preferredScores)
        : response.preferredScores;

      const delta = {
        clan: round(preferredScores.clan - nowScores.clan),
        adhocracy: round(preferredScores.adhocracy - nowScores.adhocracy),
        market: round(preferredScores.market - nowScores.market),
        hierarchy: round(preferredScores.hierarchy - nowScores.hierarchy),
      };

      return {
        responseId: response.id,
        userId: response.userId,
        userName: response.user?.name || 'Anonymous',
        userEmail: response.user?.email || '',
        accessKey: response.user?.accessKeyUsed || '',
        submittedAt: response.submittedAt.toISOString(),
        nowScores,
        preferredScores,
        delta
      };
    });

    const result = {
      organization: {
        id: organization.id,
        name: organization.name
      },
      totalResponses: responses.length,
      individualResults,
      organizationAggregate
    };

    return NextResponse.json({
      success: true,
      message: 'Aggregation updated successfully',
      data: result
    });

  } catch (error) {
    console.error('Error updating aggregation:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update aggregation' },
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
