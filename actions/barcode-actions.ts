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
        unitMeasure?: string
        isWeighable?: boolean
    }
    canCreateProduct: boolean
    canEditStock: boolean
    scannedCode: string
    weightFromScale?: number
    parsedSku?: string
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

    // Check for scale barcodes (e.g., 20PPPPWWWWWXC)
    let isScaleBarcode = false;
    let scaleWeight = 0;
    let searchSku = code;

    // Configuración adaptable: Se podría leer de db.organization.settings a futuro
    const scalePrefix = "20";
    const scaleSkuLength = 4;
    const scaleWeightLength = 5;

    // EAN-13 standard for in-store weighing: 13 digits starting with prefix "20" (or similar)
    if (code.length === 13 && code.startsWith(scalePrefix)) {
        isScaleBarcode = true;
        searchSku = code.substring(scalePrefix.length, scalePrefix.length + scaleSkuLength);
        const weightStr = code.substring(scalePrefix.length + scaleSkuLength, scalePrefix.length + scaleSkuLength + scaleWeightLength);
        scaleWeight = parseInt(weightStr, 10);
    }

    // Search for product by SKU
    const product = await db.product.findFirst({
        where: {
            organizationId: session.organizationId,
            OR: [
                { sku: code },
                { sku: code.toLowerCase() },
                { sku: code.toUpperCase() },
                ...(isScaleBarcode ? [
                    { sku: searchSku },
                    { sku: searchSku.toLowerCase() },
                    { sku: searchSku.toUpperCase() }
                ] : [])
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
            // @ts-ignore
            unitMeasure: true,
            // @ts-ignore
            isWeighable: true,
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
            // @ts-ignore
            category: product.category?.name || null,
            // Only include sensitive data if user has permission
            costPrice: canViewCost ? Number(product.cost) : undefined,
            minStock: canViewCost ? product.minStock : undefined,
            // @ts-ignore
            unitMeasure: product.unitMeasure,
            // @ts-ignore
            isWeighable: product.isWeighable
        },
        canCreateProduct,
        canEditStock,
        scannedCode: code,
        weightFromScale: isScaleBarcode ? scaleWeight : undefined,
        parsedSku: searchSku
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
