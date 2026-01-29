"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { supplierSchema, SupplierFormValues } from "@/lib/schemas"
import { getSession } from "@/actions/auth-actions"
import { UsageTracker } from "@/lib/subscription/usage-tracker"

// Helper to get organizationId
async function getOrgId(): Promise<number | null> {
    const session = await getSession()
    return session?.organizationId || null
}

export async function getSuppliers(query?: string) {
    const organizationId = await getOrgId()
    if (!organizationId) return []

    // Check if user has access to suppliers feature
    const tracker = new UsageTracker(organizationId)
    const hasAccess = await tracker.hasFeature('suppliers')
    if (!hasAccess) {
        return [] // Return empty for free users - UI should show upgrade prompt
    }

    const where: any = { organizationId }

    if (query) {
        where.OR = [
            { name: { contains: query } },
            { email: { contains: query } },
        ]
    }

    return db.supplier.findMany({
        where,
        include: {
            _count: { select: { products: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function getSupplierById(id: number) {
    const organizationId = await getOrgId()
    if (!organizationId) return null

    return db.supplier.findFirst({
        where: { id, organizationId },
        include: {
            products: {
                select: {
                    id: true,
                    name: true,
                    sku: true,
                    stock: true,
                    minStock: true,
                    price: true,
                    category: { select: { id: true, name: true } }
                }
            },
            _count: { select: { products: true } }
        }
    })
}

export async function createSupplier(data: SupplierFormValues) {
    const organizationId = await getOrgId()
    if (!organizationId) return { error: "No autenticado" }

    // Check feature access
    const tracker = new UsageTracker(organizationId)
    const hasAccess = await tracker.hasFeature('suppliers')
    if (!hasAccess) {
        return { error: "Tu plan no incluye gestión de proveedores. Mejora a Emprendedor o Pyme." }
    }

    // Check supplier limit
    const supplierLimit = await tracker.checkLimit('suppliers')
    if (!supplierLimit.allowed) {
        return { error: supplierLimit.message || "Has alcanzado el límite de proveedores de tu plan" }
    }

    const result = supplierSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten().fieldErrors }

    try {
        const supplier = await db.supplier.create({
            data: {
                name: result.data.name,
                email: result.data.email || null,
                phone: result.data.phone || null,
                address: result.data.address || null,
                taxId: result.data.taxId || null,
                website: result.data.website || null,
                notes: result.data.notes || null,
                organizationId,
            }
        })
        revalidatePath("/suppliers")
        return { success: true, supplier }
    } catch (error: any) {
        return { error: "Error al crear proveedor." }
    }
}

export async function updateSupplier(id: number, data: SupplierFormValues) {
    const organizationId = await getOrgId()
    if (!organizationId) return { error: "No autenticado" }

    // Verify supplier belongs to organization
    const existing = await db.supplier.findFirst({
        where: { id, organizationId }
    })
    if (!existing) return { error: "Proveedor no encontrado" }

    const result = supplierSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten().fieldErrors }

    try {
        await db.supplier.update({
            where: { id },
            data: {
                name: result.data.name,
                email: result.data.email || null,
                phone: result.data.phone || null,
                address: result.data.address || null,
                taxId: result.data.taxId || null,
                website: result.data.website || null,
                notes: result.data.notes || null,
            }
        })
        revalidatePath("/suppliers")
        revalidatePath(`/suppliers/${id}`)
        return { success: true }
    } catch (error) {
        return { error: "Error al actualizar proveedor." }
    }
}

export async function deleteSupplier(id: number) {
    const organizationId = await getOrgId()
    if (!organizationId) return { error: "No autenticado" }

    try {
        // Check if supplier exists and belongs to organization
        const supplier = await db.supplier.findFirst({
            where: { id, organizationId },
            include: { _count: { select: { products: true } } }
        })

        if (!supplier) {
            return { error: "Proveedor no encontrado" }
        }

        if (supplier._count.products > 0) {
            return { error: "No se puede eliminar un proveedor con productos asociados. Reasigne los productos primero." }
        }

        await db.supplier.delete({ where: { id } })
        revalidatePath("/suppliers")
        return { success: true }
    } catch (error) {
        return { error: "Error al eliminar proveedor." }
    }
}
