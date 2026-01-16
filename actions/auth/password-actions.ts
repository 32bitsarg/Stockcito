"use server"
import { authLogger } from '@/lib/logger'

import { db } from "@/lib/db"
import { hashPassword, verifyPassword } from "@/lib/password"
import { regenerateBusinessCode } from "@/lib/business-code"
import { sendRegenerateCodeConfirmation, sendBusinessCodeRegenerated } from "@/lib/email"
import { revalidatePath } from "next/cache"
import { getSession, requireAuth } from "./session-actions"
import { logAudit } from "./audit-actions"

// Change password (current user)
export async function changePassword(
    currentPassword: string, 
    newPassword: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await requireAuth()

        const user = await db.user.findUnique({
            where: { id: session.id }
        })

        if (!user) {
            return { success: false, error: "Usuario no encontrado" }
        }

        const isValid = await verifyPassword(user.password, currentPassword)
        if (!isValid) {
            return { success: false, error: "Contraseña actual incorrecta" }
        }

        const hashedPassword = await hashPassword(newPassword)
        await db.user.update({
            where: { id: session.id },
            data: { password: hashedPassword }
        })

        await logAudit(session.id, "change_password", "user", session.id, "Cambio de contraseña")

        return { success: true }
    } catch (error) {
        authLogger.error('Change password error:', error)
        return { success: false, error: "Error al cambiar contraseña" }
    }
}

// Request business code regeneration - sends confirmation email
export async function requestBusinessCodeRegeneration(): Promise<{ 
    success: boolean; 
    error?: string 
}> {
    const session = await getSession()
    if (!session) return { success: false, error: "No autenticado" }
    if (session.role !== 'owner') return { success: false, error: "Solo el propietario puede regenerar el código" }
    if (!session.organizationId) return { success: false, error: "Sin organización" }

    const user = await db.user.findUnique({
        where: { id: session.id },
        select: { name: true, email: true }
    })

    const org = await db.organization.findUnique({
        where: { id: session.organizationId },
        select: { businessCode: true }
    })

    if (!user || !org) return { success: false, error: "Datos no encontrados" }

    // Generate 6-digit confirmation code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store code in database (upsert to replace any existing code)
    await db.temporaryCode.upsert({
        where: {
            organizationId_type: {
                organizationId: session.organizationId,
                type: 'business_code_regeneration'
            }
        },
        create: {
            organizationId: session.organizationId,
            type: 'business_code_regeneration',
            code,
            data: JSON.stringify({ oldCode: org.businessCode }),
            expiresAt
        },
        update: {
            code,
            data: JSON.stringify({ oldCode: org.businessCode }),
            expiresAt,
            usedAt: null
        }
    })

    // Send confirmation email
    const sent = await sendRegenerateCodeConfirmation(user.email, user.name, code)
    if (!sent) {
        return { success: false, error: "Error al enviar email de confirmación" }
    }

    return { success: true }
}

// Confirm business code regeneration with the code from email
export async function confirmBusinessCodeRegeneration(confirmationCode: string): Promise<{ 
    success: boolean; 
    error?: string;
    newCode?: string 
}> {
    const session = await getSession()
    if (!session) return { success: false, error: "No autenticado" }
    if (session.role !== 'owner') return { success: false, error: "Solo el propietario puede regenerar el código" }
    if (!session.organizationId) return { success: false, error: "Sin organización" }

    // Get stored code from database
    const stored = await db.temporaryCode.findUnique({
        where: {
            organizationId_type: {
                organizationId: session.organizationId,
                type: 'business_code_regeneration'
            }
        }
    })

    if (!stored || stored.usedAt) {
        return { success: false, error: "No hay solicitud pendiente. Inicia el proceso nuevamente." }
    }

    if (new Date() > stored.expiresAt) {
        // Delete expired code
        await db.temporaryCode.delete({ where: { id: stored.id } })
        return { success: false, error: "El código ha expirado. Solicita uno nuevo." }
    }

    if (stored.code !== confirmationCode) {
        return { success: false, error: "Código de confirmación incorrecto" }
    }

    // Parse stored data
    const storedData = stored.data ? JSON.parse(stored.data) : {}
    const oldCode = storedData.oldCode || ''

    // Get organization for name
    const org = await db.organization.findUnique({
        where: { id: session.organizationId },
        select: { name: true }
    })

    if (!org) return { success: false, error: "Organización no encontrada" }

    // Regenerate the code
    const newCode = await regenerateBusinessCode(session.organizationId, org.name)

    // Get user for email notification
    const user = await db.user.findUnique({
        where: { id: session.id },
        select: { name: true, email: true }
    })

    if (user) {
        // Send notification email
        await sendBusinessCodeRegenerated(user.email, user.name, org.name, oldCode, newCode)
    }

    // Mark code as used and delete it
    await db.temporaryCode.delete({ where: { id: stored.id } })

    await logAudit(session.id, "regenerate_business_code", "organization", session.organizationId, 
        `Código regenerado de ${oldCode} a ${newCode}`)

    revalidatePath('/profile')

    return { success: true, newCode }
}
