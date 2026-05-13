import { DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      organizationId: string | null
      organization?: {
        id: string
        name: string
        industry?: string | null
        size?: string | null
        country?: string | null
        logoUrl?: string | null
        settings?: any
      } | null
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: string
    organizationId: string | null
    organization?: {
      id: string
      name: string
      industry?: string | null
      size?: string | null
      country?: string | null
      logoUrl?: string | null
      settings?: any
    } | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    organizationId: string | null
    organization?: {
      id: string
      name: string
      industry?: string | null
      size?: string | null
      country?: string | null
      logoUrl?: string | null
      settings?: any
    } | null
  }
}
