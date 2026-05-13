import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/get-user-id'
import bcrypt from 'bcryptjs'

// GET all users
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const userId = await getUserId(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user || user.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Only admins can view users' },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const userId = await getUserId(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!currentUser || currentUser.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Only admins can create users' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      email,
      password,
      role,
      organizationId,
    } = body

    if (!name || !role) {
      return NextResponse.json(
        { error: 'Name and role are required' },
        { status: 400 }
      )
    }

    // Validate role-specific requirements
    if ((role === 'SYSTEM_ADMIN' || role === 'FACILITATOR') && (!email || !password)) {
      return NextResponse.json(
        { error: 'Email and password are required for Admin and Facilitator roles' },
        { status: 400 }
      )
    }

    if (role === 'FACILITATOR' && !organizationId) {
      return NextResponse.json(
        { error: 'Organization is required for Facilitator role' },
        { status: 400 }
      )
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    // Hash password if provided
    let hashedPassword = null
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10)
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email || null,
        password: hashedPassword,
        role,
        organizationId: organizationId || null,
      },
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
