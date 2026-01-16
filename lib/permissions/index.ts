/**
 * Permissions Module for Stockcito POS
 * 
 * This module re-exports all permission-related types, constants and functions.
 * The code has been split into smaller, focused files for better maintainability.
 * 
 * Module Structure:
 * - types.ts: Type definitions (interfaces and type aliases)
 * - constants.ts: Constant values (PERMISSION_LABELS, SYSTEM_ROLES, DEFAULT_PERMISSIONS, PROTECTED_ACTIONS)
 * - functions.ts: Helper functions (getUserPermissions, hasPermission, needsOverride, canAuthorize, etc.)
 */

// Types
export type {
    SalesPermissions,
    InventoryPermissions,
    ClientPermissions,
    CashDrawerPermissions,
    ReportsPermissions,
    UsersPermissions,
    SettingsPermissions,
    POSPermissions,
    UserPermissions,
    SystemRole,
    ProtectedAction
} from './types'

// Constants
export {
    PERMISSION_LABELS,
    SYSTEM_ROLES,
    DEFAULT_PERMISSIONS,
    PROTECTED_ACTIONS
} from './constants'

// Functions
export {
    getUserPermissions,
    hasPermission,
    needsOverride,
    canAuthorize,
    serializeCustomPermissions,
    getMaxDiscount
} from './functions'
