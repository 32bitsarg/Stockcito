"use server"

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/actions/auth-actions'
import { logError } from '@/lib/logger'
import Decimal from 'decimal.js'

// ==========================================
// NOTIFICATION SETTINGS
// ==========================================

export interface NotificationSettingsData {
    pushEnabled: boolean
    emailEnabled: boolean
    lowStock: boolean
    lowStockThreshold: number
    dailySummary: boolean
    dailySummaryTime: string
    newSale: boolean
    highValueSale: boolean
    highValueThreshold: number
    cashDrawerAlerts: boolean
    newEmployee: boolean
}

/**
 * Get notification settings for current user
 */
export async function getNotificationSettings(): Promise<NotificationSettingsData | null> {
    const session = await getSession()
    if (!session) return null

    const settings = await db.notificationSetting.findUnique({
        where: { userId: session.id }
    })

    if (!settings) {
        // Return defaults if no settings exist
        return {
            pushEnabled: true,
            emailEnabled: true,
            lowStock: true,
            lowStockThreshold: 5,
            dailySummary: false,
            dailySummaryTime: "20:00",
            newSale: false,
            highValueSale: true,
            highValueThreshold: 10000,
            cashDrawerAlerts: true,
            newEmployee: true
        }
    }

    return {
        pushEnabled: settings.pushEnabled,
        emailEnabled: settings.emailEnabled,
        lowStock: settings.lowStock,
        lowStockThreshold: settings.lowStockThreshold,
        dailySummary: settings.dailySummary,
        dailySummaryTime: settings.dailySummaryTime,
        newSale: settings.newSale,
        highValueSale: settings.highValueSale,
        highValueThreshold: Number(settings.highValueThreshold),
        cashDrawerAlerts: settings.cashDrawerAlerts,
        newEmployee: settings.newEmployee
    }
}

/**
 * Update notification settings for current user
 */
export async function updateNotificationSettings(
    data: Partial<NotificationSettingsData>
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'No autenticado' }
        }

        await db.notificationSetting.upsert({
            where: { userId: session.id },
            create: {
                userId: session.id,
                pushEnabled: data.pushEnabled ?? true,
                emailEnabled: data.emailEnabled ?? true,
                lowStock: data.lowStock ?? true,
                lowStockThreshold: data.lowStockThreshold ?? 5,
                dailySummary: data.dailySummary ?? false,
                dailySummaryTime: data.dailySummaryTime ?? "20:00",
                newSale: data.newSale ?? false,
                highValueSale: data.highValueSale ?? true,
                highValueThreshold: data.highValueThreshold ?? 10000,
                cashDrawerAlerts: data.cashDrawerAlerts ?? true,
                newEmployee: data.newEmployee ?? true
            },
            update: {
                ...data,
                highValueThreshold: data.highValueThreshold
                    ? new Decimal(data.highValueThreshold)
                    : undefined
            }
        })

        revalidatePath('/profile')
        return { success: true }
    } catch (error) {
        logError('Error updating notification settings:', error)
        return { success: false, error: 'Error al guardar configuración' }
    }
}

// ==========================================
// PUSH SUBSCRIPTIONS
// ==========================================

interface PushSubscriptionData {
    endpoint: string
    keys: {
        p256dh: string
        auth: string
    }
}

/**
 * Save push subscription for current user
 */
export async function savePushSubscription(
    subscription: PushSubscriptionData
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'No autenticado' }
        }

        // Check if this endpoint already exists for user
        const existing = await db.pushSubscription.findFirst({
            where: {
                userId: session.id,
                endpoint: subscription.endpoint
            }
        })

        if (existing) {
            // Update existing subscription
            await db.pushSubscription.update({
                where: { id: existing.id },
                data: {
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth
                }
            })
        } else {
            // Create new subscription
            await db.pushSubscription.create({
                data: {
                    userId: session.id,
                    endpoint: subscription.endpoint,
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth
                }
            })
        }

        return { success: true }
    } catch (error) {
        logError('Error saving push subscription:', error)
        return { success: false, error: 'Error al guardar suscripción' }
    }
}

/**
 * Remove push subscription
 */
export async function removePushSubscription(
    endpoint: string
): Promise<{ success: boolean }> {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false }
        }

        await db.pushSubscription.deleteMany({
            where: {
                userId: session.id,
                endpoint
            }
        })

        return { success: true }
    } catch (error) {
        logError('Error removing push subscription:', error)
        return { success: false }
    }
}

// ==========================================
// ORGANIZATION FEATURES
// ==========================================

export interface OrganizationFeaturesData {
    kitchenDisplay: boolean
    tableManagement: boolean
    barcodeScan: boolean
    offlineMode: boolean
    alertsEnabled: boolean
}

/**
 * Get organization features
 */
export async function getOrganizationFeatures(): Promise<OrganizationFeaturesData | null> {
    const session = await getSession()
    if (!session?.organizationId) return null

    const features = await db.organizationFeatures.findUnique({
        where: { organizationId: session.organizationId }
    })

    if (!features) {
        // Return defaults
        return {
            kitchenDisplay: false,
            tableManagement: false,
            barcodeScan: true,
            offlineMode: true,
            alertsEnabled: true
        }
    }

    return {
        kitchenDisplay: features.kitchenDisplay,
        tableManagement: features.tableManagement,
        barcodeScan: features.barcodeScan,
        offlineMode: features.offlineMode,
        alertsEnabled: features.alertsEnabled
    }
}

/**
 * Update organization features (Admin only)
 */
export async function updateOrganizationFeatures(
    data: Partial<OrganizationFeaturesData>
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await getSession()
        if (!session?.organizationId) {
            return { success: false, error: 'No autenticado' }
        }

        if (session.role !== 'owner' && session.role !== 'admin') {
            return { success: false, error: 'Sin permisos para modificar features' }
        }

        await db.organizationFeatures.upsert({
            where: { organizationId: session.organizationId },
            create: {
                organizationId: session.organizationId,
                kitchenDisplay: data.kitchenDisplay ?? false,
                tableManagement: data.tableManagement ?? false,
                barcodeScan: data.barcodeScan ?? true,
                offlineMode: data.offlineMode ?? true,
                alertsEnabled: data.alertsEnabled ?? true
            },
            update: data
        })

        revalidatePath('/profile')
        return { success: true }
    } catch (error) {
        logError('Error updating organization features:', error)
        return { success: false, error: 'Error al guardar configuración' }
    }
}
