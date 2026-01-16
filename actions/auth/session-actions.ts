"use server"

import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { getUserPermissions, type SystemRole } from '@/lib/permissions'
import type { SessionUser, UserRole, JWTPayload } from './types'

// Note: Types are re-exported from index.ts, not from this server action file

// Get current session
export async function getSession(): Promise<SessionUser | null> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("session")?.value

        if (!token) {
            return null
        }

        const payload = verifyToken(token) as JWTPayload | null
        if (!payload || !payload.userId) {
            return null
        }

        const user = await db.user.findUnique({
            where: { id: payload.userId },
            select: { 
                id: true, 
                name: true, 
                email: true, 
                role: true, 
                active: true,
                organizationId: true,
                permissions: true,
                emailVerified: true,
                organization: {
                    select: {
                        name: true,
                        plan: true,
                        planStatus: true
                    }
                }
            }
        })

        if (!user || !user.active) {
            return null
        }

        // Get permissions combining role + custom permissions
        const permissions = getUserPermissions(user.role as SystemRole, user.permissions)

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as UserRole,
            organizationId: user.organizationId,
            organizationName: user.organization?.name || null,
            plan: user.organization?.plan || null,
            planStatus: user.organization?.planStatus || null,
            permissions,
            emailVerified: !!user.emailVerified
        }
    } catch {
        return null
    }
}

// Check if user has required role
export async function hasRole(requiredRoles: UserRole[]): Promise<boolean> {
    const session = await getSession()
    if (!session) return false
    return requiredRoles.includes(session.role)
}

// Require authentication - throws if not authenticated
export async function requireAuth(): Promise<SessionUser> {
    const session = await getSession()
    if (!session) {
        throw new Error("No autenticado")
    }
    return session
}

// Require specific role - throws if not authorized
export async function requireRole(requiredRoles: UserRole[]): Promise<SessionUser> {
    const session = await requireAuth()
    if (!requiredRoles.includes(session.role)) {
        throw new Error("No autorizado")
    }
    return session
}

// Get organization ID from session
export async function getOrganizationId(): Promise<number | null> {
    const session = await getSession()
    return session?.organizationId || null
}

// Require organization - throws if user has no organization
export async function requireOrganization(): Promise<{ session: SessionUser; organizationId: number }> {
    const session = await requireAuth()
    if (!session.organizationId) {
        throw new Error("Usuario sin organización")
    }
    return { session, organizationId: session.organizationId }
}

// Logout user
export async function logoutUser() {
    const { logAudit } = await import('@/actions/auth/audit-actions')
    const { headers } = await import('next/headers')
    const { getClientIP } = await import('@/lib/security/rate-limiter')
    
    const session = await getSession()
    if (session) {
        const headersList = await headers()
        const ip = getClientIP(headersList)
        await logAudit(session.id, "logout", "user", session.id, "Cierre de sesión", ip, session.organizationId)
    }
    const cookieStore = await cookies()
    cookieStore.delete('session')
    return { success: true }
}
