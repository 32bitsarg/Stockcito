"use server"

import { db } from "@/lib/db"
import { getSession } from "@/actions/auth-actions"

/**
 * Obtiene el perfil del usuario actual con datos seguros.
 * 
 * SEGURIDAD:
 * - Valida sesión internamente
 * - Solo retorna datos del usuario autenticado (no acepta userId externo)
 * - No retorna datos sensibles (password hash, tokens)
 * - El pin se retorna como boolean (hasPin), nunca el valor real
 */
export async function getUserProfile() {
    const session = await getSession()
    if (!session) return null

    try {
        const user = await db.user.findUnique({
            where: { id: session.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                pin: true,
                emailVerified: true,
                createdAt: true,
                organizationId: true,
                _count: {
                    select: { sales: true }
                }
            }
        })

        if (!user) return null

        // Get organization data for owners
        let organization: { name: string; businessCode: string } | undefined
        if (user.role === 'owner' && user.organizationId) {
            const org = await db.organization.findUnique({
                where: { id: user.organizationId },
                select: { name: true, businessCode: true }
            })
            if (org) {
                organization = org
            }
        }

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                hasPin: !!user.pin,
                createdAt: user.createdAt.toISOString(),
                salesCount: user._count.sales
            },
            organization,
            emailVerified: !!user.emailVerified,
            isAdmin: ['owner', 'admin'].includes(user.role),
            isOwner: user.role === 'owner'
        }
    } catch (error) {
        console.error("Error fetching user profile:", error)
        return null
    }
}
