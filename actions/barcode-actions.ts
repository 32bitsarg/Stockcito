"use server"

import { db } from "@/lib/db"
import { getSession } from "@/actions/auth-actions"
import { hasPermission, type UserPermissions } from "@/lib/permissions"

export interface BarcodeSearchResult {
    found: boolean
    product?: {
        id: number
        name: string
        sku: string
        price: number
        stock: number
        taxRate: number
        category?: string | null
        // Sensitive data - only for authorized roles
        costPrice?: number | null
        minStock?: number | null
    }
    canCreateProduct: boolean
    canEditStock: boolean
    scannedCode: string
}

/**
 * Search for a product by barcode/SKU
 * Returns product data if found, and permissions for the current user
 */
export async function searchByBarcode(code: string): Promise<BarcodeSearchResult> {
    const session = await getSession()

    if (!session?.organizationId) {
        return {
            found: false,
            canCreateProduct: false,
            canEditStock: false,
            scannedCode: code
        }
    }

    const permissions = session.permissions as UserPermissions

    // Check user permissions
    const canCreateProduct = hasPermission(permissions, 'inventory', 'create')
    const canEditStock = hasPermission(permissions, 'inventory', 'adjustStock')
    const canViewCost = hasPermission(permissions, 'inventory', 'viewCost')

    // Search for product by SKU
    const product = await db.product.findFirst({
        where: {
            organizationId: session.organizationId,
            OR: [
                { sku: code },
                { sku: code.toLowerCase() },
                { sku: code.toUpperCase() }
            ]
        },
        select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            stock: true,
            taxRate: true,
            cost: true,
            minStock: true,
            category: {
                select: {
                    name: true
                }
            }
        }
    })

    if (!product) {
        return {
            found: false,
            canCreateProduct,
            canEditStock,
            scannedCode: code
        }
    }

    // Build response with permissions filtering
    return {
        found: true,
        product: {
            id: product.id,
            name: product.name,
            sku: product.sku || code,
            price: Number(product.price),
            stock: product.stock,
            taxRate: Number(product.taxRate),
            category: product.category?.name || null,
            // Only include sensitive data if user has permission
            costPrice: canViewCost ? Number(product.cost) : undefined,
            minStock: canViewCost ? product.minStock : undefined
        },
        canCreateProduct,
        canEditStock,
        scannedCode: code
    }
}

/**
 * Quick stock adjustment from POS
 */
export async function quickStockAdjust(
    productId: number,
    adjustment: number,
    reason: string
): Promise<{ success: boolean; newStock?: number; error?: string }> {
    const session = await getSession()

    if (!session?.organizationId) {
        return { success: false, error: "No autenticado" }
    }

    const permissions = session.permissions as UserPermissions

    if (!hasPermission(permissions, 'inventory', 'adjustStock')) {
        return { success: false, error: "Sin permiso para ajustar stock" }
    }

    try {
        // Get current product
        const product = await db.product.findFirst({
            where: {
                id: productId,
                organizationId: session.organizationId
            }
        })

        if (!product) {
            return { success: false, error: "Producto no encontrado" }
        }

        const newStock = product.stock + adjustment

        if (newStock < 0) {
            return { success: false, error: "El stock no puede ser negativo" }
        }

        // Update stock
        await db.product.update({
            where: { id: productId },
            data: { stock: newStock }
        })

        // Log the adjustment (optional - if you have stock movement tracking)
        // You can add this later if needed

        return { success: true, newStock }
    } catch (error) {
        console.error("Error adjusting stock:", error)
        return { success: false, error: "Error al ajustar stock" }
    }
}
