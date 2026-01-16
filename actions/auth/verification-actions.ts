"use server"

import { db } from "@/lib/db"
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email"
import { getSession } from "./session-actions"

// Resend verification email
export async function resendVerificationEmailAction(): Promise<{ 
    success: boolean; 
    error?: string 
}> {
    const session = await getSession()
    if (!session) return { success: false, error: "No autenticado" }

    const user = await db.user.findUnique({
        where: { id: session.id },
        select: { 
            name: true, 
            email: true, 
            emailVerified: true,
            emailVerificationToken: true 
        }
    })

    if (!user) return { success: false, error: "Usuario no encontrado" }
    if (user.emailVerified) return { success: false, error: "Email ya verificado" }

    // Generate new token
    const token = generateVerificationToken()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await db.user.update({
        where: { id: session.id },
        data: {
            emailVerificationToken: token,
            emailVerificationExpires: expires
        }
    })

    const sent = await sendVerificationEmail(user.email, user.name, token)
    if (!sent) {
        return { success: false, error: "Error al enviar email" }
    }

    return { success: true }
}
