import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

/**
 * Validate user credentials (Admin/Facilitator)
 */
export async function validateCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { organization: true },
  })

  if (!user || !user.password) {
    return null
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return null
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    organization: user.organization,
  }
}

/**
 * Validate access key and get organization info (Employee)
 */
export async function validateAccessKey(key: string) {
  const accessKey = await prisma.accessKey.findUnique({
    where: { key },
    include: { organization: true },
  })

  if (!accessKey) {
    return { valid: false, error: 'Invalid access key' }
  }

  // Check if key is active
  if (!accessKey.isActive) {
    return { valid: false, error: 'This access key has been deactivated' }
  }

  // Check if key has expired
  if (accessKey.expiresAt && new Date() > accessKey.expiresAt) {
    return { valid: false, error: 'This access key has expired' }
  }

  // Check usage limits
  if (accessKey.maxUses && accessKey.usageCount >= accessKey.maxUses) {
    return { valid: false, error: 'This access key has reached its usage limit' }
  }

  // Check if organization is active
  if (!accessKey.organization.isActive) {
    return { valid: false, error: 'Organization is not active' }
  }

  // Increment usage count
  await prisma.accessKey.update({
    where: { id: accessKey.id },
    data: { usageCount: accessKey.usageCount + 1 },
  })

  // Parse assessment types
  const assessmentTypes = accessKey.assessmentTypes
    .split(',')
    .map(t => t.trim())
    .filter(t => t)

  return {
    valid: true,
    accessKey: {
      id: accessKey.id,
      key: accessKey.key,
      assessmentTypes,
    },
    organization: {
      id: accessKey.organization.id,
      name: accessKey.organization.name,
      logoUrl: accessKey.organization.logoUrl,
      primaryColor: accessKey.organization.primaryColor,
    },
  }
}

/**
 * Create temporary employee user session
 */
export async function createEmployeeSession(organizationId: string, accessKey: string, name?: string) {
  // Create a temporary employee user
  const user = await prisma.user.create({
    data: {
      name: name || `Employee-${Date.now()}`,
      email: null,
      role: 'EMPLOYEE',
      organizationId,
      accessKeyUsed: accessKey,
    },
  })

  return {
    id: user.id,
    name: user.name,
    role: user.role,
    organizationId: user.organizationId,
    accessKeyUsed: user.accessKeyUsed,
  }
}

/**
 * Get user by ID with organization
 */
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true },
  })

  if (!user) {
    return null
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    organization: user.organization,
    accessKeyUsed: user.accessKeyUsed,
  }
}

/**
 * Get redirect URL based on user role
 */
export function getRedirectUrl(role: string, organizationId?: string | null) {
  switch (role) {
    case 'SYSTEM_ADMIN':
      return '/admin/dashboard'
    case 'FACILITATOR':
      return `/facilitator/dashboard?orgId=${organizationId}`
    case 'EMPLOYEE':
      return `/employee/assessments?orgId=${organizationId}`
    default:
      return '/dashboard'
  }
}
