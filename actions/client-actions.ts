"use server"

import { db } from "@/lib/db"
import { clientSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getSession } from "@/actions/auth-actions"
import { UsageTracker } from "@/lib/subscription/usage-tracker"

export interface PaginationParams {
    page?: number
    limit?: number
    query?: string
}

export interface PaginatedResult<T> {
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export async function getClients(params?: PaginationParams): Promise<PaginatedResult<any>> {
    const session = await getSession()
    if (!session?.organizationId) {
        return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 }
    }

    const page = params?.page || 1
    const limit = params?.limit || 20
    const skip = (page - 1) * limit

    const where: any = {
        organizationId: session.organizationId
    }

    if (params?.query) {
        where.OR = [
            { name: { contains: params.query } },
            { email: { contains: params.query } },
        ]
    }

    const [data, total] = await Promise.all([
        db.client.findMany({
            where,
            include: {
                _count: { select: { sales: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        db.client.count({ where })
    ])

    return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    }
}

// Backwards-compatible version for simple use cases
export async function getClientsAll(query?: string) {
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
            { email: { contains: query } },
        ]
    }

    return db.client.findMany({
        where,
        include: {
            _count: { select: { sales: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function getClientById(id: number) {
    const session = await getSession()
    if (!session?.organizationId) {
        return null
    }

    const client = await db.client.findFirst({
        where: {
            id,
            organizationId: session.organizationId
        },
        include: {
            sales: {
                include: { items: { include: { product: true } } },
                orderBy: { date: 'desc' },
                take: 10
            },
            _count: { select: { sales: true } }
        }
    })

    if (!client) return null

    // Serializar Decimals → numbers para Client Components
    return {
        ...client,
        sales: client.sales.map(sale => ({
            ...sale,
            subtotal: Number(sale.subtotal),
            taxAmount: Number(sale.taxAmount),
            discountAmount: Number(sale.discountAmount),
            total: Number(sale.total),
            items: sale.items.map(item => ({
                ...item,
                unitPrice: Number(item.unitPrice),
                taxRate: Number(item.taxRate),
                taxAmount: Number(item.taxAmount),
                discountAmount: Number(item.discountAmount),
                subtotal: Number(item.subtotal),
                product: item.product ? {
                    ...item.product,
                    price: Number(item.product.price),
                    cost: Number(item.product.cost),
                    taxRate: Number(item.product.taxRate || 0)
                } : null
            }))
        }))
    }
}

export async function createClient(data: z.infer<typeof clientSchema>) {
    const session = await getSession()
    if (!session?.organizationId) {
        return { error: "No autorizado" }
    }

    // Check subscription limits
    const tracker = new UsageTracker(session.organizationId)
    const canCreate = await tracker.canCreate("clients")
    if (!canCreate) {
        return {
            error: "Has alcanzado el límite de clientes de tu plan. Actualiza a Premium para agregar más clientes.",
            limitReached: true
        }
    }

    const result = clientSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten().fieldErrors }

    try {
        const client = await db.client.create({
            data: {
                ...result.data,
                organizationId: session.organizationId
            }
        })
        revalidatePath("/clients")
        return { success: true, client }
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return { error: "Ya existe un cliente con ese email." }
        }
        return { error: "Error al crear cliente." }
    }
}

export async function updateClient(id: number, data: z.infer<typeof clientSchema>) {
    const session = await getSession()
    if (!session?.organizationId) {
        return { error: "No autorizado" }
    }

    const result = clientSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten().fieldErrors }

    try {
        // Verify client belongs to organization
        const existing = await db.client.findFirst({
            where: { id, organizationId: session.organizationId }
        })
        if (!existing) {
            return { error: "Cliente no encontrado" }
        }

        await db.client.update({
            where: { id },
            data: result.data
        })
        revalidatePath("/clients")
        revalidatePath(`/clients/${id}`)
        return { success: true }
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return { error: "Ya existe un cliente con ese email." }
        }
        return { error: "Error al actualizar cliente." }
    }
}

export async function deleteClient(id: number) {
    const session = await getSession()
    if (!session?.organizationId) {
        return { error: "No autorizado" }
    }

    try {
        // Check if client belongs to org and has sales
        const client = await db.client.findFirst({
            where: {
                id,
                organizationId: session.organizationId
            },
            include: { _count: { select: { sales: true } } }
        })

        if (!client) {
            return { error: "Cliente no encontrado" }
        }

        if (client._count.sales > 0) {
            return { error: "No se puede eliminar un cliente con ventas asociadas." }
        }

        await db.client.delete({ where: { id } })
        revalidatePath("/clients")
        return { success: true }
    } catch (error) {
        return { error: "Error al eliminar cliente." }
    }
}

export async function getClientSalesHistory(clientId: number, page = 1, limit = 20) {
    const session = await getSession()
    if (!session?.organizationId) {
        return { sales: [], total: 0, pages: 0 }
    }

    const skip = (page - 1) * limit

    // Verify client belongs to organization
    const client = await db.client.findFirst({
        where: { id: clientId, organizationId: session.organizationId }
    })

    if (!client) {
        return { sales: [], total: 0, pages: 0 }
    }

    const [sales, total] = await Promise.all([
        db.sale.findMany({
            where: { clientId },
            include: {
                items: { include: { product: true } }
            },
            orderBy: { date: 'desc' },
            skip,
            take: limit
        }),
        db.sale.count({ where: { clientId } })
    ])

    // Serializar Decimals → numbers para Client Components
    const serializedSales = sales.map(sale => ({
        ...sale,
        subtotal: Number(sale.subtotal),
        taxAmount: Number(sale.taxAmount),
        discountAmount: Number(sale.discountAmount),
        total: Number(sale.total),
        items: sale.items.map(item => ({
            ...item,
            unitPrice: Number(item.unitPrice),
            taxRate: Number(item.taxRate),
            taxAmount: Number(item.taxAmount),
            discountAmount: Number(item.discountAmount),
            subtotal: Number(item.subtotal),
            product: item.product ? {
                ...item.product,
                price: Number(item.product.price),
                cost: Number(item.product.cost),
                taxRate: Number(item.product.taxRate || 0)
            } : null
        }))
    }))

    return { sales: serializedSales, total, pages: Math.ceil(total / limit) }
}
