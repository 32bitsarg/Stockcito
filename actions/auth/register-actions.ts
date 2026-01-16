"use server"
import { authLogger } from '@/lib/logger'

import { z } from "zod"
import { cookies, headers } from "next/headers"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/password"
import { signToken } from "@/lib/jwt"
import { sendVerificationEmail, generateVerificationToken } from "@/lib/email"
import { checkRateLimit, getClientIP } from "@/lib/security/rate-limiter"
import { sanitizeEmail, sanitizeString } from "@/lib/security/sanitizer"
import { registerSchema } from "@/lib/schemas"
import { regenerateBusinessCode } from "@/lib/business-code"

const TRIAL_DAYS = 7

// Generate unique business code from business name
async function generateBusinessCode(businessName: string): Promise<string> {
    const baseCode = businessName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 0)
        .map(w => w.slice(0, 3).toUpperCase())
        .join("")
        .slice(0, 6)
        .padEnd(4, "X")

    // Check uniqueness and add suffix if needed
    let code = baseCode
    let suffix = 1
    while (await db.organization.findUnique({ where: { businessCode: code } })) {
        code = `${baseCode}${suffix}`
        suffix++
    }
    return code
}

// Generate URL-safe slug from business name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 50) + '-' + Date.now().toString(36)
}

export async function registerUser(data: z.infer<typeof registerSchema>) {
    const result = registerSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten().fieldErrors }

    const headersList = await headers()
    const ip = getClientIP(headersList)

    // Rate limiting
    const rateCheck = checkRateLimit(ip, 'register')
    if (!rateCheck.allowed) {
        return { error: `Demasiados intentos. Intenta de nuevo en ${Math.ceil(rateCheck.resetIn / 60)} minutos.` }
    }

    const { name, email, password, businessName } = result.data
    const sanitizedEmail = sanitizeEmail(email)
    const sanitizedName = sanitizeString(name)
    const sanitizedBusinessName = sanitizeString(businessName)

    const existing = await db.user.findUnique({ where: { email: sanitizedEmail } })
    if (existing) return { error: 'El email ya está registrado' }

    const hashed = await hashPassword(password)

    // Generate unique business code from business name
    const businessCode = await generateBusinessCode(sanitizedBusinessName)
    
    // Generate email verification token
    const verificationToken = generateVerificationToken()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create organization and user in transaction
    const now = new Date()
    const trialEnd = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)

    const result2 = await db.$transaction(async (tx) => {
        // Create organization with trial and business code
        const org = await tx.organization.create({
            data: {
                name: sanitizedBusinessName,
                slug: generateSlug(sanitizedBusinessName),
                email: sanitizedEmail,
                businessCode: businessCode,
                plan: 'free',
                planStatus: 'trial',
                trialStartedAt: now,
                trialEndsAt: trialEnd,
                lastVerifiedAt: now
            }
        })

        // Create owner user (the person who registered the business)
        const user = await tx.user.create({
            data: {
                name: sanitizedName,
                email: sanitizedEmail,
                password: hashed,
                role: 'owner',
                organizationId: org.id,
                emailVerificationToken: verificationToken,
                emailVerificationExpires: verificationExpires
            }
        })

        // Log trial started
        await tx.subscriptionLog.create({
            data: {
                organizationId: org.id,
                event: 'trial_started',
                toPlan: 'premium',
                details: JSON.stringify({ trialDays: TRIAL_DAYS, endsAt: trialEnd.toISOString() })
            }
        })

        return { user, org }
    })

    // Send verification email (non-blocking)
    sendVerificationEmail(sanitizedEmail, sanitizedName, verificationToken)
        .catch(err => authLogger.error('Failed to send verification email', err))

    // Create JWT with organization info
    const token = signToken({ 
        userId: result2.user.id, 
        role: result2.user.role,
        organizationId: result2.org.id
    })
    const cookieStore = await cookies()
    cookieStore.set({ 
        name: 'session', 
        value: token, 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        path: '/', 
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
    })

    // Log audit (dynamic import to avoid circular dependency)
    const { logAudit } = await import('./audit-actions')
    await logAudit(result2.user.id, "register", "user", result2.user.id, "Registro de nuevo usuario y organización", ip, result2.org.id)

    return { 
        success: true, 
        user: { 
            id: result2.user.id, 
            name: result2.user.name, 
            email: result2.user.email,
            organizationId: result2.org.id,
            businessCode: result2.org.businessCode,
            trialEndsAt: trialEnd,
            emailVerificationPending: true
        } 
    }
}
