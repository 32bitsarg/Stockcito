import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me')

// Public routes that don't require authentication
// Note: '/' (landing) is handled separately with exact match only
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/setup',
  '/docs',
  '/offline',
  '/api/health',
  '/api/webhooks/mercadopago'
]

// Exact match only routes (no subpaths allowed)
const EXACT_PUBLIC_PATHS = [
  '/'
]

// Admin-only routes
const ADMIN_PATHS = [
  '/users',
  '/users/new',
  '/users/audit'
]

// Premium-only routes (require active premium subscription or trial)
const PREMIUM_PATHS = [
  '/suppliers',
  '/users/audit'
]

// Security headers
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
}

async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch {
    return null
  }
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }
  
  // HSTS only in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  return response
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next()
  }

  // Allow exact match public routes (like landing page)
  if (EXACT_PUBLIC_PATHS.includes(pathname)) {
    const response = NextResponse.next()
    return applySecurityHeaders(response)
  }

  // Allow public routes and their subpaths
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    const response = NextResponse.next()
    return applySecurityHeaders(response)
  }

  // Allow webhook routes without auth
  if (pathname.startsWith('/api/webhooks/')) {
    return NextResponse.next()
  }

  // Get session token
  const token = req.cookies.get('session')?.value
  
  if (!token) {
    // Redirect to login with return URL
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify token
  const payload = await verifyJWT(token)
  
  if (!payload) {
    // Invalid token, clear and redirect
    const loginUrl = new URL('/login', req.url)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('session')
    return response
  }

  // Check admin-only routes
  if (ADMIN_PATHS.some(p => pathname.startsWith(p))) {
    if (payload.role !== 'admin') {
      const response = NextResponse.redirect(new URL('/dashboard', req.url))
      return applySecurityHeaders(response)
    }
  }

  // Check premium-only routes
  if (PREMIUM_PATHS.some(p => pathname.startsWith(p))) {
    // Premium check is done via headers - server components will verify
    // This allows showing upgrade prompts instead of hard redirects
  }

  // Add user info to headers for server components
  const response = NextResponse.next()
  response.headers.set('x-user-id', String(payload.userId))
  response.headers.set('x-user-role', String(payload.role))
  if (payload.organizationId) {
    response.headers.set('x-organization-id', String(payload.organizationId))
  }
  
  return applySecurityHeaders(response)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|sw.js|manifest.json).*)',
  ]
}
