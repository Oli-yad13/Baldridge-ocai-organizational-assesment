import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest } from 'next/server'

const handler = NextAuth(authOptions)

export async function GET(req: NextRequest, context: any) {
  try {
    return await handler(req, context)
  } catch (error) {
    console.error('[NextAuth GET Error]:', error)
    return new Response(JSON.stringify({ error: 'Authentication error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function POST(req: NextRequest, context: any) {
  try {
    return await handler(req, context)
  } catch (error) {
    console.error('[NextAuth POST Error]:', error)
    return new Response(JSON.stringify({ error: 'Authentication error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
