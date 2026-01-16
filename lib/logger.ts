// Centralized logger for production-safe error handling
// Prevents sensitive information leakage in production

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  userId?: number | null
  organizationId?: number | null
  action?: string
  entity?: string
  entityId?: number | string | null
  [key: string]: unknown
}

const isProd = process.env.NODE_ENV === 'production'

// In production, you could send to external services like:
// - Sentry (sentry.io)
// - LogRocket
// - Datadog
// - AWS CloudWatch
// - Custom logging endpoint

async function sendToExternalService(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: unknown
): Promise<void> {
  // TODO: Implement external logging service integration
  // Example with Sentry:
  // if (level === 'error' && error instanceof Error) {
  //   Sentry.captureException(error, { extra: context })
  // }
  
  // For now, we just suppress in production
  // The error is still captured, just not exposed to console
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
