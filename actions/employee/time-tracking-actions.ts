"use server"
import { employeeLogger } from '@/lib/logger'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { requireOrganization, getSession, logAudit } from '@/actions/auth'
import { getUserPermissions, hasPermission, type SystemRole } from '@/lib/permissions'
import { useOverride } from './override-actions'

// ==========================================
// TIME ENTRIES (Clock In/Out)
// ==========================================

/**
 * Registrar entrada (Clock In)
 */
export async function clockIn(
    location?: { lat: number; lng: number }
): Promise<{ success: boolean; entryId?: number; error?: string }> {
    try {
        const { session, organizationId } = await requireOrganization()

        // Verificar si ya tiene una entrada activa
        const activeEntry = await db.timeEntry.findFirst({
            where: {
                userId: session.id,
                status: 'active'
            }
        })

        if (activeEntry) {
            return { success: false, error: 'Ya tienes una entrada activa. Primero registra tu salida.' }
        }

        const entry = await db.timeEntry.create({
            data: {
                organizationId,
                userId: session.id,
                clockInLocation: location ? JSON.stringify(location) : null,
                status: 'active'
            }
        })

        await logAudit(
            session.id,
            'clock_in',
            'time_entry',
            entry.id,
            'Entrada registrada',
            undefined,
            organizationId
        )

        revalidatePath('/users')
        return { success: true, entryId: entry.id }
    } catch (error) {
        employeeLogger.error('Clock in error:', error)
        return { success: false, error: 'Error al registrar entrada' }
    }
}

/**
 * Registrar salida (Clock Out)
 */
export async function clockOut(
    location?: { lat: number; lng: number }
): Promise<{ success: boolean; totalMinutes?: number; error?: string }> {
    try {
        const { session, organizationId } = await requireOrganization()

        const activeEntry = await db.timeEntry.findFirst({
            where: {
                userId: session.id,
                status: 'active'
            }
        })

        if (!activeEntry) {
            return { success: false, error: 'No tienes una entrada activa' }
        }

        const clockOutTime = new Date()
        const totalMinutes = Math.floor(
            (clockOutTime.getTime() - activeEntry.clockIn.getTime()) / 60000
        ) - activeEntry.breakMinutes

        await db.timeEntry.update({
            where: { id: activeEntry.id },
            data: {
                clockOut: clockOutTime,
                clockOutLocation: location ? JSON.stringify(location) : null,
                totalMinutes,
                status: 'completed'
            }
        })

        await logAudit(
            session.id,
            'clock_out',
            'time_entry',
            activeEntry.id,
            `Salida registrada. Total: ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
            undefined,
            organizationId
        )

        revalidatePath('/users')
        return { success: true, totalMinutes }
    } catch (error) {
        employeeLogger.error('Clock out error:', error)
        return { success: false, error: 'Error al registrar salida' }
    }
}

/**
 * Obtener entrada activa del usuario
 */
export async function getActiveTimeEntry() {
    const session = await getSession()
    if (!session) return null

    return db.timeEntry.findFirst({
        where: {
            userId: session.id,
            status: 'active'
        }
    })
}

/**
 * Obtener historial de entradas del usuario
 */
export async function getTimeEntries(
    userId?: number,
    startDate?: Date,
    endDate?: Date
) {
    const { session, organizationId } = await requireOrganization()

    const permissions = getUserPermissions(session.role as SystemRole, null)
    
    // Si no es el propio usuario, verificar permisos
    const targetUserId = userId || session.id
    if (targetUserId !== session.id && !hasPermission(permissions, 'users', 'viewTimeEntries')) {
        throw new Error('Sin permisos para ver entradas de otros usuarios')
    }

    return db.timeEntry.findMany({
        where: {
            organizationId,
            userId: targetUserId,
            clockIn: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: { clockIn: 'desc' },
        take: 50
    })
}

/**
 * Editar entrada de tiempo (requiere permisos)
 */
export async function editTimeEntry(
    entryId: number,
    data: {
        clockIn?: Date
        clockOut?: Date
        breakMinutes?: number
        notes?: string
    },
    overrideId?: number
): Promise<{ success: boolean; error?: string }> {
    try {
        const { session, organizationId } = await requireOrganization()
        
        const entry = await db.timeEntry.findFirst({
            where: { id: entryId, organizationId }
        })

        if (!entry) {
            return { success: false, error: 'Entrada no encontrada' }
        }

        const permissions = getUserPermissions(session.role as SystemRole, null)
        
        // Si es de otro usuario, verificar permisos o override
        if (entry.userId !== session.id) {
            if (!hasPermission(permissions, 'users', 'editTimeEntries')) {
                if (!overrideId) {
                    return { success: false, error: 'Requiere autorización para editar' }
                }
                const overrideResult = await useOverride(overrideId)
                if (!overrideResult.success) {
                    return { success: false, error: overrideResult.error }
                }
            }
        }

        // Recalcular minutos si hay cambios en tiempos
        let totalMinutes = entry.totalMinutes
        const clockIn = data.clockIn || entry.clockIn
        const clockOut = data.clockOut || entry.clockOut
        const breakMinutes = data.breakMinutes ?? entry.breakMinutes

        if (clockOut) {
            totalMinutes = Math.floor(
                (clockOut.getTime() - clockIn.getTime()) / 60000
            ) - breakMinutes
        }

        await db.timeEntry.update({
            where: { id: entryId },
            data: {
                clockIn: data.clockIn,
                clockOut: data.clockOut,
                breakMinutes: data.breakMinutes,
                notes: data.notes,
                totalMinutes,
                editedById: session.id,
                editReason: data.notes,
                status: entry.status === 'active' ? 'active' : 'edited'
            }
        })

        await logAudit(
            session.id,
            'edit_time_entry',
            'time_entry',
            entryId,
            `Entrada editada: ${data.notes || 'Sin motivo'}`,
            undefined,
            organizationId
        )

        revalidatePath('/users')
        return { success: true }
    } catch (error) {
        employeeLogger.error('Edit time entry error:', error)
        return { success: false, error: 'Error al editar entrada' }
    }
}
