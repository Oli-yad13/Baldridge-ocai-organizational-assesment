import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100')
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') // 15 minutes
const IP_HASH_SALT = process.env.IP_HASH_SALT || 'default-salt'

// In-memory rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function hashIP(ip: string): string {
  return bcrypt.hashSync(ip, 10) // Use rounds instead of salt string
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  // For Vercel and other platforms, try to get IP from headers
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  return 'unknown'
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = `rate_limit:${ip}`
  
  const current = rateLimitStore.get(key)
  
  if (!current || now > current.resetTime) {
    // Reset or create new entry
    const resetTime = now + RATE_LIMIT_WINDOW_MS
    rateLimitStore.set(key, { count: 1, resetTime })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetTime }
  }
  
  if (current.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime }
  }
  
  // Increment count
  current.count++
  rateLimitStore.set(key, current)
  
  return { 
    allowed: true, 
    remaining: RATE_LIMIT_MAX - current.count, 
    resetTime: current.resetTime 
  }
}

export function cleanupRateLimitStore() {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Clean up expired entries every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
