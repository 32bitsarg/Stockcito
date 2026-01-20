// Centralized logger for production-safe error handling
// Prevents sensitive information leakage in production

import { sendLogToAppwrite, createLogEntry, isAppwriteConfigured } from './appwrite'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  userId?: number | null
  organizationId?: number | null
  action?: string
  entity?: string
  entityId?: number | string | null
  module?: string
  [key: string]: unknown
}

const isProd = process.env.NODE_ENV === 'production'

// In production, logs are sent to Appwrite Database
// This provides:
// - Centralized logging dashboard
// - Search and filtering capabilities
// - Long-term log retention
// - Analytics and monitoring

async function sendToExternalService(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: unknown
): Promise<void> {
  // Only send to external service if Appwrite is configured
  if (!isAppwriteConfigured()) {
    return
  }

  try {
    // Extract error details
    let errorMessage: string | undefined
    let errorStack: string | undefined

    if (error instanceof Error) {
      errorMessage = error.message
      errorStack = error.stack
    } else if (typeof error === 'string') {
      errorMessage = error
    } else if (error) {
      errorMessage = String(error)
    }

    // Create log entry with all available context
    const entry = createLogEntry(level, message, {
      module: context?.module,
      userId: context?.userId,
      organizationId: context?.organizationId,
      action: context?.action,
      entity: context?.entity,
      entityId: context?.entityId?.toString(),
      errorMessage,
      errorStack,
      metadata: context ? { ...context } : undefined
    })

    // Send asynchronously (don't await to avoid blocking)
    sendLogToAppwrite(entry).catch(() => {
      // Silently fail - the logging service handles retries
    })
  } catch {
    // Never let logging errors affect the application
  }
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Unknown error'
}

function sanitizeContext(context?: LogContext): LogContext | undefined {
  if (!context) return undefined

  // Remove potentially sensitive fields in production
  if (isProd) {
    const sanitized = { ...context }
    // Remove any fields that might contain sensitive data
    delete sanitized.password
    delete sanitized.token
    delete sanitized.secret
    delete sanitized.pin
    delete sanitized.cardNumber
    return sanitized
  }

  return context
}

/**
 * Log a debug message (development only)
 */
export function logDebug(message: string, context?: LogContext): void {
  if (!isProd) {
    console.debug(`[DEBUG] ${message}`, context ? sanitizeContext(context) : '')
  }
}

/**
 * Log an info message
 */
export function logInfo(message: string, context?: LogContext): void {
  if (!isProd) {
    console.info(`[INFO] ${message}`, context ? sanitizeContext(context) : '')
  } else {
    sendToExternalService('info', message, sanitizeContext(context))
  }
}

/**
 * Log a warning message
 */
export function logWarn(message: string, context?: LogContext): void {
  if (!isProd) {
    console.warn(`[WARN] ${message}`, context ? sanitizeContext(context) : '')
  } else {
    sendToExternalService('warn', message, sanitizeContext(context))
  }
}

/**
 * Log an error message (safe for production)
 * In production: Sends to external service, doesn't expose to console
 * In development: Full error output to console
 */
export function logError(message: string, error?: unknown, context?: LogContext): void {
  if (!isProd) {
    console.error(`[ERROR] ${message}`, error, context ? sanitizeContext(context) : '')
  } else {
    // In production, log a sanitized version
    sendToExternalService('error', message, sanitizeContext(context), error)

    // Optionally log a sanitized message to console for server logs
    // This helps with debugging without exposing sensitive data
    console.error(`[ERROR] ${message}: ${formatError(error)}`)
  }
}

/**
 * Log an action/operation for audit purposes
 */
export function logAction(
  action: string,
  entity: string,
  entityId?: number | string,
  context?: Omit<LogContext, 'action' | 'entity' | 'entityId'>
): void {
  const fullContext: LogContext = {
    action,
    entity,
    entityId,
    ...context
  }

  if (!isProd) {
    console.log(`[ACTION] ${action} on ${entity}${entityId ? ` #${entityId}` : ''}`, sanitizeContext(fullContext))
  } else {
    sendToExternalService('info', `${action} on ${entity}`, sanitizeContext(fullContext))
  }
}

/**
 * Create a contextualized logger for a specific module
 */
export function createLogger(moduleName: string) {
  return {
    debug: (message: string, context?: LogContext) =>
      logDebug(`[${moduleName}] ${message}`, context),
    info: (message: string, context?: LogContext) =>
      logInfo(`[${moduleName}] ${message}`, context),
    warn: (message: string, context?: LogContext) =>
      logWarn(`[${moduleName}] ${message}`, context),
    error: (message: string, error?: unknown, context?: LogContext) =>
      logError(`[${moduleName}] ${message}`, error, context),
  }
}

// Pre-configured loggers for common modules
export const authLogger = createLogger('Auth')
export const paymentLogger = createLogger('Payment')
export const saleLogger = createLogger('Sale')
export const employeeLogger = createLogger('Employee')
export const securityLogger = createLogger('Security')
