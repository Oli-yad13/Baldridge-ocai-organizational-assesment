import { NextRequest, NextResponse } from 'next/server'
import { validateAccessKey, createEmployeeSession, getRedirectUrl } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const { accessKey, name } = await request.json()

    if (!accessKey) {
      return NextResponse.json(
        { error: 'Access key is required' },
        { status: 400 }
      )
    }

    // Validate access key
    const validation = await validateAccessKey(accessKey)

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 401 }
      )
    }

    // Create employee session
    const user = await createEmployeeSession(
      validation.organization!.id,
      accessKey,
      name
    )

    // Get redirect URL
    const redirectUrl = getRedirectUrl(user.role, user.organizationId)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        accessKeyUsed: user.accessKeyUsed,
      },
      organization: validation.organization,
      assessmentTypes: validation.accessKey!.assessmentTypes,
      redirectUrl,
    })
  } catch (error) {
    console.error('Access key validation error:', error)
    return NextResponse.json(
      { error: 'An error occurred during validation' },
      { status: 500 }
    )
  }
}
