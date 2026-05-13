import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Lazy Prisma client - only create when actually accessed
let _prismaInstance: PrismaClient | undefined

function getPrismaClient(): PrismaClient {
  // Return existing instance if available
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }
  if (_prismaInstance) {
    return _prismaInstance
  }
  
  // Only create client when actually needed (not during build/import)
  _prismaInstance = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  })

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = _prismaInstance
  }
  
  return _prismaInstance
}

// Export prisma with lazy initialization using Proxy
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    const client = getPrismaClient()
    const value = (client as any)[prop]
    // If it's a function, bind it to the client
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
}) as PrismaClient

// Connection state
let isConnected = false
let connectionPromise: Promise<void> | null = null

// Ensure proper connection handling (lazy connection - only connect when needed)
export async function ensurePrismaConnected() {
  // If already connected, return immediately
  if (isConnected) {
    return
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise
  }

  // Start new connection
  connectionPromise = (async () => {
  try {
    await prisma.$connect()
      isConnected = true
      console.log('[Prisma] Connected to database')
  } catch (error) {
    console.error('[Prisma] Connection error:', error)
      isConnected = false
    // Try to disconnect and reconnect
    try {
      await prisma.$disconnect()
      await prisma.$connect()
        isConnected = true
        console.log('[Prisma] Reconnected to database')
    } catch (retryError) {
      console.error('[Prisma] Reconnection failed:', retryError)
        isConnected = false
        throw retryError
  }
    } finally {
      connectionPromise = null
    }
  })()

  return connectionPromise
}

// Don't connect on startup - connect lazily when first query is made
// This prevents blocking the server startup

// Handle cleanup
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    try {
    await prisma.$disconnect()
    } catch (error) {
      console.error('[Prisma] Error disconnecting:', error)
    }
  })
}
