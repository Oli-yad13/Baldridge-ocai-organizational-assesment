import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('[Credential Login API] Starting POST request');
    const body = await request.json()
    const { email, password } = body

    console.log('[Credential Login API] Login attempt for email:', email);

    if (!email || !password) {
      console.log('[Credential Login API] Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find active credential
    console.log('[Credential Login API] Looking up credential...');
    const credential = await prisma.assessmentCredential.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        isActive: true
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      }
    })
    
    console.log('[Credential Login API] Credential found:', !!credential);

    if (!credential) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if expired
    if (new Date() > new Date(credential.expiresAt)) {
      return NextResponse.json(
        { error: 'Credential has expired' },
        { status: 401 }
      )
    }

    // Check if organization is active
    if (!credential.organization.isActive) {
      return NextResponse.json(
        { error: 'Organization is not active' },
        { status: 403 }
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, credential.password)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Update last used and login count
    await prisma.assessmentCredential.update({
      where: { id: credential.id },
      data: {
        lastUsedAt: new Date(),
        loginCount: credential.loginCount + 1
      }
    })

    // Create or find user record for this credential
    let user = await prisma.user.findFirst({
      where: {
        email: credential.email,
        organizationId: credential.organizationId
      }
    })

    if (!user) {
      // Create a new user record for this credential
      user = await prisma.user.create({
        data: {
          name: credential.email.split('@')[0], // Use email prefix as name
          email: credential.email,
          role: 'EMPLOYEE',
          organizationId: credential.organizationId,
          accessKeyUsed: `CREDENTIAL_${credential.id}` // Mark as credential-based
        }
      })
    }

    // Parse assessment types
    const assessmentTypes = credential.assessmentTypes.split(',').map(t => t.trim())

    const redirectUrl = assessmentTypes.length === 1 
      ? `/assessments/${assessmentTypes[0].toLowerCase()}`
      : '/employee/assessments'

    // Return success with user info
    return NextResponse.json({
      success: true,
      user: {
        id: user.id, // Now we have a proper user ID
        email: credential.email,
        name: user.name,
        credentialId: credential.id,
        organizationId: credential.organizationId,
        organizationName: credential.organization.name,
        assessmentTypes,
        expiresAt: credential.expiresAt,
        role: 'CREDENTIAL_USER' // Special role for credential-based auth
      },
      redirectUrl
    })

  } catch (error) {
    console.error('[Credential Login API] ERROR:', error)
    console.error('[Credential Login API] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Login failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

