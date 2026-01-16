"use server"

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/actions/auth-actions'
import { logError, logInfo } from '@/lib/logger'

// ==========================================
// TABLE TYPES
// ==========================================

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning'
export type TableShape = 'square' | 'round' | 'rectangle'

export interface TableData {
    id: number
    number: number
    name: string | null
    capacity: number
    status: TableStatus
    shape: TableShape
    positionX: number
    positionY: number
    currentSaleId: number | null
    occupiedAt: Date | null
    reservedFor: Date | null
    reservedName: string | null
    createdAt: Date
    updatedAt: Date
}

export interface CreateTableInput {
    number: number
    name?: string
    capacity?: number
    shape?: TableShape
    positionX?: number
    positionY?: number
}

export interface UpdateTableInput {
    name?: string
    capacity?: number
    shape?: TableShape
    positionX?: number
    positionY?: number
}

// ==========================================
// TABLE CRUD ACTIONS
// ==========================================

/**
 * Get all tables for the organization
 */
export async function getTables(): Promise<TableData[]> {
    const session = await getSession()
    if (!session?.organizationId) return []

    try {
        const tables = await db.table.findMany({
            where: { organizationId: session.organizationId },
            orderBy: { number: 'asc' }
        })

        return tables.map(t => ({
            id: t.id,
            number: t.number,
            name: t.name,
            capacity: t.capacity,
            status: t.status as TableStatus,
            shape: t.shape as TableShape,
            positionX: t.positionX,
            positionY: t.positionY,
            currentSaleId: t.currentSaleId,
            occupiedAt: t.occupiedAt,
            reservedFor: t.reservedFor,
            reservedName: t.reservedName,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
        }))
    } catch (error) {
        logError('Error getting tables:', error)
        return []
    }
}

/**
 * Get a single table by ID
 */
export async function getTableById(tableId: number): Promise<TableData | null> {
    const session = await getSession()
    if (!session?.organizationId) return null

    try {
        const table = await db.table.findFirst({
            where: {
                id: tableId,
                organizationId: session.organizationId
            }
        })

        if (!table) return null

        return {
            id: table.id,
            number: table.number,
            name: table.name,
            capacity: table.capacity,
            status: table.status as TableStatus,
            shape: table.shape as TableShape,
            positionX: table.positionX,
            positionY: table.positionY,
            currentSaleId: table.currentSaleId,
            occupiedAt: table.occupiedAt,
            reservedFor: table.reservedFor,
            reservedName: table.reservedName,
            createdAt: table.createdAt,
            updatedAt: table.updatedAt
        }
    } catch (error) {
        logError('Error getting table:', error)
        return null
    }
}

/**
 * Create a new table
 */
export async function createTable(
    data: CreateTableInput
): Promise<{ success: boolean; tableId?: number; error?: string }> {
    const session = await getSession()
    if (!session?.organizationId) {
        return { success: false, error: 'No autenticado' }
    }

    if (session.role !== 'owner' && session.role !== 'admin') {
        return { success: false, error: 'Sin permisos para crear mesas' }
    }

    try {
        // Check if table number already exists
        const existing = await db.table.findFirst({
            where: {
                organizationId: session.organizationId,
                number: data.number
            }
        })

        if (existing) {
            return { success: false, error: `Ya existe una mesa con el número ${data.number}` }
        }

        const table = await db.table.create({
            data: {
                organizationId: session.organizationId,
                number: data.number,
                name: data.name || null,
                capacity: data.capacity || 4,
                shape: data.shape || 'square',
                positionX: data.positionX || 0,
                positionY: data.positionY || 0
            }
        })

        logInfo(`Mesa ${data.number} creada`, { tableId: table.id, organizationId: session.organizationId })
        revalidatePath('/tables')
        return { success: true, tableId: table.id }
    } catch (error) {
        logError('Error creating table:', error)
        return { success: false, error: 'Error al crear mesa' }
    }
}

/**
 * Update a table
 */
export async function updateTable(
    tableId: number,
    data: UpdateTableInput
): Promise<{ success: boolean; error?: string }> {
    const session = await getSession()
    if (!session?.organizationId) {
        return { success: false, error: 'No autenticado' }
    }

    if (session.role !== 'owner' && session.role !== 'admin') {
        return { success: false, error: 'Sin permisos para editar mesas' }
    }

    try {
        const table = await db.table.findFirst({
            where: { id: tableId, organizationId: session.organizationId }
        })

        if (!table) {
            return { success: false, error: 'Mesa no encontrada' }
        }

        await db.table.update({
            where: { id: tableId },
            data: {
                name: data.name,
                capacity: data.capacity,
                shape: data.shape,
                positionX: data.positionX,
                positionY: data.positionY
            }
        })

        revalidatePath('/tables')
        return { success: true }
    } catch (error) {
        logError('Error updating table:', error)
        return { success: false, error: 'Error al actualizar mesa' }
    }
}

/**
 * Delete a table
 */
export async function deleteTable(
    tableId: number
): Promise<{ success: boolean; error?: string }> {
    const session = await getSession()
    if (!session?.organizationId) {
        return { success: false, error: 'No autenticado' }
    }

    if (session.role !== 'owner' && session.role !== 'admin') {
        return { success: false, error: 'Sin permisos para eliminar mesas' }
    }

    try {
        const table = await db.table.findFirst({
            where: { id: tableId, organizationId: session.organizationId }
        })

        if (!table) {
            return { success: false, error: 'Mesa no encontrada' }
        }

        if (table.status === 'occupied') {
            return { success: false, error: 'No se puede eliminar una mesa ocupada' }
        }

        await db.table.delete({
            where: { id: tableId }
        })

        logInfo(`Mesa ${table.number} eliminada`, { tableId, organizationId: session.organizationId })
        revalidatePath('/tables')
        return { success: true }
    } catch (error) {
        logError('Error deleting table:', error)
        return { success: false, error: 'Error al eliminar mesa' }
    }
}

// ==========================================
// TABLE STATUS ACTIONS
// ==========================================

/**
 * Occupy a table (assign a sale)
 */
export async function occupyTable(
    tableId: number,
    saleId?: number
): Promise<{ success: boolean; error?: string }> {
    const session = await getSession()
    if (!session?.organizationId) {
        return { success: false, error: 'No autenticado' }
    }

    try {
        const table = await db.table.findFirst({
            where: { id: tableId, organizationId: session.organizationId }
        })

        if (!table) {
            return { success: false, error: 'Mesa no encontrada' }
        }

        if (table.status === 'occupied') {
            return { success: false, error: 'La mesa ya está ocupada' }
        }

        await db.table.update({
            where: { id: tableId },
            data: {
                status: 'occupied',
                currentSaleId: saleId || null,
                occupiedAt: new Date(),
                reservedFor: null,
                reservedName: null
            }
        })

        revalidatePath('/tables')
        return { success: true }
    } catch (error) {
        logError('Error occupying table:', error)
        return { success: false, error: 'Error al ocupar mesa' }
    }
}

/**
 * Release a table (mark as available or cleaning)
 */
export async function releaseTable(
    tableId: number,
    needsCleaning: boolean = false
): Promise<{ success: boolean; error?: string }> {
    const session = await getSession()
    if (!session?.organizationId) {
        return { success: false, error: 'No autenticado' }
    }

    try {
        const table = await db.table.findFirst({
            where: { id: tableId, organizationId: session.organizationId }
        })

        if (!table) {
            return { success: false, error: 'Mesa no encontrada' }
        }

        await db.table.update({
            where: { id: tableId },
            data: {
                status: needsCleaning ? 'cleaning' : 'available',
                currentSaleId: null,
                occupiedAt: null
            }
        })

        revalidatePath('/tables')
        return { success: true }
    } catch (error) {
        logError('Error releasing table:', error)
        return { success: false, error: 'Error al liberar mesa' }
    }
}

/**
 * Reserve a table
 */
export async function reserveTable(
    tableId: number,
    reservedFor: Date,
    reservedName: string
): Promise<{ success: boolean; error?: string }> {
    const session = await getSession()
    if (!session?.organizationId) {
        return { success: false, error: 'No autenticado' }
    }

    try {
        const table = await db.table.findFirst({
            where: { id: tableId, organizationId: session.organizationId }
        })

        if (!table) {
            return { success: false, error: 'Mesa no encontrada' }
        }

        if (table.status === 'occupied') {
            return { success: false, error: 'No se puede reservar una mesa ocupada' }
        }

        await db.table.update({
            where: { id: tableId },
            data: {
                status: 'reserved',
                reservedFor,
                reservedName
            }
        })

        revalidatePath('/tables')
        return { success: true }
    } catch (error) {
        logError('Error reserving table:', error)
        return { success: false, error: 'Error al reservar mesa' }
    }
}

/**
 * Cancel a reservation
 */
export async function cancelReservation(
    tableId: number
): Promise<{ success: boolean; error?: string }> {
    const session = await getSession()
    if (!session?.organizationId) {
        return { success: false, error: 'No autenticado' }
    }

    try {
        const table = await db.table.findFirst({
            where: { id: tableId, organizationId: session.organizationId }
        })

        if (!table) {
            return { success: false, error: 'Mesa no encontrada' }
        }

        if (table.status !== 'reserved') {
            return { success: false, error: 'La mesa no tiene reserva' }
        }

        await db.table.update({
            where: { id: tableId },
            data: {
                status: 'available',
                reservedFor: null,
                reservedName: null
            }
        })

        revalidatePath('/tables')
        return { success: true }
    } catch (error) {
        logError('Error canceling reservation:', error)
        return { success: false, error: 'Error al cancelar reserva' }
    }
}

/**
 * Mark table as clean (after cleaning)
 */
export async function markTableClean(
    tableId: number
): Promise<{ success: boolean; error?: string }> {
    const session = await getSession()
    if (!session?.organizationId) {
        return { success: false, error: 'No autenticado' }
    }

    try {
        await db.table.update({
            where: { id: tableId },
            data: { status: 'available' }
        })

        revalidatePath('/tables')
        return { success: true }
    } catch (error) {
        logError('Error marking table clean:', error)
        return { success: false, error: 'Error al marcar mesa limpia' }
    }
}

// ==========================================
// BATCH OPERATIONS
// ==========================================

/**
 * Update positions of multiple tables (for drag & drop layout)
 */
export async function updateTablePositions(
    updates: { id: number; positionX: number; positionY: number }[]
): Promise<{ success: boolean; error?: string }> {
    const session = await getSession()
    if (!session?.organizationId) {
        return { success: false, error: 'No autenticado' }
    }

    if (session.role !== 'owner' && session.role !== 'admin') {
        return { success: false, error: 'Sin permisos para editar layout' }
    }

    try {
        await db.$transaction(
            updates.map(update =>
                db.table.update({
                    where: { id: update.id },
                    data: {
                        positionX: update.positionX,
                        positionY: update.positionY
                    }
                })
            )
        )

        revalidatePath('/tables')
        return { success: true }
    } catch (error) {
        logError('Error updating table positions:', error)
        return { success: false, error: 'Error al actualizar posiciones' }
    }
}

/**
 * Get table statistics
 */
export async function getTableStats(): Promise<{
    total: number
    available: number
    occupied: number
    reserved: number
    cleaning: number
}> {
    const session = await getSession()
    if (!session?.organizationId) {
        return { total: 0, available: 0, occupied: 0, reserved: 0, cleaning: 0 }
    }

    try {
        const [total, available, occupied, reserved, cleaning] = await Promise.all([
            db.table.count({ where: { organizationId: session.organizationId } }),
            db.table.count({ where: { organizationId: session.organizationId, status: 'available' } }),
            db.table.count({ where: { organizationId: session.organizationId, status: 'occupied' } }),
            db.table.count({ where: { organizationId: session.organizationId, status: 'reserved' } }),
            db.table.count({ where: { organizationId: session.organizationId, status: 'cleaning' } })
        ])

        return { total, available, occupied, reserved, cleaning }
    } catch (error) {
        logError('Error getting table stats:', error)
        return { total: 0, available: 0, occupied: 0, reserved: 0, cleaning: 0 }
    }
}
