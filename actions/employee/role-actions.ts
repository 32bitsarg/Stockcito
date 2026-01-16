"use server"
import { employeeLogger } from '@/lib/logger'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { requireOrganization, logAudit } from '@/actions/auth'
import { 
    getUserPermissions, 
    hasPermission,
    type UserPermissions,
    type SystemRole,
    DEFAULT_PERMISSIONS,
    SYSTEM_ROLES
} from '@/lib/permissions'

// ==========================================
// ROLES MANAGEMENT
// ==========================================

/**
 * Obtener roles de la organización
 */
export async function getRoles() {
    const { organizationId } = await requireOrganization()

    // Roles del sistema
    const systemRoles = Object.entries(SYSTEM_ROLES).map(([code, data]) => ({
        id: 0,
        code,
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        isSystem: true,
        permissions: JSON.stringify(DEFAULT_PERMISSIONS[code as SystemRole])
    }))

    // Roles personalizados
    const customRoles = await db.role.findMany({
        where: { organizationId },
        orderBy: { name: 'asc' }
    })

    return [...systemRoles, ...customRoles]
}

/**
 * Crear rol personalizado
 */
export async function createRole(data: {
    name: string
    description?: string
    color?: string
    permissions: UserPermissions
}): Promise<{ success: boolean; error?: string }> {
    try {
        const { session, organizationId } = await requireOrganization()

        const permissions = getUserPermissions(session.role as SystemRole, null)
        if (!hasPermission(permissions, 'users', 'editRoles')) {
            return { success: false, error: 'Sin permisos para crear roles' }
        }

        const code = `custom_${Date.now()}`

        await db.role.create({
            data: {
                organizationId,
                name: data.name,
                code,
                description: data.description,
                color: data.color || '#6366f1',
                permissions: JSON.stringify(data.permissions),
                isSystem: false
            }
        })

        await logAudit(session.id, 'create', 'role', undefined, `Rol creado: ${data.name}`)
        revalidatePath('/users')
        
        return { success: true }
    } catch (error) {
        employeeLogger.error('Create role error:', error)
        return { success: false, error: 'Error al crear rol' }
    }
}

/**
 * Actualizar rol personalizado
 */
export async function updateRole(
    roleId: number,
    data: {
        name?: string
        description?: string
        color?: string
        permissions?: UserPermissions
    }
): Promise<{ success: boolean; error?: string }> {
    try {
        const { session, organizationId } = await requireOrganization()

        const permissions = getUserPermissions(session.role as SystemRole, null)
        if (!hasPermission(permissions, 'users', 'editRoles')) {
            return { success: false, error: 'Sin permisos para editar roles' }
        }

        const role = await db.role.findFirst({
            where: { id: roleId, organizationId }
        })

        if (!role) {
            return { success: false, error: 'Rol no encontrado' }
        }

        if (role.isSystem) {
            return { success: false, error: 'No se pueden editar roles del sistema' }
        }

        await db.role.update({
            where: { id: roleId },
            data: {
                name: data.name,
                description: data.description,
                color: data.color,
                permissions: data.permissions ? JSON.stringify(data.permissions) : undefined
            }
        })

        await logAudit(session.id, 'update', 'role', roleId, `Rol actualizado: ${role.name}`)
        revalidatePath('/users')
        
        return { success: true }
    } catch (error) {
        employeeLogger.error('Update role error:', error)
        return { success: false, error: 'Error al actualizar rol' }
    }
}

/**
 * Eliminar rol personalizado
 */
export async function deleteRole(roleId: number): Promise<{ success: boolean; error?: string }> {
    try {
        const { session, organizationId } = await requireOrganization()

        const permissions = getUserPermissions(session.role as SystemRole, null)
        if (!hasPermission(permissions, 'users', 'editRoles')) {
            return { success: false, error: 'Sin permisos para eliminar roles' }
        }

        const role = await db.role.findFirst({
            where: { id: roleId, organizationId }
        })

        if (!role) {
            return { success: false, error: 'Rol no encontrado' }
        }

        if (role.isSystem) {
            return { success: false, error: 'No se pueden eliminar roles del sistema' }
        }

        // Verificar que no hay usuarios con este rol
        const usersWithRole = await db.user.count({
            where: { organizationId, role: role.code }
        })

        if (usersWithRole > 0) {
            return { success: false, error: `Hay ${usersWithRole} usuario(s) con este rol. Cambia su rol primero.` }
        }

        await db.role.delete({
            where: { id: roleId }
        })

        await logAudit(session.id, 'delete', 'role', roleId, `Rol eliminado: ${role.name}`)
        revalidatePath('/users')
        
        return { success: true }
    } catch (error) {
        employeeLogger.error('Delete role error:', error)
        return { success: false, error: 'Error al eliminar rol' }
    }
}

/**
 * Actualizar permisos de un usuario
 */
export async function updateUserPermissions(
    userId: number,
    customPermissions: Partial<UserPermissions>
): Promise<{ success: boolean; error?: string }> {
    try {
        const { session } = await requireOrganization()

        const permissions = getUserPermissions(session.role as SystemRole, null)
        if (!hasPermission(permissions, 'users', 'editPermissions')) {
            return { success: false, error: 'Sin permisos para editar permisos' }
        }

        await db.user.update({
            where: { id: userId },
            data: {
                permissions: JSON.stringify(customPermissions)
            }
        })

        await logAudit(session.id, 'update_permissions', 'user', userId, 'Permisos actualizados')
        revalidatePath('/users')
        
        return { success: true }
    } catch (error) {
        employeeLogger.error('Update permissions error:', error)
        return { success: false, error: 'Error al actualizar permisos' }
    }
}
