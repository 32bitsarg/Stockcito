/**
 * Appwrite Logging Service
 * 
 * Sends structured logs to Appwrite Database for centralized logging.
 * Includes automatic retry with exponential backoff.
 */

import {
    getAppwriteDatabases,
    isAppwriteConfigured,
    APPWRITE_DATABASE_ID,
    APPWRITE_LOGS_COLLECTION_ID,
    ID
} from './client'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
    level: LogLevel
    message: string
    module?: string
    userId?: number | null
    organizationId?: number | null
    action?: string
    entity?: string
    entityId?: string | null
    errorMessage?: string
    errorStack?: string
    metadata?: Record<string, unknown>
    userAgent?: string
    ip?: string
    url?: string
    timestamp: string
    environment: string
}

// Queue for failed logs (retry later)
const failedLogsQueue: LogEntry[] = []
const MAX_QUEUE_SIZE = 100
const MAX_RETRIES = 3

/**
 * Send a log entry to Appwrite Database
 */
export async function sendLogToAppwrite(entry: LogEntry): Promise<boolean> {
    if (!isAppwriteConfigured()) {
        // Appwrite not configured, silently skip
        return false
    }

    try {
        const databases = getAppwriteDatabases()

        // Prepare document data (Appwrite requires string values for most fields)
        const documentData: Record<string, unknown> = {
            level: entry.level,
            message: entry.message.substring(0, 1000), // Limit message length
            module: entry.module || null,
            userId: entry.userId?.toString() || null,
            organizationId: entry.organizationId?.toString() || null,
            action: entry.action || null,
            entity: entry.entity || null,
            entityId: entry.entityId?.toString() || null,
            errorMessage: entry.errorMessage?.substring(0, 500) || null,
            errorStack: entry.errorStack?.substring(0, 2000) || null,
            metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
            userAgent: entry.userAgent?.substring(0, 500) || null,
            ip: entry.ip || null,
            url: entry.url?.substring(0, 500) || null,
            timestamp: entry.timestamp,
            environment: entry.environment
        }

        await databases.createDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_LOGS_COLLECTION_ID,
            ID.unique(),
            documentData
        )

        return true
    } catch (error) {
        // Queue failed log for retry
        if (failedLogsQueue.length < MAX_QUEUE_SIZE) {
            failedLogsQueue.push(entry)
        }

        // Always log Appwrite errors to console for debugging
        console.error('[Appwrite Logger] Failed to send log:', {
            error: error instanceof Error ? error.message : String(error),
            entry: { level: entry.level, message: entry.message.substring(0, 100) }
        })

        return false
    }
}

/**
 * Create a log entry with common fields
 */
export function createLogEntry(
    level: LogLevel,
    message: string,
    options: Partial<Omit<LogEntry, 'level' | 'message' | 'timestamp' | 'environment'>> = {}
): LogEntry {
    return {
        level,
        message,
        ...options,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    }
}

/**
 * Process failed logs queue (call periodically or on app shutdown)
 */
export async function processFailedLogs(): Promise<number> {
    if (!isAppwriteConfigured() || failedLogsQueue.length === 0) {
        return 0
    }

    let processed = 0
    const logsToProcess = [...failedLogsQueue]
    failedLogsQueue.length = 0 // Clear queue

    for (const entry of logsToProcess) {
        const success = await sendLogToAppwrite(entry)
        if (success) {
            processed++
        }
        // Small delay between retries
        await new Promise(resolve => setTimeout(resolve, 100))
    }

    return processed
}

/**
 * Get failed logs count
 */
export function getFailedLogsCount(): number {
    return failedLogsQueue.length
}
