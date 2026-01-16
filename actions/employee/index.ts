/**
 * Employee Actions Module
 * 
 * This module re-exports all employee-related server actions.
 * The actions have been split into smaller, focused modules for better maintainability.
 * 
 * Module Structure:
 * - pin-actions.ts: PIN management (setPin, verifyPin, quickLoginWithPin, getUsersWithPin)
 * - override-actions.ts: Manager override (requestOverride, useOverride)
 * - cash-drawer-actions.ts: Cash drawer management (getCashDrawers, openCashDrawer, closeCashDrawer, etc.)
 * - time-tracking-actions.ts: Time entries (clockIn, clockOut, getTimeEntries, editTimeEntry)
 * - role-actions.ts: Roles management (getRoles, createRole, updateRole, deleteRole)
 * - shift-actions.ts: Shift reports (getShiftReport, getShiftHistory)
 */

// PIN management
export { 
    setPin, 
    verifyPin, 
    quickLoginWithPin, 
    getUsersWithPin 
} from './pin-actions'

// Manager override
export { 
    requestOverride, 
    useOverride 
} from './override-actions'

// Cash drawer management
export { 
    getCashDrawers, 
    createCashDrawer, 
    openCashDrawer, 
    closeCashDrawer, 
    recordCashMovement, 
    getCurrentDrawerStatus, 
    transferCashDrawer, 
    assignDrawerToUser, 
    getAssignedDrawer 
} from './cash-drawer-actions'

// Time tracking
export { 
    clockIn, 
    clockOut, 
    getActiveTimeEntry, 
    getTimeEntries, 
    editTimeEntry 
} from './time-tracking-actions'

// Role management
export { 
    getRoles, 
    createRole, 
    updateRole, 
    deleteRole, 
    updateUserPermissions 
} from './role-actions'

// Shift reports
export { 
    getShiftReport, 
    getShiftHistory 
} from './shift-actions'
