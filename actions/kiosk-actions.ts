"use server"
import { logError } from '@/lib/logger'

import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { signToken, verifyToken } from '@/lib/jwt'
import { revalidatePath } from 'next/cache'
import { getSession } from './auth-actions'
import { getUserPermissions, type SystemRole } from '@/lib/permissions'

// ==========================================
// KIOSK MODE - Multi-tenant employee access
// ==========================================

export interface KioskSettings {
    enabled: boolean
    autoLockMinutes: number  // 0 = disabled
    requireClockIn: boolean  // Require clock-in before operations
    allowedPages: string[]   // Pages available in kiosk mode
}

export interface KioskSession {
    // Device session (owner who set up the kiosk)
    deviceUserId: number
    deviceUserName: string
    organizationId: number
    organizationName: string

    // Active employee (who's currently using)
    activeEmployeeId: number | null
    activeEmployeeName: string | null
    activeEmployeeRole: string | null

    // Kiosk settings
    kioskMode: boolean
    lastActivity: number  // timestamp
}

const DEFAULT_KIOSK_SETTINGS: KioskSettings = {
    enabled: false,
    autoLockMinutes: 5,
    requireClockIn: false,
    allowedPages: ['/sales', '/sales/new', '/inventory', '/clients', '/users/time']
}

// ==========================================
// KIOSK CONFIGURATION
// ==========================================

/**
 * Get kiosk settings for current organization
 */
export async function getKioskSettings(): Promise<KioskSettings> {
    const session = await getSession()
    if (!session?.organizationId) {
        return DEFAULT_KIOSK_SETTINGS
    }

    const org = await db.organization.findUnique({
        where: { id: session.organizationId },
        select: { settings: true }
    })

    if (!org?.settings) {
        return DEFAULT_KIOSK_SETTINGS
    }

    try {
        const settings = JSON.parse(org.settings)
        return {
            ...DEFAULT_KIOSK_SETTINGS,
            ...settings.kiosk
        }
    } catch {
        return DEFAULT_KIOSK_SETTINGS
    }
}

/**
 * Update kiosk settings (owner/admin only)
 */
export async function updateKioskSettings(newSettings: Partial<KioskSettings>): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await getSession()
        if (!session?.organizationId) {
            return { success: false, error: "No autenticado" }
        }

        // Only owner/admin can change kiosk settings
        if (!['owner', 'admin'].includes(session.role)) {
            return { success: false, error: "No autorizado" }
        }

        const org = await db.organization.findUnique({
            where: { id: session.organizationId },
            select: { settings: true }
        })

        let currentSettings: Record<string, unknown> = {}
        if (org?.settings) {
            try {
                currentSettings = JSON.parse(org.settings)
            } catch {
                currentSettings = {}
            }
        }

        currentSettings.kiosk = {
            ...DEFAULT_KIOSK_SETTINGS,
            ...(currentSettings.kiosk || {}),
            ...newSettings
        }

        await db.organization.update({
            where: { id: session.organizationId },
            data: { settings: JSON.stringify(currentSettings) }
        })

        revalidatePath('/setup')
        return { success: true }
    } catch (error) {
        logError('Error updating kiosk settings:', error)
        return { success: false, error: "Error al guardar configuración" }
    }
}

// ==========================================
// KIOSK SESSION MANAGEMENT
// ==========================================

/**
 * Enable kiosk mode on this device
 * Only owner/admin can enable kiosk mode
 */
export async function enableKioskMode(): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await getSession()
        if (!session?.organizationId) {
            return { success: false, error: "No autenticado" }
        }

        if (!['owner', 'admin'].includes(session.role)) {
            return { success: false, error: "Solo el dueño o admin puede activar modo kiosco" }
        }

        // Create kiosk session cookie
        const kioskData: KioskSession = {
            deviceUserId: session.id,
            deviceUserName: session.name,
            organizationId: session.organizationId,
            organizationName: session.organizationName || '',
            activeEmployeeId: session.id,
            activeEmployeeName: session.name,
            activeEmployeeRole: session.role,
            kioskMode: true,
            lastActivity: Date.now()
        }

        const token = signToken({
            type: 'kiosk',
            ...kioskData
        }, '30d')  // Kiosk session lasts 30 days

        const cookieStore = await cookies()
        cookieStore.set('kiosk_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30  // 30 days
        })

        return { success: true }
    } catch (error) {
        logError('Error enabling kiosk mode:', error)
        return { success: false, error: "Error al activar modo kiosco" }
    }
}

/**
 * Disable kiosk mode (requires owner/admin PIN)
 */
export async function disableKioskMode(pin: string): Promise<{ success: boolean; error?: string }> {
    try {
        const kioskSession = await getKioskSession()
        if (!kioskSession) {
            return { success: false, error: "Modo kiosco no activo" }
        }

        // Verify owner/admin PIN
        const user = await db.user.findFirst({
            where: {
                organizationId: kioskSession.organizationId,
                pin: pin,
                role: { in: ['owner', 'admin'] },
                active: true
            }
        })

        if (!user) {
            return { success: false, error: "PIN incorrecto o sin permisos" }
        }

        // Remove kiosk session
        const cookieStore = await cookies()
        cookieStore.delete('kiosk_session')

        return { success: true }
    } catch (error) {
        logError('Error disabling kiosk mode:', error)
        return { success: false, error: "Error al desactivar modo kiosco" }
    }
}

/**
 * Get current kiosk session
 */
export async function getKioskSession(): Promise<KioskSession | null> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('kiosk_session')?.value

        if (!token) {
            return null
        }

        const payload = verifyToken(token) as (KioskSession & { type: string }) | null
        if (!payload || payload.type !== 'kiosk') {
            return null
        }

        return {
            deviceUserId: payload.deviceUserId,
            deviceUserName: payload.deviceUserName,
            organizationId: payload.organizationId,
            organizationName: payload.organizationName,
            activeEmployeeId: payload.activeEmployeeId,
            activeEmployeeName: payload.activeEmployeeName,
            activeEmployeeRole: payload.activeEmployeeRole,
            kioskMode: payload.kioskMode,
            lastActivity: payload.lastActivity
        }
    } catch {
        return null
    }
}

/**
 * Switch active employee in kiosk mode (PIN login)
 */
export async function kioskLoginWithPin(pin: string): Promise<{
    success: boolean
    error?: string
    employee?: {
        id: number
        name: string
        role: string
    }
}> {
    try {
        const kioskSession = await getKioskSession()
        if (!kioskSession) {
            return { success: false, error: "Modo kiosco no activo" }
        }

        // Find employee by PIN in this organization
        const employee = await db.user.findFirst({
            where: {
                organizationId: kioskSession.organizationId,
                pin: pin,
                active: true
            },
            select: {
                id: true,
                name: true,
                role: true,
                permissions: true
            }
        })

        if (!employee) {
            return { success: false, error: "PIN incorrecto" }
        }

        // Update kiosk session with new active employee
        const updatedKiosk: KioskSession = {
            ...kioskSession,
            activeEmployeeId: employee.id,
            activeEmployeeName: employee.name,
            activeEmployeeRole: employee.role,
            lastActivity: Date.now()
        }

        const token = signToken({
            type: 'kiosk',
            ...updatedKiosk
        }, '30d')

        const cookieStore = await cookies()
        cookieStore.set('kiosk_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30
        })

        // Also update the main session cookie to reflect active employee
        const permissions = getUserPermissions(employee.role as SystemRole, employee.permissions)

        const sessionToken = signToken({
            userId: employee.id,
            role: employee.role,
            organizationId: kioskSession.organizationId
        }, '24h')

        cookieStore.set('session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24
        })

        revalidatePath('/')

        return {
            success: true,
            employee: {
                id: employee.id,
                name: employee.name,
                role: employee.role
            }
        }
    } catch (error) {
        logError('Error in kiosk login:', error)
        return { success: false, error: "Error al iniciar sesión" }
    }
}

/**
 * Lock kiosk (return to PIN screen without logging out device)
 */
export async function lockKiosk(): Promise<{ success: boolean }> {
    try {
        const kioskSession = await getKioskSession()
        if (!kioskSession) {
            return { success: false }
        }

        // Clear active employee but keep device session
        const updatedKiosk: KioskSession = {
            ...kioskSession,
            activeEmployeeId: null,
            activeEmployeeName: null,
            activeEmployeeRole: null,
            lastActivity: Date.now()
        }

        const token = signToken({
            type: 'kiosk',
            ...updatedKiosk
        }, '30d')

        const cookieStore = await cookies()
        cookieStore.set('kiosk_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30
        })

        // Don't clear main session - redirect will handle showing PIN pad

        return { success: true }
    } catch {
        return { success: false }
    }
}

/**
 * Update last activity timestamp (call on user interaction)
 */
export async function updateKioskActivity(): Promise<void> {
    try {
        const kioskSession = await getKioskSession()
        if (!kioskSession || !kioskSession.activeEmployeeId) {
            return
        }

        const updatedKiosk: KioskSession = {
            ...kioskSession,
            lastActivity: Date.now()
        }

        const token = signToken({
            type: 'kiosk',
            ...updatedKiosk
        }, '30d')

        const cookieStore = await cookies()
        cookieStore.set('kiosk_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30
        })
    } catch {
        // Silently fail
    }
}

/**
 * Check if kiosk should auto-lock based on inactivity
 */
export async function shouldAutoLock(): Promise<boolean> {
    const kioskSession = await getKioskSession()
    if (!kioskSession || !kioskSession.activeEmployeeId) {
        return false
    }

    const settings = await getKioskSettings()
    if (!settings.autoLockMinutes || settings.autoLockMinutes <= 0) {
        return false
    }

    const inactiveMs = Date.now() - kioskSession.lastActivity
    const autoLockMs = settings.autoLockMinutes * 60 * 1000

    return inactiveMs >= autoLockMs
}

/**
 * Get list of employees for kiosk PIN selection
 */
export async function getKioskEmployees(): Promise<Array<{ id: number; name: string; role: string; initials: string; hasPin: boolean }>> {
    const kioskSession = await getKioskSession()
    if (!kioskSession) {
        return []
    }

    const employees = await db.user.findMany({
        where: {
            organizationId: kioskSession.organizationId,
            active: true
            // Removed pin: { not: null } filter to show all employees
        },
        select: {
            id: true,
            name: true,
            role: true,
            pin: true
        },
        orderBy: { name: 'asc' }
    })

    return employees.map(e => ({
        id: e.id,
        name: e.name,
        role: e.role,
        initials: e.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        hasPin: !!e.pin
    }))
}
