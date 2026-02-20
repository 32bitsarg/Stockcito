"use server"
import { redirect } from "next/navigation"
import { logError } from '@/lib/logger'

import { db } from "@/lib/db"
import { productSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getSession } from "@/actions/auth-actions"
import { UsageTracker } from "@/lib/subscription/usage-tracker"

export interface ProductPaginationParams {
    query?: string
    page?: number
    perPage?: number
    categoryId?: number
}

export interface PaginatedProductsResult {
    data: Array<{
        id: number
        name: string
        description: string | null
        sku: string | null
        price: number
        cost: number
        stock: number
        minStock: number
        taxRate: number
        categoryId: number | null
        category: { id: number; name: string } | null
        createdAt: Date
        updatedAt: Date
    }>
    total: number
    page: number
    perPage: number
    totalPages: number
}

// Helper to serialize product (Decimal to Number)
const serializeProduct = (p: any) => ({
    ...p,
    price: Number(p.price),
    cost: Number(p.cost),
    taxRate: Number(p.taxRate || 0)
})

// Legacy function for backwards compatibility (returns array)
export async function getProducts(query?: string, page = 1, perPage = 50, categoryId?: number): Promise<any[]> {
    const session = await getSession()
    if (!session?.organizationId) {
        return []
    }

    const where: any = {
        organizationId: session.organizationId
    }
    if (query) {
        where.OR = [
            { name: { contains: query } },
            { sku: { contains: query } },
        ]
    }
    if (categoryId) {
        where.categoryId = categoryId
    }

    const products = await db.product.findMany({
        where: where,
        orderBy: { createdAt: 'desc' },
        take: perPage,
        skip: (page - 1) * perPage,
        include: { category: true }
    })

    return products.map(serializeProduct)
}

// New paginated function
export async function getProductsPaginated(params: ProductPaginationParams): Promise<PaginatedProductsResult> {
    const session = await getSession()
    if (!session?.organizationId) {
        return { data: [], total: 0, page: 1, perPage: 50, totalPages: 0 }
    }

    const query = params.query
    const page = params.page || 1
    const perPage = params.perPage || 50
    const categoryId = params.categoryId

    const where: any = {
        organizationId: session.organizationId
    }
    if (query) {
        where.OR = [
            { name: { contains: query } },
            { sku: { contains: query } },
        ]
    }
    if (categoryId) {
        where.categoryId = categoryId
    }

    const [products, total] = await Promise.all([
        db.product.findMany({
            where: where,
            orderBy: { createdAt: 'desc' },
            take: perPage,
            skip: (page - 1) * perPage,
            include: { category: true }
        }),
        db.product.count({ where })
    ])

    const data = products.map(serializeProduct)

    return {
        data,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage)
    }
}

export async function getProductById(id: number) {
    const session = await getSession()
    if (!session?.organizationId) {
        return null
    }

    const product = await db.product.findFirst({
        where: {
            id,
            organizationId: session.organizationId
        }
    })

    return product ? serializeProduct(product) : null
}

export async function createProduct(data: z.infer<typeof productSchema>) {
    const session = await getSession()
    if (!session?.organizationId) {
        return { error: "No autorizado" }
    }

    // Security check: Only Owner/Admin/Manager can create products
    if (session.role !== 'owner' && session.role !== 'admin' && session.role !== 'manager') {
        return { error: "No tienes permisos para crear productos" }
    }

    // Check subscription limits
    const tracker = new UsageTracker(session.organizationId)
    const canCreate = await tracker.canCreate("products")
    if (!canCreate) {
        return {
            error: "Has alcanzado el límite de productos de tu plan. Actualiza a Premium para agregar más productos.",
            limitReached: true
        }
    }

    const result = productSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten().fieldErrors }

    try {
        const productData = {
            ...result.data,
            sku: result.data.sku || null,
            categoryId: result.data.categoryId ?? null,
            organizationId: session.organizationId
        }
        await db.product.create({ data: productData as any })
    } catch (error: any) {
        logError('Error creating product:', error)
        if (error?.code === 'P2002') {
            return { error: "Ya existe un producto con ese SKU." }
        }
        return { error: "Error al crear producto." }
    }

    revalidatePath("/inventory")
    return { success: true }
}

export async function updateProduct(id: number, data: z.infer<typeof productSchema>) {
    const session = await getSession()
    if (!session?.organizationId) {
        return { error: "No autorizado" }
    }

    // Security check: Only Owner/Admin/Manager can update products
    if (session.role !== 'owner' && session.role !== 'admin' && session.role !== 'manager') {
        return { error: "No tienes permisos para editar productos" }
    }

    const result = productSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten().fieldErrors }

    try {
        // Verify product belongs to organization
        const existing = await db.product.findFirst({
            where: { id, organizationId: session.organizationId }
        })
        if (!existing) {
            return { error: "Producto no encontrado" }
        }

        const productData = {
            ...result.data,
            sku: result.data.sku ?? null,
            categoryId: result.data.categoryId ?? null
        }
        await db.product.update({ where: { id }, data: productData as any })
    } catch (error) {
        return { error: "Error al actualizar producto." }
    }

    revalidatePath("/inventory")
    return { success: true }
}

export async function deleteProduct(id: number) {
    const session = await getSession()
    if (!session?.organizationId) {
        return { error: "No autorizado" }
    }

    // Security check: Only Owner/Admin can delete products (Managers cannot delete typically, but per requirement "buttons must disappear", we can allow managers or restrict. The prompt says "Los empleados (cashier, waiter) deberían tener acceso de solo lectura". Usually managers can edit. Let's stick to Owner/Admin/Manager for DELETE as well to match UI, or stricter? The prompt says "botones de 'Crear', 'Editar' y 'Borrar' deben desaparecer para ellos (empleados)". So Manager IS allowed.
    if (session.role !== 'owner' && session.role !== 'admin' && session.role !== 'manager') {
        return { error: "No tienes permisos para eliminar productos" }
    }

    try {
        // Verify product belongs to organization
        const existing = await db.product.findFirst({
            where: { id, organizationId: session.organizationId }
        })
        if (!existing) {
            return { error: "Producto no encontrado" }
        }

        await db.product.delete({ where: { id } })
        revalidatePath("/inventory")
        return { success: true }
    } catch (error) {
        return { error: "Error al eliminar. Puede tener ventas asociadas." }
    }
}
