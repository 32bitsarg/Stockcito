/**
 * Auth Actions Module
 * 
 * This module re-exports all authentication-related server actions.
 * The actions have been split into smaller, focused modules for better maintainability.
 * 
 * Module Structure:
 * - types.ts: Type definitions (UserRole, SessionUser, JWTPayload)
 * - session-actions.ts: Session management (getSession, requireAuth, requireRole, etc.)
 * - audit-actions.ts: Audit logging (logAudit, getAuditLogs)
 * - login-actions.ts: Login functionality (loginUser, loginWithPin, loginWithBusinessCode)
 * - register-actions.ts: User registration (registerUser)
 * - user-management-actions.ts: User CRUD (getUsers, createUser, updateUser, deleteUser, etc.)
 * - password-actions.ts: Password management (changePassword, requestBusinessCodeRegeneration)
 * - verification-actions.ts: Email verification (resendVerificationEmailAction)
 */

// Types
export type { UserRole, SessionUser, JWTPayload } from './types'

// Session management
export { 
    getSession, 
    hasRole, 
    requireAuth, 
    requireRole, 
    getOrganizationId,
    requireOrganization, 
    logoutUser 
} from './session-actions'

// Audit logging
export { logAudit, getAuditLogs } from './audit-actions'

// Login
export { 
    loginUser, 
    loginWithPin, 
    getEmployeesForBusinessCode, 
    loginWithBusinessCode 
} from './login-actions'

// Registration
export { registerUser } from './register-actions'

// User management
export { 
    getUsers, 
    getUserById, 
    createUser, 
    updateUser, 
    deleteUser, 
    toggleUserActive, 
    createInitialAdmin 
} from './user-management-actions'

// Password management
export { 
    changePassword, 
    requestBusinessCodeRegeneration, 
    confirmBusinessCodeRegeneration 
} from './password-actions'

// Email verification
export { resendVerificationEmailAction } from './verification-actions'
