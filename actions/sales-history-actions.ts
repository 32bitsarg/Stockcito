"use server"

import { db } from "@/lib/db"
import { startOfDay, endOfDay } from "date-fns"
import { getSession } from "@/actions/auth-actions"

export interface SalesHistoryFilters {
    startDate?: Date
    endDate?: Date
    clientId?: number
    status?: string
    paymentMethod?: string
    page?: number
    limit?: number
}

export interface PaginatedSalesResult {
    data: any[]
    total: number
    page: number
    limit: number
    totalPages: number
}

const serializeSale = (s: any) => ({
    ...s,
    subtotal: Number(s.subtotal),
    taxAmount: Number(s.taxAmount),
    discountAmount: Number(s.discountAmount),
    total: Number(s.total),
    user: s.user ? { name: s.user.name } : null,
    items: s.items.map((i: any) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        taxAmount: Number(i.taxAmount),
        taxRate: Number(i.taxRate || 0),
        discountAmount: Number(i.discountAmount),
        subtotal: Number(i.subtotal),
        product: i.product ? {
            ...i.product,
            price: Number(i.product.price),
            cost: Number(i.product.cost),
            taxRate: Number(i.product.taxRate || 0)
        } : null
    }))
})

export async function getSalesHistory(filters?: SalesHistoryFilters): Promise<PaginatedSalesResult> {
    const session = await getSession()
    if (!session?.organizationId) {
        return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 }
    }

    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const skip = (page - 1) * limit

    const where: any = {
        organizationId: session.organizationId
    }

    // Restrict access for non-admin/manager roles
    const allowedRoles = ['owner', 'admin', 'manager']
    if (!allowedRoles.includes(session.role)) {
        where.userId = session.id
    }

    if (filters?.startDate && filters?.endDate) {
        where.date = {
            gte: startOfDay(filters.startDate),
            lte: endOfDay(filters.endDate),
        }
    }

    if (filters?.clientId) {
        where.clientId = filters.clientId
    }

    if (filters?.status) {
        where.status = filters.status
    }

    if (filters?.paymentMethod) {
        where.paymentMethod = filters.paymentMethod
    }

    const [data, total] = await Promise.all([
        db.sale.findMany({
            where,
            include: {
                client: true,
                user: { select: { name: true } },
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
            skip,
            take: limit,
        }),
        db.sale.count({ where })
    ])

    return {
        data: data.map(serializeSale),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    }
}

// Backwards compatible version
export async function getSalesHistoryAll(filters?: {
    startDate?: Date
    endDate?: Date
    clientId?: number
}) {
    const session = await getSession()
    if (!session?.organizationId) {
        return []
    }

    const where: any = {
        organizationId: session.organizationId
    }

    // Restrict access for non-admin/manager roles
    const allowedRoles = ['owner', 'admin', 'manager']
    if (!allowedRoles.includes(session.role)) {
        where.userId = session.id
    }

    if (filters?.startDate && filters?.endDate) {
        where.date = {
            gte: startOfDay(filters.startDate),
            lte: endOfDay(filters.endDate),
        }
    }

    if (filters?.clientId) {
        where.clientId = filters.clientId
    }

    const sales = await db.sale.findMany({
        where,
        include: {
            client: true,
            user: { select: { name: true } },
            items: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: {
            date: 'desc',
        },
    })

    return sales.map(serializeSale)
}

export async function getSaleDetails(id: number) {
    const session = await getSession()
    if (!session?.organizationId) {
        return null
    }

    const sale = await db.sale.findFirst({
        where: {
            id,
            organizationId: session.organizationId
        },
        include: {
            client: true,
            user: { select: { name: true } },
            items: {
                include: {
                    product: true,
                },
            },
        },
    })

    return sale ? serializeSale(sale) : null
}
