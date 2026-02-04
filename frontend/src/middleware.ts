import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = ['/login', '/forgot-password', '/reset-password', '/verify-email']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // If trying to access login while already authenticated, redirect to dashboard
    if (pathname.startsWith('/login')) {
      // Check for token in cookies (or localStorage via request headers)
      const token = request.cookies.get('accessToken')?.value
      
      if (token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    return NextResponse.next()
  }
  
  // For protected routes, check authentication
  const token = request.cookies.get('accessToken')?.value
  
  // If no token, redirect to login with redirect URL
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Token exists, allow access
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}