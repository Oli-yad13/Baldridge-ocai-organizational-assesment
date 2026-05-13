import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/get-user-id';
import bcrypt from 'bcryptjs';

// GET - List all credential batches
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Only admins can view credentials' },
        { status: 403 }
      );
    }

    // Get all assessment credentials grouped by batch
    const credentials = await prisma.assessmentCredential.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group by batchId
    const batchMap = new Map();
    
    credentials.forEach(cred => {
      const batchId = cred.batchId || 'unbatched';
      if (!batchMap.has(batchId)) {
        batchMap.set(batchId, {
          batchId: batchId,
          batchName: cred.batchName,
          organizationId: cred.organizationId,
          organizationName: cred.organization?.name || 'N/A',
          assessmentTypes: cred.assessmentTypes || '',
          expiresAt: cred.expiresAt,
          createdAt: cred.createdAt,
          credentials: [],
          stats: {
            total: 0,
            used: 0,
            unused: 0,
            expired: false
          }
        });
      }
      
      const batch = batchMap.get(batchId);
      batch.credentials.push({
        id: cred.id,
        email: cred.email,
        isActive: cred.isActive,
        loginCount: cred.loginCount || 0,
        lastUsedAt: cred.lastUsedAt
      });
      
      batch.stats.total++;
      if (cred.loginCount && cred.loginCount > 0) {
        batch.stats.used++;
      } else {
        batch.stats.unused++;
      }
      
      if (cred.expiresAt && new Date(cred.expiresAt) < new Date()) {
        batch.stats.expired = true;
      }
    });

    const batches = Array.from(batchMap.values());

    return NextResponse.json({
      success: true,
      batches
    });
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credentials' },
      { status: 500 }
    );
  }
}

// POST - Bulk upload credentials from CSV
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Only admins can upload credentials' },
        { status: 403 }
      );
    }

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const organizationId = formData.get('organizationId') as string;
    const assessmentTypes = formData.get('assessmentTypes') as string;
    const expiresAt = formData.get('expiresAt') as string;
    const batchName = formData.get('batchName') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Parse CSV (simple parser for email,password format)
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

    const emailIndex = headers.indexOf('email');
    const passwordIndex = headers.indexOf('password');

    if (emailIndex === -1 || passwordIndex === -1) {
      return NextResponse.json(
        { error: 'CSV must have "email" and "password" columns' },
        { status: 400 }
      );
    }

    // Parse credentials from CSV
    const credentials = [];
    const validationErrors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const email = values[emailIndex];
      const password = values[passwordIndex];

      if (!email || !password) {
        validationErrors.push(`Row ${i + 1}: Missing email or password`);
        continue;
      }

      // Basic email validation
      if (!email.includes('@')) {
        validationErrors.push(`Row ${i + 1}: Invalid email format: ${email}`);
        continue;
      }

      credentials.push({ email, password });
    }

    if (credentials.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid credentials found in file',
          validationErrors
        },
        { status: 400 }
      );
    }

    // Generate batch ID
    const batchId = `BATCH-${Date.now()}`;

    // Create all credential users
    let createdCount = 0;
    let overwrittenCount = 0;

    for (const cred of credentials) {
      try {
        // Check if credential already exists in this batch
        const existing = await prisma.assessmentCredential.findUnique({
          where: {
            email_batchId: {
              email: cred.email,
              batchId
            }
          }
        });

        // Hash password
        const hashedPassword = await bcrypt.hash(cred.password, 10);

        if (existing) {
          // Update existing credential
          await prisma.assessmentCredential.update({
            where: {
              email_batchId: {
                email: cred.email,
                batchId
              }
            },
            data: {
              password: hashedPassword,
              organizationId,
              assessmentTypes: assessmentTypes || 'OCAI,BALDRIGE',
              expiresAt: new Date(expiresAt),
              batchName: batchName || null,
              isActive: true
            }
          });
          overwrittenCount++;
        } else {
          // Create new credential
          await prisma.assessmentCredential.create({
            data: {
              email: cred.email,
              password: hashedPassword,
              organizationId,
              assessmentTypes: assessmentTypes || 'OCAI,BALDRIGE',
              expiresAt: new Date(expiresAt),
              batchId,
              batchName: batchName || null,
              isActive: true,
              createdBy: userId
            }
          });
          createdCount++;
        }
      } catch (err) {
        console.error('Error creating/updating credential:', err);
        validationErrors.push(`Failed to process ${cred.email}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Return error if there were validation errors and no credentials were created
    if (validationErrors.length > 0 && createdCount === 0 && overwrittenCount === 0) {
      return NextResponse.json(
        {
          error: 'Failed to create any credentials',
          validationErrors,
          invalidCount: validationErrors.length
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${createdCount + overwrittenCount} credentials`,
      created: createdCount,
      overwritten: overwrittenCount,
      validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
      batchId
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading credentials:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload credentials' },
      { status: 500 }
    );
  }
}











