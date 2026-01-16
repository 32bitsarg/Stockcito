import { z } from 'zod'

// Environment variables validation schema
// This ensures all required env vars are present and correctly formatted

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Auth
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  
  // App URLs
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),

  // Email (optional for development)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional().default('us-east-1'),
  EMAIL_FROM: z.string().email().optional().default('noreply@stockcito.com'),

  // MercadoPago (optional for development)
  MERCADOPAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADOPAGO_PUBLIC_KEY: z.string().optional(),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().optional(),

  // Redis (optional - falls back to memory)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// Type for validated environment
export type Env = z.infer<typeof envSchema>

// Singleton to cache validated env
let validatedEnv: Env | null = null

/**
 * Validate environment variables at startup
 * Call this early in app initialization
 */
export function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv
  }

  try {
    validatedEnv = envSchema.parse(process.env)
    return validatedEnv
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((e: z.ZodIssue) => `  - ${e.path.join('.')}: ${e.message}`)
      console.error('\n❌ Environment validation failed:\n' + missingVars.join('\n') + '\n')
      
      // In development, continue with warnings
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Continuing in development mode with missing env vars...\n')
        // Return partial env with defaults
        validatedEnv = {
          DATABASE_URL: process.env.DATABASE_URL || 'file:./prisma/dev.db',
          JWT_SECRET: process.env.JWT_SECRET || 'development-secret-change-in-production-32chars',
          NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
          AWS_REGION: 'us-east-1',
          EMAIL_FROM: 'noreply@stockcito.com',
        } as Env
        return validatedEnv
      }
      
      // In production, fail hard
      throw new Error('Environment validation failed. Check server logs.')
    }
    throw error
  }
}

/**
 * Get validated environment (validates on first call)
 */
export function getEnv(): Env {
  return validateEnv()
}

/**
 * Check if a feature is available based on env vars
 */
export function isFeatureAvailable(feature: 'email' | 'payments' | 'redis'): boolean {
  const env = getEnv()
  
  switch (feature) {
    case 'email':
      return !!(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY)
    case 'payments':
      return !!(env.MERCADOPAGO_ACCESS_TOKEN && env.MERCADOPAGO_PUBLIC_KEY)
    case 'redis':
      return !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN)
    default:
      return false
  }
}

/**
 * Get app URL with fallback
 */
export function getAppUrl(): string {
  return getEnv().NEXT_PUBLIC_APP_URL
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production'
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development'
}
