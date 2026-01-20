"use server"
import { authLogger } from '@/lib/logger'

import { db } from "@/lib/db"
import { hashPassword } from "@/lib/password"
import { sendEmployeeCredentials } from "@/lib/email"
import { revalidatePath } from "next/cache"
import { requireOrganization, requireRole } from "./session-actions"
import { logAudit } from "./audit-actions"
import { UserRole } from "./types"

// Get all users (admin only) - filtered by organization
export async function getUsers(): Promise<any[]> {
    const { session, organizationId } = await requireOrganization()

    // Only owner/admin can view users
    if (!['owner', 'admin'].includes(session.role)) {
        return []
    }

    return db.user.findMany({
        where: {
            organizationId: organizationId
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            active: true,
            createdAt: true,
            _count: {
                select: { sales: true }
            }
        },
        orderBy: { name: 'asc' }
    })
}

// Get user by ID - must be in same organization
export async function getUserById(id: number) {
    const { session, organizationId } = await requireOrganization()

    if (!['owner', 'admin'].includes(session.role)) {
        return null
    }

    return db.user.findFirst({
        where: {
            id,
            organizationId: organizationId
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            active: true,
            createdAt: true
        }
    })
}

// Create user (owner/admin only) - assigns to same organization
export async function createUser(data: {
    name: string
    email: string
    password?: string
    pin?: string
    role: UserRole
}): Promise<{
    success: boolean;
    error?: string;
    credentials?: {
        email: string;
        businessCode?: string;
        pin?: string;
        password?: string;
    }
}> {
    try {
        const { session, organizationId } = await requireOrganization()

        // Only owner/admin can create users
        if (!['owner', 'admin'].includes(session.role)) {
            return { success: false, error: "No autorizado" }
        }

        // Check if email is verified (required to create employees)
        if (!session.emailVerified && session.role === 'owner') {
            return { success: false, error: "Debes verificar tu email antes de crear empleados" }
        }

        // Prevent creating users with higher role than yourself
        const roleHierarchy = ['viewer', 'waiter', 'cashier', 'manager', 'admin', 'owner']
        const myRoleIndex = roleHierarchy.indexOf(session.role)
        const newRoleIndex = roleHierarchy.indexOf(data.role)

        if (newRoleIndex > myRoleIndex) {
            return { success: false, error: "No puedes crear usuarios con rol superior al tuyo" }
        }

        // Check if email exists in this organization
        const existing = await db.user.findFirst({
            where: {
                email: data.email.toLowerCase().trim(),
                organizationId: organizationId
            }
        })

        if (existing) {
            return { success: false, error: "El email ya está registrado en esta organización" }
        }

        // Generate credentials if not provided
        // Priority: PIN > Password > Auto-generate PIN
        let pinToSend: string | null = null
        let passwordToSend: string | null = null

        if (data.pin) {
            // User provided PIN
            pinToSend = data.pin
        } else if (!data.password) {
            // No PIN and no password - auto-generate PIN
            pinToSend = Math.floor(1000 + Math.random() * 9000).toString() // 4 digit PIN
        }

        if (data.password) {
            passwordToSend = data.password
        }

        // Either password or PIN is required (now we check AFTER generation)
        if (!passwordToSend && !pinToSend) {
            return { success: false, error: "Debes proporcionar contraseña o PIN" }
        }

        // Generate random password for DB if not provided
        const passwordToHash = data.password || crypto.randomUUID().slice(0, 12)
        const hashedPassword = await hashPassword(passwordToHash)

        // Hash PIN if we have one (provided or generated)
        const hashedPin = pinToSend ? await hashPassword(pinToSend) : null

        const user = await db.user.create({
            data: {
                name: data.name.trim(),
                email: data.email.toLowerCase().trim(),
                password: hashedPassword,
                pin: hashedPin,
                role: data.role,
                active: true,
                organizationId: organizationId
            }
        })

        // Send credentials to employee via email
        const organization = await db.organization.findUnique({
            where: { id: organizationId },
            select: { name: true, businessCode: true }
        })

        if (organization && (pinToSend || passwordToSend)) {
            // Send email with credentials (non-blocking)
            sendEmployeeCredentials(
                data.email.toLowerCase().trim(),
                data.name.trim(),
                organization.name,
                organization.businessCode,
                pinToSend || undefined,
                passwordToSend || undefined
            ).catch(err => authLogger.error('Failed to send employee credentials', err))
        }

        await logAudit(session.id, "create", "user", user.id, `Usuario creado: ${user.name}`)
        revalidatePath("/users")

        return {
            success: true,
            credentials: {
                email: user.email,
                businessCode: organization?.businessCode,
                pin: pinToSend || undefined,
                password: passwordToSend || undefined
            }
        }
    } catch (error) {
        authLogger.error('Create user error:', error)
        return { success: false, error: "Error al crear usuario" }
    }
}

// Update user (owner/admin only) - must be in same organization
export async function updateUser(id: number, data: {
    name?: string
    email?: string
    password?: string
    role?: UserRole
    active?: boolean
}): Promise<{ success: boolean; error?: string }> {
    try {
        const { session, organizationId } = await requireOrganization()

        if (!['owner', 'admin'].includes(session.role)) {
            return { success: false, error: "No autorizado" }
        }

        // Check if user exists in same organization
        const user = await db.user.findFirst({
            where: { id, organizationId }
        })
        if (!user) {
            return { success: false, error: "Usuario no encontrado" }
        }

        // Prevent editing users with higher role
        const roleHierarchy = ['viewer', 'waiter', 'cashier', 'manager', 'admin', 'owner']
        const myRoleIndex = roleHierarchy.indexOf(session.role)
        const targetRoleIndex = roleHierarchy.indexOf(user.role)

        if (targetRoleIndex > myRoleIndex && session.id !== id) {
            return { success: false, error: "No puedes editar usuarios con rol superior" }
        }

        // Check email uniqueness if changing
        if (data.email && data.email.toLowerCase().trim() !== user.email) {
            const existing = await db.user.findFirst({
                where: {
                    email: data.email.toLowerCase().trim(),
                    organizationId
                }
            })
            if (existing) {
                return { success: false, error: "El email ya está registrado" }
            }
        }

        // Build update data
        const updateData: any = {}
        if (data.name) updateData.name = data.name.trim()
        if (data.email) updateData.email = data.email.toLowerCase().trim()
        if (data.role) updateData.role = data.role
        if (typeof data.active === "boolean") updateData.active = data.active
        if (data.password) {
            updateData.password = await hashPassword(data.password)
        }

        await db.user.update({
            where: { id },
            data: updateData
        })

        await logAudit(session.id, "update", "user", id, `Usuario actualizado: ${data.name || user.name}`)
        revalidatePath("/users")

        return { success: true }
    } catch (error) {
        authLogger.error('Update user error:', error)
        return { success: false, error: "Error al actualizar usuario" }
    }
}

// Delete user (owner/admin only) - must be in same organization
export async function deleteUser(id: number): Promise<{ success: boolean; error?: string }> {
    try {
        const { session, organizationId } = await requireOrganization()

        if (!['owner', 'admin'].includes(session.role)) {
            return { success: false, error: "No autorizado" }
        }

        // Cannot delete self
        if (session.id === id) {
            return { success: false, error: "No puedes eliminar tu propia cuenta" }
        }

        const user = await db.user.findFirst({
            where: { id, organizationId }
        })
        if (!user) {
            return { success: false, error: "Usuario no encontrado" }
        }

        // Cannot delete owner
        if (user.role === 'owner') {
            return { success: false, error: "No se puede eliminar al dueño" }
        }

        // Check if user has sales
        const salesCount = await db.sale.count({
            where: { userId: id }
        })

        if (salesCount > 0) {
            // Deactivate instead of delete
            await db.user.update({
                where: { id },
                data: { active: false }
            })
            await logAudit(session.id, "deactivate", "user", id, `Usuario desactivado (tiene ${salesCount} ventas): ${user.name}`)
        } else {
            await db.user.delete({ where: { id } })
            await logAudit(session.id, "delete", "user", id, `Usuario eliminado: ${user.name}`)
        }

        revalidatePath("/users")
        return { success: true }
    } catch (error) {
        authLogger.error('Delete user error:', error)
        return { success: false, error: "Error al eliminar usuario" }
    }
}

// Toggle user active status (owner/admin only) - must be in same organization
export async function toggleUserActive(id: number): Promise<{ success: boolean; error?: string }> {
    try {
        const { session, organizationId } = await requireOrganization()

        if (!['owner', 'admin'].includes(session.role)) {
            return { success: false, error: "No autorizado" }
        }

        if (session.id === id) {
            return { success: false, error: "No puedes desactivar tu propia cuenta" }
        }

        const user = await db.user.findFirst({
            where: { id, organizationId }
        })
        if (!user) {
            return { success: false, error: "Usuario no encontrado" }
        }

        // Cannot deactivate owner
        if (user.role === 'owner') {
            return { success: false, error: "No se puede desactivar al dueño" }
        }

        await db.user.update({
            where: { id },
            data: { active: !user.active }
        })

        await logAudit(
            session.id,
            user.active ? "deactivate" : "activate",
            "user",
            id,
            `Usuario ${user.active ? "desactivado" : "activado"}: ${user.name}`
        )

        revalidatePath("/users")
        return { success: true }
    } catch (error) {
        authLogger.error('Toggle user error:', error)
        return { success: false, error: "Error al cambiar estado" }
    }
}

// Create initial admin user (for setup)
export async function createInitialAdmin(): Promise<{
    success: boolean;
    message: string;
    credentials?: { email: string; password: string }
}> {
    const existingAdmin = await db.user.findFirst({
        where: { role: "admin" }
    })

    if (existingAdmin) {
        return { success: false, message: "Ya existe un administrador" }
    }

    const defaultPassword = "admin123"
    const hashedPassword = await hashPassword(defaultPassword)

    try {
        await db.user.create({
            data: {
                name: "Administrador",
                email: "admin@tienda.com",
                password: hashedPassword,
                role: "admin",
                active: true
            }
        })

        return {
            success: true,
            message: "Administrador creado exitosamente",
            credentials: {
                email: "admin@tienda.com",
                password: defaultPassword
            }
        }
    } catch (error) {
        console.error("Setup error:", error)
        // Check for Prisma unique constraint error (P2002)
        if ((error as any).code === 'P2002') {
            return { success: false, message: "El usuario ya existe (email duplicado)" }
        }
        return { success: false, message: "Error al crear el administrador" }
    }
}
