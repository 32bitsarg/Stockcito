/**
 * Permission Constants for Stockcito POS
 * 
 * Permission labels, system roles, default permissions, and protected actions.
 */

import type {
    UserPermissions,
    SalesPermissions,
    InventoryPermissions,
    ClientPermissions,
    CashDrawerPermissions,
    ReportsPermissions,
    UsersPermissions,
    SettingsPermissions,
    POSPermissions,
    SystemRole,
    ProtectedAction
} from './types'

// ==========================================
// PERMISSION LABELS (for UI)
// ==========================================

export const PERMISSION_LABELS: Record<keyof UserPermissions, Record<string, string>> = {
    sales: {
        create: 'Crear ventas',
        view: 'Ver ventas propias',
        viewAll: 'Ver todas las ventas',
        void: 'Anular ventas',
        refund: 'Hacer devoluciones',
        applyDiscount: 'Aplicar descuentos',
        editPrice: 'Modificar precios',
        deleteItem: 'Eliminar items',
        editClosedSale: 'Editar ventas cerradas'
    },
    inventory: {
        view: 'Ver inventario',
        create: 'Crear productos',
        edit: 'Editar productos',
        delete: 'Eliminar productos',
        adjustStock: 'Ajustar stock',
        viewCost: 'Ver costos',
        export: 'Exportar datos'
    },
    clients: {
        view: 'Ver clientes',
        create: 'Crear clientes',
        edit: 'Editar clientes',
        delete: 'Eliminar clientes',
        viewHistory: 'Ver historial'
    },
    cashDrawer: {
        open: 'Abrir caja',
        close: 'Cerrar caja',
        viewBalance: 'Ver saldo',
        cashIn: 'Ingresos efectivo',
        cashOut: 'Retiros efectivo',
        openDrawer: 'Abrir gaveta',
        viewOthersDrawer: 'Ver otras cajas',
        forceClose: 'Cerrar caja de otro'
    },
    reports: {
        viewSales: 'Reportes de ventas',
        viewFinancial: 'Reportes financieros',
        viewInventory: 'Reportes inventario',
        viewEmployees: 'Reportes empleados',
        viewAudit: 'Logs auditoría',
        export: 'Exportar reportes'
    },
    users: {
        view: 'Ver usuarios',
        create: 'Crear usuarios',
        edit: 'Editar usuarios',
        delete: 'Eliminar usuarios',
        editRoles: 'Gestionar roles',
        editPermissions: 'Editar permisos',
        viewTimeEntries: 'Ver asistencia',
        editTimeEntries: 'Editar asistencia'
    },
    settings: {
        viewOrganization: 'Ver configuración',
        editOrganization: 'Editar configuración',
        viewBilling: 'Ver facturación',
        manageBilling: 'Gestionar suscripción',
        manageIntegrations: 'Gestionar integraciones'
    },
    pos: {
        accessPOS: 'Acceder al POS',
        quickSale: 'Ventas rápidas',
        assignTable: 'Asignar mesas',
        transferTable: 'Transferir mesas',
        viewKitchen: 'Ver cocina',
        manageKitchen: 'Gestionar cocina'
    }
}

// ==========================================
// PREDEFINED ROLES
// ==========================================

export const SYSTEM_ROLES: Record<SystemRole, { name: string; description: string; color: string; icon: string }> = {
    owner: {
        name: 'Dueño',
        description: 'Control total del sistema, incluyendo facturación',
        color: '#eab308', // yellow
        icon: 'crown'
    },
    admin: {
        name: 'Administrador',
        description: 'Acceso completo excepto facturación',
        color: '#8b5cf6', // purple
        icon: 'shield'
    },
    manager: {
        name: 'Gerente',
        description: 'Supervisión, overrides, reportes y gestión de turnos',
        color: '#3b82f6', // blue
        icon: 'briefcase'
    },
    cashier: {
        name: 'Cajero',
        description: 'Ventas, cobros y gestión de caja',
        color: '#22c55e', // green
        icon: 'calculator'
    },
    waiter: {
        name: 'Mesero',
        description: 'Toma de pedidos y atención de mesas',
        color: '#f97316', // orange
        icon: 'utensils'
    },
    viewer: {
        name: 'Visor',
        description: 'Solo lectura, sin acceso a acciones',
        color: '#6b7280', // gray
        icon: 'eye'
    }
}

// ==========================================
// DEFAULT PERMISSIONS PER ROLE
// ==========================================

const FULL_SALES: SalesPermissions = {
    create: true, view: true, viewAll: true, void: true, refund: true,
    applyDiscount: true, maxDiscountPct: 100, editPrice: true,
    deleteItem: true, editClosedSale: true
}

const FULL_INVENTORY: InventoryPermissions = {
    view: true, create: true, edit: true, delete: true,
    adjustStock: true, viewCost: true, export: true
}

const FULL_CLIENTS: ClientPermissions = {
    view: true, create: true, edit: true, delete: true, viewHistory: true
}

const FULL_CASH_DRAWER: CashDrawerPermissions = {
    open: true, close: true, viewBalance: true, cashIn: true, cashOut: true,
    openDrawer: true, viewOthersDrawer: true, forceClose: true
}

const FULL_REPORTS: ReportsPermissions = {
    viewSales: true, viewFinancial: true, viewInventory: true,
    viewEmployees: true, viewAudit: true, export: true
}

const FULL_USERS: UsersPermissions = {
    view: true, create: true, edit: true, delete: true,
    editRoles: true, editPermissions: true,
    viewTimeEntries: true, editTimeEntries: true
}

const FULL_SETTINGS: SettingsPermissions = {
    viewOrganization: true, editOrganization: true,
    viewBilling: true, manageBilling: true, manageIntegrations: true
}

const FULL_POS: POSPermissions = {
    accessPOS: true, quickSale: true, assignTable: true,
    transferTable: true, viewKitchen: true, manageKitchen: true
}

export const DEFAULT_PERMISSIONS: Record<SystemRole, UserPermissions> = {
    // OWNER: Todo
    owner: {
        sales: FULL_SALES,
        inventory: FULL_INVENTORY,
        clients: FULL_CLIENTS,
        cashDrawer: FULL_CASH_DRAWER,
        reports: FULL_REPORTS,
        users: FULL_USERS,
        settings: FULL_SETTINGS,
        pos: FULL_POS
    },

    // ADMIN: Todo excepto billing
    admin: {
        sales: FULL_SALES,
        inventory: FULL_INVENTORY,
        clients: FULL_CLIENTS,
        cashDrawer: FULL_CASH_DRAWER,
        reports: FULL_REPORTS,
        users: { ...FULL_USERS, editRoles: false },
        settings: { ...FULL_SETTINGS, manageBilling: false },
        pos: FULL_POS
    },

    // MANAGER: Supervisión y overrides
    manager: {
        sales: {
            create: true, view: true, viewAll: true, void: true, refund: true,
            applyDiscount: true, maxDiscountPct: 50, editPrice: true,
            deleteItem: true, editClosedSale: false
        },
        inventory: {
            view: true, create: true, edit: true, delete: false,
            adjustStock: true, viewCost: true, export: true
        },
        clients: FULL_CLIENTS,
        cashDrawer: {
            open: true, close: true, viewBalance: true, cashIn: true, cashOut: true,
            openDrawer: true, viewOthersDrawer: true, forceClose: true
        },
        reports: {
            viewSales: true, viewFinancial: false, viewInventory: true,
            viewEmployees: true, viewAudit: false, export: true
        },
        users: {
            view: true, create: false, edit: false, delete: false,
            editRoles: false, editPermissions: false,
            viewTimeEntries: true, editTimeEntries: true
        },
        settings: {
            viewOrganization: true, editOrganization: false,
            viewBilling: false, manageBilling: false, manageIntegrations: false
        },
        pos: FULL_POS
    },

    // CASHIER: Ventas y caja
    cashier: {
        sales: {
            create: true, view: true, viewAll: false, void: false, refund: false,
            applyDiscount: true, maxDiscountPct: 10, editPrice: false,
            deleteItem: true, editClosedSale: false
        },
        inventory: {
            view: true, create: false, edit: false, delete: false,
            adjustStock: false, viewCost: false, export: false
        },
        clients: {
            view: true, create: true, edit: true, delete: false, viewHistory: false
        },
        cashDrawer: {
            open: true, close: true, viewBalance: true, cashIn: false, cashOut: false,
            openDrawer: false, viewOthersDrawer: false, forceClose: false
        },
        reports: {
            viewSales: false, viewFinancial: false, viewInventory: false,
            viewEmployees: false, viewAudit: false, export: false
        },
        users: {
            view: false, create: false, edit: false, delete: false,
            editRoles: false, editPermissions: false,
            viewTimeEntries: false, editTimeEntries: false
        },
        settings: {
            viewOrganization: false, editOrganization: false,
            viewBilling: false, manageBilling: false, manageIntegrations: false
        },
        pos: {
            accessPOS: true, quickSale: true, assignTable: false,
            transferTable: false, viewKitchen: false, manageKitchen: false
        }
    },

    // WAITER: Solo pedidos (restaurante)
    waiter: {
        sales: {
            create: true, view: true, viewAll: false, void: false, refund: false,
            applyDiscount: false, maxDiscountPct: 0, editPrice: false,
            deleteItem: true, editClosedSale: false
        },
        inventory: {
            view: true, create: false, edit: false, delete: false,
            adjustStock: false, viewCost: false, export: false
        },
        clients: {
            view: true, create: true, edit: false, delete: false, viewHistory: false
        },
        cashDrawer: {
            open: false, close: false, viewBalance: false, cashIn: false, cashOut: false,
            openDrawer: false, viewOthersDrawer: false, forceClose: false
        },
        reports: {
            viewSales: false, viewFinancial: false, viewInventory: false,
            viewEmployees: false, viewAudit: false, export: false
        },
        users: {
            view: false, create: false, edit: false, delete: false,
            editRoles: false, editPermissions: false,
            viewTimeEntries: false, editTimeEntries: false
        },
        settings: {
            viewOrganization: false, editOrganization: false,
            viewBilling: false, manageBilling: false, manageIntegrations: false
        },
        pos: {
            accessPOS: true, quickSale: true, assignTable: true,
            transferTable: true, viewKitchen: true, manageKitchen: false
        }
    },

    // VIEWER: Solo lectura
    viewer: {
        sales: {
            create: false, view: true, viewAll: true, void: false, refund: false,
            applyDiscount: false, maxDiscountPct: 0, editPrice: false,
            deleteItem: false, editClosedSale: false
        },
        inventory: {
            view: true, create: false, edit: false, delete: false,
            adjustStock: false, viewCost: false, export: false
        },
        clients: {
            view: true, create: false, edit: false, delete: false, viewHistory: true
        },
        cashDrawer: {
            open: false, close: false, viewBalance: true, cashIn: false, cashOut: false,
            openDrawer: false, viewOthersDrawer: true, forceClose: false
        },
        reports: {
            viewSales: true, viewFinancial: false, viewInventory: true,
            viewEmployees: false, viewAudit: false, export: false
        },
        users: {
            view: true, create: false, edit: false, delete: false,
            editRoles: false, editPermissions: false,
            viewTimeEntries: false, editTimeEntries: false
        },
        settings: {
            viewOrganization: true, editOrganization: false,
            viewBilling: false, manageBilling: false, manageIntegrations: false
        },
        pos: {
            accessPOS: false, quickSale: false, assignTable: false,
            transferTable: false, viewKitchen: true, manageKitchen: false
        }
    }
}

// ==========================================
// PROTECTED ACTIONS
// ==========================================

export const PROTECTED_ACTIONS: Record<ProtectedAction, {
    name: string
    description: string
    requiredRole: SystemRole[] // Roles que pueden autorizar
}> = {
    void_sale: {
        name: 'Anular venta',
        description: 'Anular una venta completada',
        requiredRole: ['owner', 'admin', 'manager']
    },
    refund: {
        name: 'Devolución',
        description: 'Procesar una devolución de dinero',
        requiredRole: ['owner', 'admin', 'manager']
    },
    discount_override: {
        name: 'Descuento especial',
        description: 'Aplicar descuento mayor al permitido',
        requiredRole: ['owner', 'admin', 'manager']
    },
    price_override: {
        name: 'Cambio de precio',
        description: 'Modificar precio de un producto en la venta',
        requiredRole: ['owner', 'admin', 'manager']
    },
    open_drawer: {
        name: 'Abrir gaveta',
        description: 'Abrir la gaveta de efectivo sin una venta',
        requiredRole: ['owner', 'admin', 'manager']
    },
    delete_item: {
        name: 'Eliminar item',
        description: 'Eliminar un item de la venta',
        requiredRole: ['owner', 'admin', 'manager', 'cashier']
    },
    edit_closed_sale: {
        name: 'Editar venta cerrada',
        description: 'Modificar una venta ya completada',
        requiredRole: ['owner', 'admin']
    },
    force_close_drawer: {
        name: 'Cerrar caja ajena',
        description: 'Cerrar la caja de otro usuario',
        requiredRole: ['owner', 'admin', 'manager']
    },
    edit_time_entry: {
        name: 'Editar horario',
        description: 'Modificar registro de entrada/salida',
        requiredRole: ['owner', 'admin', 'manager']
    },
    cash_out: {
        name: 'Retiro de efectivo',
        description: 'Retirar dinero de la caja',
        requiredRole: ['owner', 'admin', 'manager']
    }
}
