"use server"

import { db } from '@/lib/db'
import { getSession } from '@/actions/auth-actions'
import { logError, logInfo } from '@/lib/logger'
import webpush from 'web-push'

// Configure web-push with VAPID keys
// You need to generate these keys: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@stockcito.com'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

// ==========================================
// ALERT TYPES
// ==========================================

export type AlertType =
    | 'low_stock'
    | 'high_value_sale'
    | 'new_sale'
    | 'cash_drawer'
    | 'new_employee'
    | 'daily_summary'

interface AlertPayload {
    type: AlertType
    title: string
    body: string
    url?: string
    data?: Record<string, unknown>
}

// ==========================================
// SEND ALERTS
// ==========================================

/**
 * Send an alert to specific users based on their notification preferences
 */
export async function sendAlert(
    alert: AlertPayload,
    targetUserIds?: number[]
): Promise<{ sent: number; failed: number }> {
    const session = await getSession()
    if (!session?.organizationId) {
        return { sent: 0, failed: 0 }
    }

    try {
        // Get users to notify
        let userIds = targetUserIds

        if (!userIds) {
            // Get all users in the organization that should receive this alert type
            const users = await db.user.findMany({
                where: {
                    organizationId: session.organizationId,
                    active: true
                },
                include: {
                    notificationSettings: true,
                    pushSubscriptions: true
                }
            })

            // Filter users based on alert type and their preferences
            const filteredUsers = users.filter(user => {
                const settings = user.notificationSettings
                if (!settings) return true // Default to enabled

                switch (alert.type) {
                    case 'low_stock':
                        return settings.lowStock
                    case 'high_value_sale':
                        return settings.highValueSale
                    case 'new_sale':
                        return settings.newSale
                    case 'cash_drawer':
                        return settings.cashDrawerAlerts
                    case 'new_employee':
                        return settings.newEmployee
                    case 'daily_summary':
                        return settings.dailySummary
                    default:
                        return true
                }
            })

            userIds = filteredUsers.map(u => u.id)
        }

        if (userIds.length === 0) {
            return { sent: 0, failed: 0 }
        }

        // Get push subscriptions for these users
        const subscriptions = await db.pushSubscription.findMany({
            where: {
                userId: { in: userIds }
            }
        })

        let sent = 0
        let failed = 0

        // Send push notifications
        for (const sub of subscriptions) {
            try {
                if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
                    // VAPID not configured, skip push
                    continue
                }

                await webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth
                        }
                    },
                    JSON.stringify({
                        title: alert.title,
                        body: alert.body,
                        url: alert.url || '/dashboard',
                        data: alert.data
                    })
                )
                sent++
            } catch (error: any) {
                failed++

                // If subscription is expired or invalid, remove it
                if (error.statusCode === 404 || error.statusCode === 410) {
                    await db.pushSubscription.delete({
                        where: { id: sub.id }
                    }).catch(() => { })
                }
            }
        }

        logInfo(`Alert sent: ${alert.type}`, { sent, failed, userIds })
        return { sent, failed }
    } catch (error) {
        logError('Error sending alert:', error)
        return { sent: 0, failed: 0 }
    }
}

// ==========================================
// SPECIFIC ALERT TRIGGERS
// ==========================================

/**
 * Trigger low stock alert
 */
export async function triggerLowStockAlert(
    productId: number,
    productName: string,
    currentStock: number,
    minStock: number
): Promise<void> {
    await sendAlert({
        type: 'low_stock',
        title: '⚠️ Stock Bajo',
        body: `${productName}: quedan ${currentStock} unidades (mínimo: ${minStock})`,
        url: `/inventory/${productId}`,
        data: { productId, currentStock, minStock }
    })
}

/**
 * Trigger high value sale alert
 */
export async function triggerHighValueSaleAlert(
    saleId: number,
    total: number,
    clientName?: string
): Promise<void> {
    const formattedTotal = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(total)

    await sendAlert({
        type: 'high_value_sale',
        title: '💰 Venta de Alto Valor',
        body: `Nueva venta por ${formattedTotal}${clientName ? ` - ${clientName}` : ''}`,
        url: `/sales/history`,
        data: { saleId, total }
    })
}

/**
 * Trigger new sale alert (for supervisors who want to track all sales)
 */
export async function triggerNewSaleAlert(
    saleId: number,
    total: number,
    sellerName: string
): Promise<void> {
    const formattedTotal = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(total)

    await sendAlert({
        type: 'new_sale',
        title: '🛒 Nueva Venta',
        body: `${sellerName} realizó una venta por ${formattedTotal}`,
        url: `/sales/history`,
        data: { saleId, total, sellerName }
    })
}

/**
 * Trigger cash drawer alert
 */
export async function triggerCashDrawerAlert(
    action: 'opened' | 'closed',
    drawerName: string,
    userName: string,
    amount?: number
): Promise<void> {
    const actionText = action === 'opened' ? 'abrió' : 'cerró'
    const amountText = amount
        ? ` - $${amount.toLocaleString('es-AR')}`
        : ''

    await sendAlert({
        type: 'cash_drawer',
        title: `🧾 Caja ${action === 'opened' ? 'Abierta' : 'Cerrada'}`,
        body: `${userName} ${actionText} ${drawerName}${amountText}`,
        url: `/sales/drawer`,
        data: { action, drawerName, userName, amount }
    })
}

/**
 * Trigger new employee alert
 */
export async function triggerNewEmployeeAlert(
    employeeName: string,
    role: string
): Promise<void> {
    await sendAlert({
        type: 'new_employee',
        title: '👤 Nuevo Empleado',
        body: `${employeeName} fue registrado como ${role}`,
        url: `/users`,
        data: { employeeName, role }
    })
}
