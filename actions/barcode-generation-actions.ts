"use server"

import { db } from "@/lib/db"
import { getSession } from "@/actions/auth-actions"

/**
 * Calcula el dígito verificador EAN-13.
 * 
 * El algoritmo: se suman los 12 primeros dígitos alternando peso 1 y 3.
 * El check digit es (10 - (suma % 10)) % 10.
 * 
 * Ejemplo: para "200000000001" → check digit = 7 → EAN completo = "2000000000017"
 */
function calculateEAN13CheckDigit(first12: string): number {
    let sum = 0
    for (let i = 0; i < 12; i++) {
        const digit = parseInt(first12[i], 10)
        sum += i % 2 === 0 ? digit : digit * 3
    }
    return (10 - (sum % 10)) % 10
}

/**
 * Genera un EAN-13 válido para uso interno.
 * Prefijo "20" (reservado por GS1 para uso interno de tienda).
 * Formato: 20 + productId (10 dígitos, zero-padded) + check digit
 */
function generateEAN13(productId: number): string {
    const paddedId = productId.toString().padStart(10, '0')
    const first12 = `20${paddedId}`
    const checkDigit = calculateEAN13CheckDigit(first12)
    return `${first12}${checkDigit}`
}

/**
 * Valida que un string sea un EAN-13 válido (13 dígitos + check digit correcto).
 */
function isValidEAN13(code: string): boolean {
    if (!/^\d{13}$/.test(code)) return false
    const first12 = code.substring(0, 12)
    const expectedCheck = calculateEAN13CheckDigit(first12)
    return parseInt(code[12], 10) === expectedCheck
}

export interface BarcodeProduct {
    id: number
    name: string
    sku: string | null
    category: string | null
    hasValidEAN: boolean
}

/**
 * Obtiene productos con su estado de barcode.
 */
export async function getProductsForBarcode(query?: string): Promise<BarcodeProduct[]> {
    const session = await getSession()
    if (!session?.organizationId) return []

    const where: any = {
        organizationId: session.organizationId
    }

    if (query) {
        where.OR = [
            { name: { contains: query } },
            { sku: { contains: query } },
        ]
    }

    const products = await db.product.findMany({
        where,
        select: {
            id: true,
            name: true,
            sku: true,
            category: { select: { name: true } }
        },
        orderBy: { name: 'asc' },
        take: 100
    })

    return products.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category?.name || null,
        hasValidEAN: p.sku ? isValidEAN13(p.sku) : false
    }))
}

/**
 * Genera y guarda un EAN-13 para un producto que no tiene SKU.
 * Si ya tiene SKU, no lo sobreescribe (devuelve error).
 */
export async function generateAndSaveSku(productId: number): Promise<{
    success: boolean
    sku?: string
    error?: string
}> {
    const session = await getSession()
    if (!session?.organizationId) {
        return { success: false, error: "No autorizado" }
    }

    // Verificar que el producto pertenece a la organización
    const product = await db.product.findFirst({
        where: {
            id: productId,
            organizationId: session.organizationId
        }
    })

    if (!product) {
        return { success: false, error: "Producto no encontrado" }
    }

    if (product.sku) {
        return { success: false, error: "Este producto ya tiene un SKU asignado. Eliminá el actual primero si querés generar uno nuevo." }
    }

    const ean = generateEAN13(productId)

    // Verificar que no esté en uso (muy improbable pero por seguridad)
    const existing = await db.product.findFirst({
        where: {
            organizationId: session.organizationId,
            sku: ean
        }
    })

    if (existing) {
        return { success: false, error: "El código generado ya está en uso" }
    }

    await db.product.update({
        where: { id: productId },
        data: { sku: ean }
    })

    return { success: true, sku: ean }
}

/**
 * Actualiza el SKU de un producto manualmente.
 */
export async function updateProductSku(productId: number, sku: string): Promise<{
    success: boolean
    error?: string
}> {
    const session = await getSession()
    if (!session?.organizationId) {
        return { success: false, error: "No autorizado" }
    }

    const product = await db.product.findFirst({
        where: {
            id: productId,
            organizationId: session.organizationId
        }
    })

    if (!product) {
        return { success: false, error: "Producto no encontrado" }
    }

    // Verificar unicidad
    const existing = await db.product.findFirst({
        where: {
            organizationId: session.organizationId,
            sku,
            id: { not: productId }
        }
    })

    if (existing) {
        return { success: false, error: `El código "${sku}" ya está asignado a "${existing.name}"` }
    }

    await db.product.update({
        where: { id: productId },
        data: { sku }
    })

    return { success: true }
}

/**
 * Elimina el SKU de un producto.
 */
export async function clearProductSku(productId: number): Promise<{
    success: boolean
    error?: string
}> {
    const session = await getSession()
    if (!session?.organizationId) {
        return { success: false, error: "No autorizado" }
    }

    const product = await db.product.findFirst({
        where: {
            id: productId,
            organizationId: session.organizationId
        }
    })

    if (!product) {
        return { success: false, error: "Producto no encontrado" }
    }

    await db.product.update({
        where: { id: productId },
        data: { sku: null }
    })

    return { success: true }
}
