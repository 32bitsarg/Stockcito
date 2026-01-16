"use server"

import { cookies } from 'next/headers'

// CSRF Token implementation for Server Actions
// Uses double-submit cookie pattern with cryptographically secure tokens

const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_TOKEN_LENGTH = 32

/**
 * Generate a cryptographically secure random token
 */
function generateSecureToken(length: number = CSRF_TOKEN_LENGTH): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Get or create a CSRF token for the current session
 * This is stored in an HttpOnly cookie and should be included in forms
 */
export async function getCSRFToken(): Promise<string> {
  const cookieStore = await cookies()
  const token = cookieStore.get(CSRF_COOKIE_NAME)?.value

  // Middleware should have set the cookie if it was missing.
  // We simply return what's there (or empty string if something went wrong).
  return token || ''
}

/**
 * Validate a CSRF token against the stored cookie
 * Uses timing-safe comparison to prevent timing attacks
 */
export async function validateCSRFToken(token: string | null | undefined): Promise<boolean> {
  if (!token) return false

  const cookieStore = await cookies()
  const storedToken = cookieStore.get(CSRF_COOKIE_NAME)?.value

  if (!storedToken) return false

  // Timing-safe comparison
  if (token.length !== storedToken.length) return false

  let result = 0
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i)
  }

  return result === 0
}

/**
 * Regenerate CSRF token (e.g., after login)
 */
export async function regenerateCSRFToken(): Promise<string> {
  const cookieStore = await cookies()
  const token = generateSecureToken()

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24,
  })

  return token
}

/**
 * Server action wrapper that validates CSRF token
 * Use this to protect server actions from CSRF attacks
 */
export async function withCSRFProtection<T>(
  token: string | null | undefined,
  action: () => Promise<T>
): Promise<T | { success: false; error: string }> {
  const isValid = await validateCSRFToken(token)

  if (!isValid) {
    return { success: false, error: 'Token de seguridad inválido. Recarga la página.' }
  }

  return action()
}
