"use server"
import { employeeLogger } from '@/lib/logger'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { requireOrganization, getSession, logAudit } from '@/actions/auth'
import { hashPassword, verifyPassword } from '@/lib/password'
import { signToken } from '@/lib/jwt'
import { headers, cookies } from 'next/headers'
import { getClientIP } from '@/lib/security/rate-limiter'

// ==========================================
// PIN MANAGEMENT
// ==========================================

/**
 * Establecer PIN para el usuario actual
 */
export async function setPin(pin: string): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'No autenticado' }

        if (!/^\d{4,6}$/.test(pin)) {
            return { success: false, error: 'El PIN debe tener entre 4 y 6 dígitos' }
        }

        const hashedPin = await hashPassword(pin)

        await db.user.update({
            where: { id: session.id },
            data: { pin: hashedPin }
        })

        await logAudit(session.id, 'set_pin', 'user', session.id, 'PIN establecido')
        
        return { success: true }
    } catch (error) {
        employeeLogger.error('Set PIN error:', error)
        return { success: false, error: 'Error al establecer PIN' }
    }
}

/**
 * Verificar PIN de un usuario
 */
export async function verifyPin(
    userId: number, 
    pin: string
): Promise<{ success: boolean; user?: { id: number; name: string; role: string }; error?: string }> {
    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, role: true, pin: true, active: true }
        })

        if (!user || !user.active) {
            return { success: false, error: 'Usuario no encontrado o inactivo' }
        }

        if (!user.pin) {
            return { success: false, error: 'Usuario no tiene PIN configurado' }
        }

        const isValid = await verifyPassword(user.pin, pin)
        if (!isValid) {
            return { success: false, error: 'PIN incorrecto' }
        }

        return { 
            success: true, 
            user: { id: user.id, name: user.name, role: user.role } 
        }
    } catch (error) {
        employeeLogger.error('Verify PIN error:', error)
        return { success: false, error: 'Error al verificar PIN' }
    }
}

/**
 * Login rápido con PIN (cambia el usuario activo - establece nueva sesión JWT)
 */
export async function quickLoginWithPin(
    userId: number,
    pin: string
): Promise<{ 
    success: boolean
    user?: { id: number; name: string; role: string; email: string }
    error?: string 
}> {
    const headersList = await headers()
    const ip = getClientIP(headersList)

    // Obtener usuario completo para crear sesión
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { 
            id: true, 
            name: true, 
            email: true,
            role: true, 
            pin: true, 
            active: true,
            organizationId: true
        }
    })

    if (!user || !user.active) {
        return { success: false, error: 'Usuario no encontrado o inactivo' }
    }

    if (!user.pin) {
        return { success: false, error: 'Usuario no tiene PIN configurado' }
    }

    const isValid = await verifyPassword(user.pin, pin)
    if (!isValid) {
        return { success: false, error: 'PIN incorrecto' }
    }

    // Crear nuevo token JWT para este usuario
    const token = signToken({ 
        userId: user.id, 
        role: user.role,
        organizationId: user.organizationId || undefined
    })

    // Establecer cookie de sesión
    const cookieStore = await cookies()
    cookieStore.set({ 
        name: 'session', 
        value: token, 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        path: '/', 
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 días
    })

    await logAudit(user.id, 'quick_login', 'user', user.id, 'Login rápido con PIN', ip, user.organizationId || undefined)
    
    return { 
        success: true,
        user: { 
            id: user.id, 
            name: user.name, 
            email: user.email,
            role: user.role 
        }
    }
}

/**
 * Obtener usuarios con PIN para selector rápido
 */
export async function getUsersWithPin(): Promise<{
    id: number
    name: string
    role: string
    hasPin: boolean
}[]> {
    const { organizationId } = await requireOrganization()

    const users = await db.user.findMany({
        where: { 
            organizationId,
            active: true
        },
        select: {
            id: true,
            name: true,
            role: true,
            pin: true
        },
        orderBy: { name: 'asc' }
    })

    return users.map(u => ({
        id: u.id,
        name: u.name,
        role: u.role,
        hasPin: !!u.pin
    }))
}
