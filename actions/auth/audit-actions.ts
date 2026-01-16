"use server"

import { db } from '@/lib/db'
import { logError } from '@/lib/logger'

// Audit logging
export async function logAudit(
    userId: number | null,
    action: string,
    entity: string,
    entityId?: number | null,
    details?: string,
    ip?: string,
    organizationId?: number | null
): Promise<void> {
    try {
        await db.auditLog.create({
            data: {
                userId,
                action,
                entity,
                entityId: entityId ?? undefined,
                details,
                ip,
                organizationId
            }
        })
    } catch (error) {
        logError('Audit log error', error, { userId, action, entity })
    }
}

// Get audit logs with filters
export async function getAuditLogs(filters?: {
    action?: string
    entity?: string
    userId?: number
    startDate?: Date
    endDate?: Date
    limit?: number
}) {
    const { requireOrganization } = await import('./session-actions')
    
    const { session, organizationId } = await requireOrganization()
    
    // Only owner/admin can view audit logs
    if (!['owner', 'admin'].includes(session.role)) {
        return []
    }
    
    const where: any = { organizationId }
    
    if (filters?.action) where.action = filters.action
    if (filters?.entity) where.entity = filters.entity
    if (filters?.userId) where.userId = filters.userId
    if (filters?.startDate || filters?.endDate) {
        where.createdAt = {}
        if (filters.startDate) where.createdAt.gte = filters.startDate
        if (filters.endDate) where.createdAt.lte = filters.endDate
    }
    
    return db.auditLog.findMany({
        where,
        include: {
            user: {
                select: { id: true, name: true, email: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 100
    })
}
