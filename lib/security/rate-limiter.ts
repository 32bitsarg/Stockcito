// Rate limiter for API and auth endpoints
// Supports both in-memory store (for Electron/dev) and Redis (for production)

import { db } from '@/lib/db'

import { securityLogger } from '@/lib/logger'
interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store (fallback for Electron and development)
const memoryStore = new Map<string, RateLimitEntry>()

// Account lockout tracking (in-memory for development)
const lockoutStore = new Map<string, { attempts: number; lockedUntil: number | null }>()

// Clean up expired entries periodically (memory store)
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.resetAt < now) {
      memoryStore.delete(key)
    }
  }
  // Clean expired lockouts
  for (const [key, entry] of lockoutStore.entries()) {
    if (entry.lockedUntil && entry.lockedUntil < now) {
      lockoutStore.delete(key)
    }
  }
}, 60000) // Every minute

export interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
}

export const RATE_LIMIT_CONFIGS = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 min
  register: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  api: { maxAttempts: 100, windowMs: 60 * 60 * 1000 }, // 100 per hour
  passwordReset: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
} as const

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetIn: number // seconds
}

// Check if Redis is configured
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const USE_REDIS = !!(REDIS_URL && REDIS_TOKEN)

// Redis rate limit check (for production with multiple instances)
async function checkRateLimitRedis(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  try {
    const response = await fetch(`${REDIS_URL}/incr/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REDIS_TOKEN}`,
      },
    })
    
    const data = await response.json()
    const count = data.result as number
    
    // Set expiry on first request
    if (count === 1) {
      await fetch(`${REDIS_URL}/expire/${encodeURIComponent(key)}/${Math.ceil(config.windowMs / 1000)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REDIS_TOKEN}`,
        },
      })
    }
    
    // Get TTL for resetIn
    const ttlResponse = await fetch(`${REDIS_URL}/ttl/${encodeURIComponent(key)}`, {
      headers: {
        'Authorization': `Bearer ${REDIS_TOKEN}`,
      },
    })
    const ttlData = await ttlResponse.json()
    const ttl = ttlData.result as number
    
    return {
      allowed: count <= config.maxAttempts,
      remaining: Math.max(0, config.maxAttempts - count),
      resetIn: ttl > 0 ? ttl : Math.ceil(config.windowMs / 1000)
    }
  } catch (error) {
    securityLogger.error('Redis rate limit error, falling back to memory:', error)
    // Fallback to memory store on Redis error
    return checkRateLimitMemory(key, config)
  }
}

// Memory rate limit check (for Electron and development)
function checkRateLimitMemory(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const entry = memoryStore.get(key)

  // No entry or expired
  if (!entry || entry.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + config.windowMs })
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetIn: Math.ceil(config.windowMs / 1000)
    }
  }

  // Check if limit exceeded
  if (entry.count >= config.maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetAt - now) / 1000)
    }
  }

  // Increment count
  entry.count++
  memoryStore.set(key, entry)

  return {
    allowed: true,
    remaining: config.maxAttempts - entry.count,
    resetIn: Math.ceil((entry.resetAt - now) / 1000)
  }
}

// Main rate limit function - uses Redis in production if configured
export async function checkRateLimitAsync(identifier: string, type: RateLimitType): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIGS[type]
  const key = `ratelimit:${type}:${identifier}`
  
  if (USE_REDIS) {
    return checkRateLimitRedis(key, config)
  }
  
  return checkRateLimitMemory(key, config)
}

// Synchronous version for backwards compatibility (uses memory store only)
export function checkRateLimit(identifier: string, type: RateLimitType): RateLimitResult {
  const config = RATE_LIMIT_CONFIGS[type]
  const key = `ratelimit:${type}:${identifier}`
  return checkRateLimitMemory(key, config)
}

// Reset rate limit (e.g., after successful login)
export async function resetRateLimitAsync(identifier: string, type: RateLimitType): Promise<void> {
  const key = `ratelimit:${type}:${identifier}`
  
  // Always reset memory store
  memoryStore.delete(key)
  
  // Also reset Redis if configured
  if (USE_REDIS) {
    try {
      await fetch(`${REDIS_URL}/del/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REDIS_TOKEN}`,
        },
      })
    } catch (error) {
      securityLogger.error('Redis reset error:', error)
    }
  }
}

// Synchronous version for backwards compatibility
export function resetRateLimit(identifier: string, type: RateLimitType): void {
  const key = `ratelimit:${type}:${identifier}`
  memoryStore.delete(key)
}

// Get IP from headers (works with Next.js and proxies)
export function getClientIP(headers: Headers): string {
  // Check various headers in order of preference
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  const cfConnectingIP = headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  return 'unknown'
}

// ==========================================
// ACCOUNT LOCKOUT (Brute Force Protection)
// ==========================================

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

export interface AccountLockoutResult {
  locked: boolean
  remainingAttempts: number
  lockedUntil: Date | null
  message?: string
}

/**
 * Record a failed login attempt for a user account
 * After MAX_FAILED_ATTEMPTS, the account is locked for LOCKOUT_DURATION_MS
 */
export async function recordFailedLogin(userId: number): Promise<AccountLockoutResult> {
  const now = Date.now()
  
  // Try to use database for persistence
  try {
    // Update failed attempts in database
    const user = await db.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: { increment: 1 },
        lastFailedLogin: new Date(),
      },
      select: {
        failedLoginAttempts: true,
        lockedUntil: true,
      }
    })
    
    const attempts = user.failedLoginAttempts || 0
    
    // Check if should lock account
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      const lockUntil = new Date(now + LOCKOUT_DURATION_MS)
      await db.user.update({
        where: { id: userId },
        data: { lockedUntil: lockUntil }
      })
      
      return {
        locked: true,
        remainingAttempts: 0,
        lockedUntil: lockUntil,
        message: `Cuenta bloqueada por ${LOCKOUT_DURATION_MS / 60000} minutos debido a múltiples intentos fallidos`
      }
    }
    
    return {
      locked: false,
      remainingAttempts: MAX_FAILED_ATTEMPTS - attempts,
      lockedUntil: null
    }
  } catch {
    // Fallback to memory store if DB fails
    const key = `lockout:user:${userId}`
    const entry = lockoutStore.get(key) || { attempts: 0, lockedUntil: null }
    
    entry.attempts++
    
    if (entry.attempts >= MAX_FAILED_ATTEMPTS) {
      entry.lockedUntil = now + LOCKOUT_DURATION_MS
      lockoutStore.set(key, entry)
      return {
        locked: true,
        remainingAttempts: 0,
        lockedUntil: new Date(entry.lockedUntil),
        message: `Cuenta bloqueada por ${LOCKOUT_DURATION_MS / 60000} minutos`
      }
    }
    
    lockoutStore.set(key, entry)
    return {
      locked: false,
      remainingAttempts: MAX_FAILED_ATTEMPTS - entry.attempts,
      lockedUntil: null
    }
  }
}

/**
 * Check if an account is currently locked
 */
export async function isAccountLocked(userId: number): Promise<AccountLockoutResult> {
  const now = Date.now()
  
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        failedLoginAttempts: true,
        lockedUntil: true,
      }
    })
    
    if (!user) {
      return { locked: false, remainingAttempts: MAX_FAILED_ATTEMPTS, lockedUntil: null }
    }
    
    // Check if lock has expired
    if (user.lockedUntil) {
      if (new Date(user.lockedUntil) > new Date(now)) {
        return {
          locked: true,
          remainingAttempts: 0,
          lockedUntil: new Date(user.lockedUntil),
          message: 'Cuenta temporalmente bloqueada. Intenta más tarde.'
        }
      }
      
      // Lock expired, reset
      await db.user.update({
        where: { id: userId },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        }
      })
    }
    
    const attempts = user.failedLoginAttempts || 0
    return {
      locked: false,
      remainingAttempts: MAX_FAILED_ATTEMPTS - attempts,
      lockedUntil: null
    }
  } catch {
    // Fallback to memory
    const key = `lockout:user:${userId}`
    const entry = lockoutStore.get(key)
    
    if (!entry) {
      return { locked: false, remainingAttempts: MAX_FAILED_ATTEMPTS, lockedUntil: null }
    }
    
    if (entry.lockedUntil && entry.lockedUntil > now) {
      return {
        locked: true,
        remainingAttempts: 0,
        lockedUntil: new Date(entry.lockedUntil),
        message: 'Cuenta temporalmente bloqueada'
      }
    }
    
    // Expired
    if (entry.lockedUntil && entry.lockedUntil <= now) {
      lockoutStore.delete(key)
      return { locked: false, remainingAttempts: MAX_FAILED_ATTEMPTS, lockedUntil: null }
    }
    
    return {
      locked: false,
      remainingAttempts: MAX_FAILED_ATTEMPTS - entry.attempts,
      lockedUntil: null
    }
  }
}

/**
 * Reset failed login attempts after successful login
 */
export async function resetFailedLogins(userId: number): Promise<void> {
  try {
    await db.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastFailedLogin: null,
      }
    })
  } catch {
    // Fallback to memory
    const key = `lockout:user:${userId}`
    lockoutStore.delete(key)
  }
}

