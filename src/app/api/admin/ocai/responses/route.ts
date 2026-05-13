import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/get-user-id';

// GET /api/admin/ocai/responses
// Fetch all OCAI responses organized by company/organization
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check role - only SYSTEM_ADMIN and FACILITATOR can view responses
    if (user.role !== 'SYSTEM_ADMIN' && user.role !== 'FACILITATOR') {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get all OCAI responses with user and organization info
    const responses = await prisma.response.findMany({
      where: {
        survey: {
          assessmentType: 'OCAI'
        }
      },
      include: {
        user: {
          include: {
            organization: true,
          },
        },
        survey: true,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    // Organize responses by organization
    const organizationData: Record<string, any> = {};

    responses.forEach(response => {
      const orgId = response.user?.organizationId || 'no-organization';
      const orgName = response.user?.organization?.name || 'No Organization';
      const userId = response.userId || 'anonymous';
      const userName = response.user?.name || 'Anonymous User';
      
      // PRIVACY: Hide emails/credentials for facilitators
      const userEmail = user.role === 'SYSTEM_ADMIN' 
        ? (response.user?.email || response.credentialEmail || 'N/A')
        : '***HIDDEN***';
      const accessKey = user.role === 'SYSTEM_ADMIN'
        ? (response.user?.accessKeyUsed || 'N/A')
        : '***HIDDEN***';

      // Initialize organization if not exists
      if (!organizationData[orgId]) {
        organizationData[orgId] = {
          organizationId: orgId,
          organizationName: orgName,
          users: {},
        };
      }

      // Initialize user if not exists
      if (!organizationData[orgId].users[userId]) {
        organizationData[orgId].users[userId] = {
          userId,
          userName,
          userEmail,
          accessKey,
          completedAt: response.submittedAt,
          surveyId: response.surveyId,
          surveyTitle: response.survey?.title || 'Individual Assessment',
          responses: [],
        };
      }

      // Parse scores if they're JSON strings
      const nowScores = typeof response.nowScores === 'string'
        ? JSON.parse(response.nowScores)
        : response.nowScores;

      const preferredScores = typeof response.preferredScores === 'string'
        ? JSON.parse(response.preferredScores)
        : response.preferredScores;

      const demographics = typeof response.demographics === 'string'
        ? JSON.parse(response.demographics)
        : response.demographics;

      // Add response
      organizationData[orgId].users[userId].responses.push({
        id: response.id,
        demographics: demographics,
        nowScores: nowScores,
        preferredScores: preferredScores,
        submittedAt: response.submittedAt,
        userId: response.userId,
        surveyId: response.surveyId,
      });
    });

    // Convert to array format
    const organizedData = Object.values(organizationData).map(org => ({
      ...org,
      users: Object.values(org.users),
      totalUsers: Object.keys(org.users).length,
    }));

    return NextResponse.json({
      success: true,
      data: organizedData,
      summary: {
        totalOrganizations: organizedData.length,
        totalUsers: responses.filter((r, i, arr) => arr.findIndex(x => x.userId === r.userId) === i).length,
        totalResponses: responses.length,
      },
    });
  } catch (error) {
    console.error('Error fetching OCAI responses:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch OCAI responses',
      },
      { status: 500 }
    );
  }
}
