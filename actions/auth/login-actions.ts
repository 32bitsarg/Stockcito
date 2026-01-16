"use server"

import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { signToken } from '@/lib/jwt'
import { cookies, headers } from 'next/headers'
import { z } from 'zod'
import {
  checkRateLimit,
  resetRateLimit,
  getClientIP,
  isAccountLocked,
  recordFailedLogin,
  resetFailedLogins
} from '@/lib/security/rate-limiter'
import { sanitizeEmail } from '@/lib/security/sanitizer'
import { logAudit } from './audit-actions'
import { logError } from '@/lib/logger'
import { validateCSRFToken } from '@/lib/security/csrf'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  csrfToken: z.string().optional()
})

const loginPinSchema = z.object({
  email: z.string().email(),
  pin: z.string().min(4).max(6),
  csrfToken: z.string().optional()
})

// Rate limiting for business code attempts (10 per hour per code)
const businessCodeAttempts = new Map<string, { count: number; resetAt: Date }>()

function checkBusinessCodeRateLimit(code: string): { allowed: boolean; remaining: number } {
  const now = new Date()
  const existing = businessCodeAttempts.get(code)

  if (!existing || now > existing.resetAt) {
    businessCodeAttempts.set(code, { count: 1, resetAt: new Date(now.getTime() + 60 * 60 * 1000) })
    return { allowed: true, remaining: 9 }
  }

  if (existing.count >= 10) {
    return { allowed: false, remaining: 0 }
  }

  existing.count++
  return { allowed: true, remaining: 10 - existing.count }
}

function resetBusinessCodeRateLimit(code: string) {
  businessCodeAttempts.delete(code)
}

export async function loginUser(data: z.infer<typeof loginSchema>) {
  try {
    const result = loginSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten().fieldErrors }

    // Validate CSRF
    const csrfValid = await validateCSRFToken(result.data.csrfToken)
    if (!csrfValid) {
      logError('CSRF Validation Failed', undefined, { action: 'loginUser', email: result.data.email })
      return { error: 'Error de seguridad (CSRF). Recarga la página.' }
    }

    const headersList = await headers()
    const ip = getClientIP(headersList)

    // Rate limiting by IP
    const rateCheck = checkRateLimit(ip, 'login')
    if (!rateCheck.allowed) {
      return { error: `Demasiados intentos. Intenta de nuevo en ${Math.ceil(rateCheck.resetIn / 60)} minutos.` }
    }

    const { email, password } = result.data
    const sanitizedEmail = sanitizeEmail(email)

    const user = await db.user.findUnique({
      where: { email: sanitizedEmail },
      include: { organization: true }
    })

    if (!user) return { error: 'Credenciales inválidas' }

    // Check if account is locked due to failed attempts
    const lockStatus = await isAccountLocked(user.id)
    if (lockStatus.locked) {
      return { error: lockStatus.message || 'Cuenta temporalmente bloqueada. Intenta más tarde.' }
    }

    // Check if user is active
    if (!user.active) {
      return { error: 'Usuario desactivado. Contacte al administrador.' }
    }

    const ok = await verifyPassword(user.password, password)
    if (!ok) {
      // Record failed attempt
      const lockResult = await recordFailedLogin(user.id)
      if (lockResult.locked) {
        return { error: lockResult.message }
      }
      return {
        error: `Credenciales inválidas. ${lockResult.remainingAttempts} intentos restantes.`
      }
    }

    // Reset rate limit and failed logins on successful login
    resetRateLimit(ip, 'login')
    await resetFailedLogins(user.id)
    resetRateLimit(ip, 'login')

    // Update organization's lastVerifiedAt for Electron offline mode
    if (user.organizationId) {
      await db.organization.update({
        where: { id: user.organizationId },
        data: { lastVerifiedAt: new Date() }
      })
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      organizationId: user.organizationId || undefined
    })
    const cookieStore = await cookies()
    cookieStore.set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    // Log successful login
    await logAudit(user.id, "login", "user", user.id, "Inicio de sesión exitoso", ip, user.organizationId)

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        plan: user.organization?.plan,
        planStatus: user.organization?.planStatus
      }
    }
  } catch (err) {
    logError('Login error', err, { action: 'loginUser', email: data.email })
    return { error: 'Ocurrió un error inesperado al iniciar sesión' }
  }
}

export async function loginWithPin(data: z.infer<typeof loginPinSchema>) {
  try {
    const result = loginPinSchema.safeParse(data)
    if (!result.success) return { error: 'Datos inválidos' }

    // Validate CSRF
    const csrfValid = await validateCSRFToken(result.data.csrfToken)
    if (!csrfValid) {
      logError('CSRF Validation Failed', undefined, { action: 'loginWithPin', email: result.data.email })
      return { error: 'Error de seguridad (CSRF). Recarga la página.' }
    }

    const headersList = await headers()
    const ip = getClientIP(headersList)

    // Rate limiting
    const rateCheck = checkRateLimit(ip, 'login')
    if (!rateCheck.allowed) {
      return { error: `Demasiados intentos. Intenta de nuevo en ${Math.ceil(rateCheck.resetIn / 60)} minutos.` }
    }

    const { email, pin } = result.data
    const sanitizedEmail = sanitizeEmail(email)

    const user = await db.user.findUnique({
      where: { email: sanitizedEmail },
      include: { organization: true }
    })

    if (!user) return { error: 'Credenciales inválidas' }

    // Check if user is active
    if (!user.active) {
      return { error: 'Usuario desactivado. Contacte al administrador.' }
    }

    // Check if user has PIN configured
    if (!user.pin) {
      return { error: 'Este usuario no tiene PIN configurado. Use contraseña.' }
    }

    const ok = await verifyPassword(user.pin, pin)
    if (!ok) return { error: 'PIN incorrecto' }

    // Reset rate limit on successful login
    resetRateLimit(ip, 'login')

    // Update organization's lastVerifiedAt
    if (user.organizationId) {
      await db.organization.update({
        where: { id: user.organizationId },
        data: { lastVerifiedAt: new Date() }
      })
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      organizationId: user.organizationId || undefined
    })
    const cookieStore = await cookies()
    cookieStore.set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    // Log successful login
    await logAudit(user.id, "login_pin", "user", user.id, "Inicio de sesión con PIN", ip, user.organizationId)

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        plan: user.organization?.plan,
        planStatus: user.organization?.planStatus
      }
    }
  } catch (err) {
    logError('Login PIN error', err, { action: 'loginWithPin', email: data.email })
    return { error: 'Ocurrió un error inesperado' }
  }
}

// Get employees for business code login (employee list)
export async function getEmployeesForBusinessCode(code: string): Promise<{
  success: boolean
  error?: string
  employees?: { id: number; name: string; hasPin: boolean; hasPassword: boolean }[]
  businessName?: string
}> {
  // Validate format
  const pattern = /^[A-Z]{3}-\d{4}-[A-Z0-9]{2}$/
  if (!pattern.test(code.toUpperCase())) {
    return { success: false, error: 'Formato de código inválido' }
  }

  // Check rate limit
  const rateCheck = checkBusinessCodeRateLimit(code.toUpperCase())
  if (!rateCheck.allowed) {
    return { success: false, error: 'Demasiados intentos. Intenta de nuevo en 1 hora.' }
  }

  // Find organization
  const organization = await db.organization.findUnique({
    where: { businessCode: code.toUpperCase() },
    select: { id: true, name: true }
  })

  if (!organization) {
    return { success: false, error: 'Código de negocio no encontrado' }
  }

  // Get active employees with PIN or password (excluding owner)
  const users = await db.user.findMany({
    where: {
      organizationId: organization.id,
      active: true,
      role: { not: 'owner' }
    },
    select: {
      id: true,
      name: true,
      pin: true,
      password: true
    },
    orderBy: { name: 'asc' }
  })

  // Filter users that have at least PIN or password
  const filteredUsers = users.filter(u => u.pin || u.password)

  // Map to return hasPin and hasPassword without exposing actual values
  const employees = filteredUsers.map(u => ({
    id: u.id,
    name: u.name,
    hasPin: !!u.pin,
    hasPassword: !!u.password
  }))

  return {
    success: true,
    employees,
    businessName: organization.name
  }
}

// Login with business code + user selection + PIN or Password
export async function loginWithBusinessCode(data: {
  businessCode: string
  userId: number
  credential: string
  method: 'pin' | 'password',
  csrfToken?: string
}): Promise<{ success: boolean; error?: string; user?: any }> {
  try {
    const { businessCode, userId, credential, method, csrfToken } = data

    // Validate CSRF
    const csrfValid = await validateCSRFToken(csrfToken)
    if (!csrfValid) {
      logError('CSRF Validation Failed', undefined, { action: 'loginWithBusinessCode', businessCode })
      return { success: false, error: 'Error de seguridad (CSRF). Recarga la página.' }
    }

    const headersList = await headers()
    const ip = getClientIP(headersList)

    // Rate limit check
    const rateCheck = checkBusinessCodeRateLimit(businessCode.toUpperCase())
    if (!rateCheck.allowed) {
      return { success: false, error: 'Demasiados intentos. Intenta de nuevo en 1 hora.' }
    }

    // Find organization
    const organization = await db.organization.findUnique({
      where: { businessCode: businessCode.toUpperCase() },
      select: { id: true, name: true }
    })

    if (!organization) {
      return { success: false, error: 'Código de negocio inválido' }
    }

    // Find user in this organization
    const user = await db.user.findFirst({
      where: {
        id: userId,
        organizationId: organization.id,
        active: true
      },
      include: { organization: true }
    })

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    // Verify credential based on method
    let credentialValid = false

    if (method === 'pin') {
      if (!user.pin) {
        return { success: false, error: 'Este usuario no tiene PIN configurado' }
      }
      credentialValid = await verifyPassword(user.pin, credential)
      if (!credentialValid) {
        return { success: false, error: 'PIN incorrecto' }
      }
    } else {
      if (!user.password) {
        return { success: false, error: 'Este usuario no tiene contraseña configurada' }
      }
      credentialValid = await verifyPassword(user.password, credential)
      if (!credentialValid) {
        return { success: false, error: 'Contraseña incorrecta' }
      }
    }

    // Reset rate limit on success
    resetBusinessCodeRateLimit(businessCode.toUpperCase())

    // Update organization's lastVerifiedAt
    await db.organization.update({
      where: { id: organization.id },
      data: { lastVerifiedAt: new Date() }
    })

    // Create session
    const token = signToken({
      userId: user.id,
      role: user.role,
      organizationId: organization.id
    })

    const cookieStore = await cookies()
    cookieStore.set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    // Log successful login
    await logAudit(user.id, "login_business_code", "user", user.id,
      `Inicio de sesión con código de negocio: ${businessCode}`, ip, organization.id)

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        organizationId: organization.id
      }
    }
  } catch (err) {
    logError('Business Login error', err, { action: 'loginWithBusinessCode', code: data.businessCode })
    return { success: false, error: 'Error inesperado' }
  }
}
