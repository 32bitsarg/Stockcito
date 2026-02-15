"use server"

import { db } from "@/lib/db"
import { getSession } from "@/actions/auth"

/**
 * Get unresolved stock alerts for the current organization
 */
export async function getStockAlerts() {
    const session = await getSession()
    if (!session?.organizationId) return []

    return db.stockAlert.findMany({
        where: {
            organizationId: session.organizationId,
            resolved: false
        },
        include: {
            product: {
                select: { id: true, name: true, stock: true, sku: true }
            },
            sale: {
                select: { id: true, ticketNumber: true, date: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

/**
 * Get the count of unresolved stock alerts (lightweight for badge)
 */
export async function getStockAlertCount(): Promise<number> {
    const session = await getSession()
    if (!session?.organizationId) return 0

    return db.stockAlert.count({
        where: {
            organizationId: session.organizationId,
            resolved: false
        }
    })
}

/**
 * Resolve a stock alert with an action taken
 * @param alertId - ID of the alert to resolve
 * @param action - Action taken: 'adjusted' (stock corrected), 'acknowledged' (noted, no action), 'restocked' (product restocked)
 */
export async function resolveStockAlert(alertId: number, action: string) {
    const session = await getSession()
    if (!session?.organizationId) {
        return { error: "No autorizado" }
    }

    // Only owner/admin/manager can resolve
    if (!['owner', 'admin', 'manager'].includes(session.role)) {
        return { error: "No tiene permisos para resolver alertas de stock" }
    }

    const alert = await db.stockAlert.findFirst({
        where: {
            id: alertId,
            organizationId: session.organizationId
        }
    })

    if (!alert) {
        return { error: "Alerta no encontrada" }
    }

    await db.stockAlert.update({
        where: { id: alertId },
        data: {
            resolved: true,
            resolvedAt: new Date(),
            resolvedById: session.id,
            resolvedAction: action
        }
    })

    return { success: true }
}

/**
 * Resolve all stock alerts for the current organization
 */
export async function resolveAllStockAlerts(action: string) {
    const session = await getSession()
    if (!session?.organizationId) {
        return { error: "No autorizado" }
    }

    if (!['owner', 'admin', 'manager'].includes(session.role)) {
        return { error: "No tiene permisos para resolver alertas de stock" }
    }

    const result = await db.stockAlert.updateMany({
        where: {
            organizationId: session.organizationId,
            resolved: false
        },
        data: {
            resolved: true,
            resolvedAt: new Date(),
            resolvedById: session.id,
            resolvedAction: action
        }
    })

    return { success: true, count: result.count }
}
