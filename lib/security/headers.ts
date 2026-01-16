import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Security headers configuration
export const SECURITY_HEADERS = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS filter
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy (restrict browser features)
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(self)',
  
  // DNS prefetch control
  'X-DNS-Prefetch-Control': 'on',
}

/**
 * Generate a cryptographically secure nonce for CSP
 */
export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Buffer.from(array).toString('base64')
}

/**
 * Content Security Policy with nonce support
 * In development, allows unsafe-inline for hot reload
 * In production, uses nonces for scripts
 */
export function getCSPHeader(nonce?: string): string {
  const isDev = process.env.NODE_ENV !== 'production'
  
  // In development, allow unsafe-inline for React hot reload and dev tools
  if (isDev) {
    return [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.mercadopago.com`,
      `style-src 'self' 'unsafe-inline'`,
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      `connect-src 'self' ws: wss: https://api.mercadopago.com https://www.mercadopago.com`,
      "frame-src 'self' https://www.mercadopago.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
  }
  
  // Production CSP with nonce (no unsafe-inline)
  const scriptSrc = nonce 
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://sdk.mercadopago.com`
    : `script-src 'self' https://sdk.mercadopago.com`
  
  const styleSrc = nonce
    ? `style-src 'self' 'nonce-${nonce}'`
    : `style-src 'self' 'unsafe-inline'` // Fallback if no nonce (Tailwind needs this or a nonce)
  
  return [
    "default-src 'self'",
    scriptSrc,
    styleSrc,
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src 'self' https://api.mercadopago.com https://www.mercadopago.com`,
    "frame-src 'self' https://www.mercadopago.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ')
}

// Apply security headers to response
export function applySecurityHeaders(response: NextResponse, nonce?: string): NextResponse {
  // Apply static headers
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }

  // Apply CSP with nonce if provided
  response.headers.set('Content-Security-Policy', getCSPHeader(nonce))

  // HSTS only in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  return response
}

// Create response with security headers
export function secureResponse(body: unknown, init?: ResponseInit, nonce?: string): NextResponse {
  const response = NextResponse.json(body, init)
  return applySecurityHeaders(response, nonce)
}
