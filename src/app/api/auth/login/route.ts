import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials, getRedirectUrl } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    console.log('[Auth Login API] Starting POST request');
    const { email, password } = await request.json()

    console.log('[Auth Login API] Login attempt for email:', email);

    if (!email || !password) {
      console.log('[Auth Login API] Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate credentials
    console.log('[Auth Login API] Validating credentials...');
    const user = await validateCredentials(email, password)

    if (!user) {
      console.log('[Auth Login API] Invalid credentials');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('[Auth Login API] User validated:', user.id);

    // Get redirect URL based on role
    const redirectUrl = getRedirectUrl(user.role, user.organizationId)

    console.log('[Auth Login API] Login successful, redirecting to:', redirectUrl);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        organization: user.organization,
      },
      redirectUrl,
    })
  } catch (error) {
    console.error('[Auth Login API] ERROR:', error)
    console.error('[Auth Login API] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'An error occurred during login', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
