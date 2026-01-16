/**
 * Auth Actions (Re-export for backwards compatibility)
 * 
 * This file re-exports all functions from the new modular auth structure.
 * The actual implementations have been moved to /actions/auth/
 * 
 * @deprecated Import directly from '@/actions/auth' instead of '@/actions/auth-actions'
 */

// Re-export types directly from types.ts for Turbopack compatibility
export type { UserRole, SessionUser, JWTPayload } from './auth/types'

// Re-export all functions from index
export {
    getSession,
    hasRole,
    requireAuth,
    requireRole,
    getOrganizationId,
    requireOrganization,
    logoutUser,
    logAudit,
    getAuditLogs,
    loginUser,
    loginWithPin,
    getEmployeesForBusinessCode,
    loginWithBusinessCode,
    registerUser,
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserActive,
    createInitialAdmin,
    changePassword,
    requestBusinessCodeRegeneration,
    confirmBusinessCodeRegeneration,
    resendVerificationEmailAction
} from './auth'
