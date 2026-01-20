"use server"

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/actions/auth-actions'
import { logError } from '@/lib/logger'

// ==========================================
// KITCHEN DISPLAY TYPES
// ==========================================

export type KitchenOrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered'

export interface KitchenOrderItem {
    id: number
    productName: string
    quantity: number
    notes?: string
}

export interface KitchenOrder {
    id: number
    orderNumber: string
    status: KitchenOrderStatus
    items: KitchenOrderItem[]
    clientName?: string
    tableName?: string
    createdAt: Date
    startedAt?: Date
    readyAt?: Date
    elapsedMinutes: number
}

// ==========================================
// KITCHEN ACTIONS
// ==========================================

/**
 * Get orders for kitchen display
 */
export async function getKitchenOrders(
    status?: KitchenOrderStatus | 'all'
): Promise<KitchenOrder[]> {
    const session = await getSession()
    if (!session?.organizationId) return []

    try {
        // Get today's sales that need kitchen attention
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const whereClause: any = {
            organizationId: session.organizationId,
            createdAt: { gte: startOfDay },
            // Only completed sales that haven't been delivered yet
            status: 'completed'
        }

        // Filter by kitchen status if specified
        if (status && status !== 'all') {
            whereClause.kitchenStatus = status
        } else {
            // By default, show orders that are not delivered
            whereClause.kitchenStatus = { in: ['pending', 'preparing', 'ready'] }
        }

        const sales = await db.sale.findMany({
            where: whereClause,
            include: {
                items: {
                    include: {
                        product: {
                            select: { name: true }
                        }
                    }
                },
                client: {
                    select: { name: true }
                }
            },
            orderBy: [
                { kitchenStatus: 'asc' }, // pending first
                { createdAt: 'asc' } // oldest first
            ],
            take: 50
        })

        // Get table information for sales that have tableId
        const tableIds = sales.filter(s => s.tableId).map(s => s.tableId as number)
        const tables = tableIds.length > 0
            ? await db.table.findMany({
                where: { id: { in: tableIds } },
                select: { id: true, number: true, name: true }
            })
            : []

        const tableMap = new Map(tables.map(t => [t.id, t]))

        const now = new Date()

        return sales.map(sale => {
            const referenceTime = sale.kitchenStartedAt || sale.createdAt
            const elapsedMs = now.getTime() - referenceTime.getTime()
            const elapsedMinutes = Math.floor(elapsedMs / 60000)

            // Build table name from table data
            let tableName: string | undefined = undefined
            if (sale.tableId) {
                const table = tableMap.get(sale.tableId)
                if (table) {
                    tableName = table.name || `Mesa ${table.number}`
                }
            }

            return {
                id: sale.id,
                orderNumber: `#${sale.id.toString().padStart(4, '0')}`,
                status: (sale.kitchenStatus as KitchenOrderStatus) || 'pending',
                items: sale.items.map(item => ({
                    id: item.id,
                    productName: item.product.name,
                    quantity: item.quantity,
                    notes: undefined
                })),
                clientName: sale.client?.name,
                tableName,
                createdAt: sale.createdAt,
                startedAt: sale.kitchenStartedAt || undefined,
                readyAt: sale.kitchenReadyAt || undefined,
                elapsedMinutes
            }
        })
    } catch (error) {
        logError('Error getting kitchen orders:', error)
        return []
    }
}

/**
 * Update order status in kitchen
 */
export async function updateKitchenOrderStatus(
    orderId: number,
    status: KitchenOrderStatus
): Promise<{ success: boolean; error?: string }> {
    const session = await getSession()
    if (!session?.organizationId) {
        return { success: false, error: 'No autenticado' }
    }

    try {
        // Verify order belongs to organization
        const sale = await db.sale.findFirst({
            where: {
                id: orderId,
                organizationId: session.organizationId
            }
        })

        if (!sale) {
            return { success: false, error: 'Orden no encontrada' }
        }

        const updateData: any = {
            kitchenStatus: status
        }

        // Set timestamps based on status
        if (status === 'preparing' && !sale.kitchenStartedAt) {
            updateData.kitchenStartedAt = new Date()
        }
        if (status === 'ready') {
            updateData.kitchenReadyAt = new Date()
        }

        await db.sale.update({
            where: { id: orderId },
            data: updateData
        })

        revalidatePath('/kitchen')
        return { success: true }
    } catch (error) {
        logError('Error updating kitchen order status:', error)
        return { success: false, error: 'Error al actualizar orden' }
    }
}

/**
 * Get kitchen statistics
 */
export async function getKitchenStats(): Promise<{
    pendingCount: number
    preparingCount: number
    readyCount: number
    averagePrepTime: number
}> {
    const session = await getSession()
    if (!session?.organizationId) {
        return { pendingCount: 0, preparingCount: 0, readyCount: 0, averagePrepTime: 0 }
    }

    try {
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const [pending, preparing, ready, completed] = await Promise.all([
            db.sale.count({
                where: {
                    organizationId: session.organizationId,
                    createdAt: { gte: startOfDay },
                    kitchenStatus: 'pending'
                }
            }),
            db.sale.count({
                where: {
                    organizationId: session.organizationId,
                    createdAt: { gte: startOfDay },
                    kitchenStatus: 'preparing'
                }
            }),
            db.sale.count({
                where: {
                    organizationId: session.organizationId,
                    createdAt: { gte: startOfDay },
                    kitchenStatus: 'ready'
                }
            }),
            db.sale.findMany({
                where: {
                    organizationId: session.organizationId,
                    createdAt: { gte: startOfDay },
                    kitchenStatus: 'delivered',
                    kitchenStartedAt: { not: null },
                    kitchenReadyAt: { not: null }
                },
                select: {
                    kitchenStartedAt: true,
                    kitchenReadyAt: true
                }
            })
        ])

        // Calculate average prep time
        let averagePrepTime = 0
        if (completed.length > 0) {
            const totalMs = completed.reduce((acc, sale) => {
                if (sale.kitchenStartedAt && sale.kitchenReadyAt) {
                    return acc + (sale.kitchenReadyAt.getTime() - sale.kitchenStartedAt.getTime())
                }
                return acc
            }, 0)
            averagePrepTime = Math.round(totalMs / completed.length / 60000) // in minutes
        }

        return {
            pendingCount: pending,
            preparingCount: preparing,
            readyCount: ready,
            averagePrepTime
        }
    } catch (error) {
        logError('Error getting kitchen stats:', error)
        return { pendingCount: 0, preparingCount: 0, readyCount: 0, averagePrepTime: 0 }
    }
}
