/**
 * Tipos compartidos para el sistema POS (Punto de Venta).
 * 
 * SINGLE SOURCE OF TRUTH: Todos los componentes del POS importan
 * sus tipos desde acá. Esto evita duplicaciones y asegura
 * consistencia cuando se agrega un campo nuevo.
 */

/** Producto tal como se muestra en el catálogo del POS */
export interface POSProduct {
    id: number
    name: string
    sku: string | null
    price: number
    stock: number
    taxRate: number
    category?: {
        name: string
    } | null
    unitMeasure?: string
    isWeighable?: boolean
}

/** Item dentro del carrito de compras */
export interface CartItem {
    id: string
    productId: number
    name: string
    price: number
    quantity: number
    taxRate: number
    discountAmount?: number
    discountRate?: number
    unitMeasure?: string
    isWeighable?: boolean
}

/** Cliente simplificado para el selector del POS */
export interface POSClient {
    id: number
    name: string
}

/** Mesa para restaurantes/bares */
export interface POSTable {
    id: number
    number: number
    name: string | null
    capacity: number
    status: 'available' | 'occupied' | 'reserved' | 'cleaning'
}

/** Métodos de pago disponibles */
export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia'

/** Labels amigables para cada método de pago */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
}
