import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    const accessKeys = await prisma.accessKey.findMany({
      where: { organizationId },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ accessKeys })
  } catch (error) {
    console.error('Error fetching facilitator access keys:', error)
    return NextResponse.json(
      { error: 'Failed to fetch access keys' },
      { status: 500 }
    )
  }
}
