import { type NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/listings/new',
  '/orders',
  '/wallet',
  '/bnpl',
  '/intelligence',
  '/profile',
  '/settings',
  '/notifications',
  '/admin',
  '/farmer',
  '/dealer',
  '/buyer',
  '/consumer',
  '/field-agent',
  '/pledges',
]

// Routes only accessible when NOT logged in
const GUEST_ONLY_PREFIXES = ['/login', '/onboarding']

// Role → home path mapping (used for post-login redirect)
const ROLE_HOME: Record<string, string> = {
  farmer:      '/dashboard',
  dealer:      '/dealer/dashboard',
  buyer:       '/buyer/dashboard',
  consumer:    '/consumer',
  field_agent: '/field-agent/dashboard',
  admin:       '/admin/dashboard',
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token =
    request.cookies.get('sb-access-token')?.value ??
    request.cookies.get('supabase-auth-token')?.value

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  const isGuestOnly = GUEST_ONLY_PREFIXES.some(p => pathname.startsWith(p))

  // Redirect unauthenticated users trying to access protected pages
  if (isProtected && !token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login/onboarding
  if (isGuestOnly && token) {
    // Try to get role from a cookie set at login time; fall back to /dashboard
    const role     = request.cookies.get('agro_role')?.value ?? ''
    const homePath = ROLE_HOME[role] ?? '/dashboard'
    return NextResponse.redirect(new URL(homePath, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|images|manifest.json|sw.js|workbox-.*).*)'],
}
