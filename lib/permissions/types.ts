/**
 * Permission Types for Stockcito POS
 * 
 * Define granular permission interfaces per module.
 * Supports all business types: kiosk, restaurant, supermarket, retail.
 */

// ==========================================
// PERMISSION INTERFACES
// ==========================================

export interface SalesPermissions {
    create: boolean           // Crear ventas
    view: boolean             // Ver ventas propias
    viewAll: boolean          // Ver todas las ventas
    void: boolean             // Anular ventas
    refund: boolean           // Hacer devoluciones
    applyDiscount: boolean    // Aplicar descuentos
    maxDiscountPct: number    // Máximo % de descuento (0-100)
    editPrice: boolean        // Modificar precios en venta
    deleteItem: boolean       // Eliminar items de venta abierta
    editClosedSale: boolean   // Editar ventas cerradas (requiere override)
}

export interface InventoryPermissions {
    view: boolean             // Ver inventario
    create: boolean           // Crear productos
    edit: boolean             // Editar productos
    delete: boolean           // Eliminar productos
    adjustStock: boolean      // Ajustar stock manualmente
    viewCost: boolean         // Ver precios de costo
    export: boolean           // Exportar inventario
}

export interface ClientPermissions {
    view: boolean             // Ver clientes
    create: boolean           // Crear clientes
    edit: boolean             // Editar clientes
    delete: boolean           // Eliminar clientes
    viewHistory: boolean      // Ver historial de compras
}

export interface CashDrawerPermissions {
    open: boolean             // Abrir caja
    close: boolean            // Cerrar caja (con arqueo)
    viewBalance: boolean      // Ver saldo actual
    cashIn: boolean           // Ingresos de efectivo
    cashOut: boolean          // Retiros de efectivo
    openDrawer: boolean       // Abrir gaveta sin venta
    viewOthersDrawer: boolean // Ver cajas de otros
    forceClose: boolean       // Cerrar caja de otro usuario
}

export interface ReportsPermissions {
    viewSales: boolean        // Reportes de ventas
    viewFinancial: boolean    // Reportes financieros
    viewInventory: boolean    // Reportes de inventario
    viewEmployees: boolean    // Reportes de empleados
    viewAudit: boolean        // Logs de auditoría
    export: boolean           // Exportar reportes
}

export interface UsersPermissions {
    view: boolean             // Ver usuarios
    create: boolean           // Crear usuarios
    edit: boolean             // Editar usuarios
    delete: boolean           // Eliminar usuarios
    editRoles: boolean        // Crear/editar roles
    editPermissions: boolean  // Editar permisos de usuarios
    viewTimeEntries: boolean  // Ver entradas de tiempo
    editTimeEntries: boolean  // Editar entradas de tiempo
}

export interface SettingsPermissions {
    viewOrganization: boolean // Ver config de organización
    editOrganization: boolean // Editar config de organización
    viewBilling: boolean      // Ver facturación/suscripción
    manageBilling: boolean    // Gestionar suscripción
    manageIntegrations: boolean // Gestionar integraciones
}

export interface POSPermissions {
    accessPOS: boolean        // Acceder al POS
    quickSale: boolean        // Ventas rápidas (sin cliente)
    assignTable: boolean      // Asignar mesas (restaurante)
    transferTable: boolean    // Transferir mesa a otro usuario
    viewKitchen: boolean      // Ver pantalla de cocina
    manageKitchen: boolean    // Gestionar cocina
}

export interface UserPermissions {
    sales: SalesPermissions
    inventory: InventoryPermissions
    clients: ClientPermissions
    cashDrawer: CashDrawerPermissions
    reports: ReportsPermissions
    users: UsersPermissions
    settings: SettingsPermissions
    pos: POSPermissions
}

// ==========================================
// ROLE AND ACTION TYPES
// ==========================================

export type SystemRole = 'owner' | 'admin' | 'manager' | 'cashier' | 'waiter' | 'viewer'

export type ProtectedAction = 
    | 'void_sale'
    | 'refund'
    | 'discount_override'  // Descuento mayor al permitido
    | 'price_override'     // Cambio de precio
    | 'open_drawer'        // Abrir gaveta sin venta
    | 'delete_item'        // Eliminar item de venta
    | 'edit_closed_sale'   // Editar venta cerrada
    | 'force_close_drawer' // Cerrar caja de otro
    | 'edit_time_entry'    // Editar entrada de tiempo
    | 'cash_out'           // Retiro de efectivo
