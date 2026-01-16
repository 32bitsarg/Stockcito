// Re-export from modular files for backwards compatibility
export {
    getCashDrawers,
    createCashDrawer,
    assignDrawerToUser,
    getAssignedDrawer
} from './drawer-management'

export {
    openCashDrawer,
    closeCashDrawer,
    recordCashMovement,
    getCurrentDrawerStatus,
    transferCashDrawer
} from './drawer-operations'
