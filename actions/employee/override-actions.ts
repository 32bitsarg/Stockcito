"use server"
import { employeeLogger } from '@/lib/logger'

import { db } from '@/lib/db'
import { getSession, logAudit } from '@/actions/auth'
import { verifyPassword } from '@/lib/password'
import { canAuthorize, type SystemRole, type ProtectedAction } from '@/lib/permissions'

// ==========================================
// MANAGER OVERRIDE
// ==========================================

/**
 * Solicitar override de manager
 */
export async function requestOverride(
    action: ProtectedAction,
    managerPin: string,
    details: {
        entityType?: string
        entityId?: number
        originalValue?: string
        newValue?: string
        description?: string
    }
): Promise<{ success: boolean; overrideId?: number; error?: string }> {
    try {
        const session = await getSession()
        if (!session?.organizationId) return { success: false, error: 'No autenticado' }

        // Buscar usuarios con PIN que puedan autorizar esta acción
        const managers = await db.user.findMany({
            where: {
                organizationId: session.organizationId,
                active: true,
                pin: { not: null },
                role: { in: ['owner', 'admin', 'manager'] }
            },
            select: { id: true, name: true, role: true, pin: true }
        })

        // Verificar el PIN contra todos los managers
        let authorizer: { id: number; name: string; role: string } | null = null
        
        for (const manager of managers) {
            if (!manager.pin) continue
            
            const isValid = await verifyPassword(manager.pin, managerPin)
            if (isValid && canAuthorize(action, manager.role as SystemRole)) {
                authorizer = { id: manager.id, name: manager.name, role: manager.role }
                break
            }
        }

        if (!authorizer) {
            return { success: false, error: 'PIN de autorización inválido o sin permisos' }
        }

        // Crear registro de override
        const override = await db.managerOverride.create({
            data: {
                organizationId: session.organizationId,
                requestedById: session.id,
                approvedById: authorizer.id,
                action,
                entityType: details.entityType,
                entityId: details.entityId,
                originalValue: details.originalValue,
                newValue: details.newValue,
                details: details.description ? JSON.stringify({ description: details.description }) : null,
                status: 'approved',
                expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutos
            }
        })

        await logAudit(
            session.id, 
            'override_requested', 
            'manager_override', 
            override.id,
            `Acción: ${action}, Autorizado por: ${authorizer.name}`,
            undefined,
            session.organizationId
        )

        return { success: true, overrideId: override.id }
    } catch (error) {
        employeeLogger.error('Request override error:', error)
        return { success: false, error: 'Error al solicitar autorización' }
    }
}

/**
 * Usar un override (marcarlo como usado)
 */
export async function useOverride(
    overrideId: number
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'No autenticado' }

        const override = await db.managerOverride.findUnique({
            where: { id: overrideId }
        })

        if (!override) {
            return { success: false, error: 'Override no encontrado' }
        }

        if (override.requestedById !== session.id) {
            return { success: false, error: 'Override no pertenece a este usuario' }
        }

        if (override.status !== 'approved') {
            return { success: false, error: 'Override ya fue usado o expiró' }
        }

        if (override.expiresAt && new Date() > override.expiresAt) {
            await db.managerOverride.update({
                where: { id: overrideId },
                data: { status: 'expired' }
            })
            return { success: false, error: 'Override expirado' }
        }

        await db.managerOverride.update({
            where: { id: overrideId },
            data: { status: 'used', usedAt: new Date() }
        })

        return { success: true }
    } catch (error) {
        employeeLogger.error('Use override error:', error)
        return { success: false, error: 'Error al usar autorización' }
    }
}
