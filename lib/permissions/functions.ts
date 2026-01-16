/**
 * Permission Helper Functions for Stockcito POS
 */

import type { UserPermissions, SystemRole, ProtectedAction } from './types'
import { DEFAULT_PERMISSIONS, PROTECTED_ACTIONS } from './constants'

/**
 * Deep merge de objetos de permisos
 */
function deepMerge(target: UserPermissions, source: Partial<UserPermissions>): UserPermissions {
    const result = { ...target }
    
    for (const moduleKey of Object.keys(source) as (keyof UserPermissions)[]) {
        const sourceModule = source[moduleKey]
        if (sourceModule !== undefined && typeof sourceModule === 'object') {
            const targetModule = result[moduleKey]
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result[moduleKey] = { ...targetModule, ...sourceModule } as any
        }
    }
    
    return result
}

/**
 * Obtiene las diferencias entre dos objetos de permisos
 */
function getPermissionsDiff(
    base: UserPermissions,
    custom: UserPermissions
): Partial<UserPermissions> {
    const diff: Partial<UserPermissions> = {}
    
    for (const module of Object.keys(base) as (keyof UserPermissions)[]) {
        const baseModule = base[module]
        const customModule = custom[module]
        
        if (!customModule) continue
        
        const moduleDiff: Record<string, boolean | number> = {}
        let hasDiff = false
        
        for (const action of Object.keys(baseModule)) {
            const baseValue = (baseModule as unknown as Record<string, boolean | number>)[action]
            const customValue = (customModule as unknown as Record<string, boolean | number>)[action]
            
            if (customValue !== undefined && customValue !== baseValue) {
                moduleDiff[action] = customValue
                hasDiff = true
            }
        }
        
        if (hasDiff) {
            (diff as Record<string, unknown>)[module] = moduleDiff
        }
    }
    
    return diff
}

/**
 * Obtiene los permisos de un usuario, combinando rol base + permisos personalizados
 */
export function getUserPermissions(
    role: SystemRole | string,
    customPermissions?: string | null
): UserPermissions {
    // Obtener permisos base del rol
    const baseRole = (role in DEFAULT_PERMISSIONS ? role : 'viewer') as SystemRole
    const basePermissions = structuredClone(DEFAULT_PERMISSIONS[baseRole])
    
    // Si hay permisos personalizados, hacer merge
    if (customPermissions) {
        try {
            const custom = JSON.parse(customPermissions) as Partial<UserPermissions>
            return deepMerge(basePermissions, custom as UserPermissions)
        } catch {
            return basePermissions
        }
    }
    
    return basePermissions
}

/**
 * Verifica si un usuario tiene un permiso específico
 */
export function hasPermission(
    permissions: UserPermissions,
    module: keyof UserPermissions,
    action: string
): boolean {
    const modulePerms = permissions[module]
    if (!modulePerms || typeof modulePerms !== 'object') return false
    return (modulePerms as unknown as Record<string, boolean | number>)[action] === true
}

/**
 * Verifica si una acción requiere override y si el usuario puede hacerla
 */
export function needsOverride(
    action: ProtectedAction,
    userRole: SystemRole | string,
    userPermissions: UserPermissions
): boolean {
    const actionConfig = PROTECTED_ACTIONS[action]
    if (!actionConfig) return false
    
    // Si el rol del usuario puede autorizar esta acción, no necesita override
    if (actionConfig.requiredRole.includes(userRole as SystemRole)) {
        return false
    }
    
    return true
}

/**
 * Verifica si un rol puede autorizar una acción protegida
 */
export function canAuthorize(
    action: ProtectedAction,
    authorizerRole: SystemRole | string
): boolean {
    const actionConfig = PROTECTED_ACTIONS[action]
    if (!actionConfig) return false
    return actionConfig.requiredRole.includes(authorizerRole as SystemRole)
}

/**
 * Serializa permisos personalizados (solo los que difieren del rol base)
 */
export function serializeCustomPermissions(
    role: SystemRole,
    customPermissions: Partial<UserPermissions>
): string | null {
    const base = DEFAULT_PERMISSIONS[role]
    const diff = getPermissionsDiff(base, customPermissions as UserPermissions)
    
    if (Object.keys(diff).length === 0) {
        return null
    }
    
    return JSON.stringify(diff)
}

/**
 * Obtiene el límite de descuento efectivo para un usuario
 */
export function getMaxDiscount(
    userMaxDiscount: number | null | undefined,
    roleMaxDiscount: number
): number {
    // Si el usuario tiene un límite personalizado, usar ese
    if (userMaxDiscount !== null && userMaxDiscount !== undefined) {
        return userMaxDiscount
    }
    return roleMaxDiscount
}
