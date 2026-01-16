"use server"
import { logError } from '@/lib/logger'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { discountSchema, DiscountFormValues } from "@/lib/schemas"
import { getSession } from "@/actions/auth-actions"

export async function getDiscounts(query?: string, activeOnly = false) {
    const where: any = {}

    if (query) {
        where.name = { contains: query }
    }

    if (activeOnly) {
        where.isActive = true
        where.OR = [
            { endDate: null },
            { endDate: { gte: new Date() } }
        ]
    }

    return db.discount.findMany({
        where,
        include: {
            category: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function getDiscountById(id: number) {
    return db.discount.findUnique({
        where: { id },
        include: {
            category: { select: { id: true, name: true } }
        }
    })
}

export async function createDiscount(data: DiscountFormValues) {
    const session = await getSession()
    if (!session?.organizationId) return { error: "No autorizado" }

    if (session.role !== 'owner' && session.role !== 'admin' && session.role !== 'manager') {
        return { error: "No tienes permisos para crear descuentos" }
    }
    const result = discountSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten().fieldErrors }

    try {
        const discount = await db.discount.create({
            data: {
                name: result.data.name,
                description: result.data.description || null,
                type: result.data.type,
                value: result.data.value,
                minPurchase: result.data.minPurchase || null,
                maxDiscount: result.data.maxDiscount || null,
                startDate: result.data.startDate || null,
                endDate: result.data.endDate || null,
                isActive: result.data.isActive,
                categoryId: result.data.categoryId || null,
            }
        })
        revalidatePath("/discounts")
        return { success: true, discount }
    } catch (error) {
        logError('Operation failed', error)
        return { error: "Error al crear descuento." }
    }
}

export async function updateDiscount(id: number, data: DiscountFormValues) {
    const session = await getSession()
    if (!session?.organizationId) return { error: "No autorizado" }

    if (session.role !== 'owner' && session.role !== 'admin' && session.role !== 'manager') {
        return { error: "No tienes permisos para editar descuentos" }
    }
    const result = discountSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten().fieldErrors }

    try {
        await db.discount.update({
            where: { id },
            data: {
                name: result.data.name,
                description: result.data.description || null,
                type: result.data.type,
                value: result.data.value,
                minPurchase: result.data.minPurchase || null,
                maxDiscount: result.data.maxDiscount || null,
                startDate: result.data.startDate || null,
                endDate: result.data.endDate || null,
                isActive: result.data.isActive,
                categoryId: result.data.categoryId || null,
            }
        })
        revalidatePath("/discounts")
        revalidatePath(`/discounts/${id}`)
        return { success: true }
    } catch (error) {
        logError('Operation failed', error)
        return { error: "Error al actualizar descuento." }
    }
}

export async function deleteDiscount(id: number) {
    const session = await getSession()
    if (!session?.organizationId) return { error: "No autorizado" }

    if (session.role !== 'owner' && session.role !== 'admin' && session.role !== 'manager') {
        return { error: "No tienes permisos para eliminar descuentos" }
    }
    try {
        await db.discount.delete({ where: { id } })
        revalidatePath("/discounts")
        return { success: true }
    } catch (error) {
        return { error: "Error al eliminar descuento." }
    }
}

export async function toggleDiscountActive(id: number) {
    const session = await getSession()
    if (!session?.organizationId) return { error: "No autorizado" }

    if (session.role !== 'owner' && session.role !== 'admin' && session.role !== 'manager') {
        return { error: "No tienes permisos para editar descuentos" }
    }
    try {
        const discount = await db.discount.findUnique({ where: { id } })
        if (!discount) return { error: "Descuento no encontrado." }

        await db.discount.update({
            where: { id },
            data: { isActive: !discount.isActive }
        })
        revalidatePath("/discounts")
        return { success: true }
    } catch (error) {
        return { error: "Error al cambiar estado del descuento." }
    }
}

// Get applicable discounts for a sale
export async function getApplicableDiscounts(categoryId?: number, total?: number) {
    const now = new Date()

    const discounts = await db.discount.findMany({
        where: {
            isActive: true,
            AND: [
                {
                    OR: [
                        { startDate: null },
                        { startDate: { lte: now } }
                    ]
                },
                {
                    OR: [
                        { endDate: null },
                        { endDate: { gte: now } }
                    ]
                }
            ]
        }
    })

    // Filter by category and minimum purchase
    return discounts.filter(d => {
        if (d.categoryId && categoryId && d.categoryId !== categoryId) return false
        if (d.minPurchase && total && Number(d.minPurchase) > total) return false
        return true
    })
}
