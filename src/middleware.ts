import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/error',
    '/api/auth/',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/help',
  ]

  // Check if the current path is public
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow all authenticated routes - auth is handled client-side with localStorage
  // This includes: /admin, /facilitator, /employee, /dashboard, /surveys, /reports, /workshops
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/facilitator') ||
    pathname.startsWith('/employee') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/surveys') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/workshops') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next()
  }

  // For any other routes, allow them (backward compatibility)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}