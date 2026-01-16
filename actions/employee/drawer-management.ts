"use server"
import { employeeLogger } from '@/lib/logger'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { requireOrganization, getSession, logAudit } from '@/actions/auth'
import { getUserPermissions, hasPermission, type SystemRole } from '@/lib/permissions'

// ==========================================
// CASH DRAWER MANAGEMENT
// ==========================================

/**
 * Obtener cajas de la organización
 */
export async function getCashDrawers() {
    const { organizationId } = await requireOrganization()

    return db.cashDrawer.findMany({
        where: { organizationId },
        include: {
            currentUser: { select: { id: true, name: true } }
        },
        orderBy: { name: 'asc' }
    })
}

/**
 * Crear una nueva caja
 */
export async function createCashDrawer(data: {
    name: string
    terminalId?: string
}): Promise<{ success: boolean; error?: string }> {
    try {
        const { session, organizationId } = await requireOrganization()
        
        const permissions = getUserPermissions(session.role as SystemRole, null)
        if (!hasPermission(permissions, 'settings', 'editOrganization')) {
            return { success: false, error: 'Sin permisos para crear cajas' }
        }

        await db.cashDrawer.create({
            data: {
                organizationId,
                name: data.name,
                terminalId: data.terminalId
            }
        })

        await logAudit(session.id, 'create', 'cash_drawer', undefined, `Caja creada: ${data.name}`)
        revalidatePath('/settings')
        
        return { success: true }
    } catch (error) {
        employeeLogger.error('Create cash drawer error:', error)
        return { success: false, error: 'Error al crear caja' }
    }
}

/**
 * Asignar caja a un usuario específico (solo para admins)
 */
export async function assignDrawerToUser(
    drawerId: number,
    userId: number | null
): Promise<{ success: boolean; error?: string }> {
    try {
        const { session, organizationId } = await requireOrganization()

        const permissions = getUserPermissions(session.role as SystemRole, null)
        if (!hasPermission(permissions, 'settings', 'editOrganization')) {
            return { success: false, error: 'Sin permisos para asignar cajas' }
        }

        const drawer = await db.cashDrawer.findFirst({
            where: { id: drawerId, organizationId }
        })

        if (!drawer) {
            return { success: false, error: 'Caja no encontrada' }
        }

        // Si se asigna a un usuario, verificar que exista
        if (userId !== null) {
            const user = await db.user.findFirst({
                where: { id: userId, organizationId, active: true }
            })
            if (!user) {
                return { success: false, error: 'Usuario no encontrado o inactivo' }
            }
        }

        await db.cashDrawer.update({
            where: { id: drawerId },
            data: { assignedUserId: userId }
        })

        await logAudit(
            session.id,
            'assign_drawer',
            'cash_drawer',
            drawerId,
            userId ? `Caja asignada a usuario #${userId}` : 'Asignación de caja removida',
            undefined,
            organizationId
        )

        revalidatePath('/settings')
        return { success: true }
    } catch (error) {
        employeeLogger.error('Assign drawer error:', error)
        return { success: false, error: 'Error al asignar caja' }
    }
}

/**
 * Obtener caja asignada al usuario (si existe)
 */
export async function getAssignedDrawer() {
    const session = await getSession()
    if (!session?.organizationId) return null

    // Primero buscar caja asignada
    const assignedDrawer = await db.cashDrawer.findFirst({
        where: {
            organizationId: session.organizationId,
            assignedUserId: session.id
        }
    })

    if (assignedDrawer) {
        return {
            id: assignedDrawer.id,
            name: assignedDrawer.name,
            isAssigned: true
        }
    }

    return null
}
