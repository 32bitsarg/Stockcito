"use server"

import { db } from "@/lib/db"
import { getSession } from "@/actions/auth-actions"
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, subMonths } from "date-fns"

// Helper to get organizationId or throw
async function getOrgId(): Promise<number | null> {
    const session = await getSession()
    return session?.organizationId || null
}

// Helper to serialize product (Decimal to Number)
const serializeProduct = (p: any) => ({
    ...p,
    price: Number(p.price),
    cost: Number(p.cost),
    taxRate: Number(p.taxRate || 0)
})

// Helper to serialize sale (Decimal to Number)
const serializeSale = (s: any) => ({
    ...s,
    subtotal: Number(s.subtotal),
    taxAmount: Number(s.taxAmount),
    discountAmount: Number(s.discountAmount),
    total: Number(s.total),
    items: s.items.map((i: any) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        taxAmount: Number(i.taxAmount),
        discountAmount: Number(i.discountAmount),
        subtotal: Number(i.subtotal),
        product: i.product ? serializeProduct(i.product) : null
    }))
})

export async function getSalesByDateRange(startDate: Date, endDate: Date) {
    const organizationId = await getOrgId()
    if (!organizationId) return []

    return db.sale.findMany({
        where: {
            organizationId,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
            client: true,
        },
        orderBy: {
            date: 'desc',
        },
    })
}

export async function getDashboardMetrics() {
    const organizationId = await getOrgId()
    if (!organizationId) {
        return {
            todayRevenue: 0,
            todaySalesCount: 0,
            dailyTrend: 0,
            monthRevenue: 0,
            monthSalesCount: 0,
            monthlyTrend: 0,
            lowStockCount: 0,
            inventoryValue: 0,
            totalClients: 0,
        }
    }

    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const yesterdayStart = startOfDay(subDays(now, 1))
    const yesterdayEnd = endOfDay(subDays(now, 1))
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    // Execute all queries in parallel for better performance
    const [
        todaySales,
        yesterdaySales,
        monthSales,
        lastMonthSales,
        allProducts,
        totalClients
    ] = await Promise.all([
        // Ventas de hoy
        db.sale.findMany({
            where: {
                organizationId,
                date: { gte: todayStart, lte: todayEnd },
            },
        }),
        // Ventas de ayer
        db.sale.findMany({
            where: {
                organizationId,
                date: { gte: yesterdayStart, lte: yesterdayEnd },
            },
        }),
        // Ventas del mes
        db.sale.findMany({
            where: {
                organizationId,
                date: { gte: monthStart, lte: monthEnd },
            },
        }),
        // Ventas del mes pasado
        db.sale.findMany({
            where: {
                organizationId,
                date: { gte: lastMonthStart, lte: lastMonthEnd },
            },
        }),
        // Todos los productos
        db.product.findMany({
            where: { organizationId }
        }),
        // Total de clientes
        db.client.count({
            where: { organizationId }
        })
    ])

    // Calculate revenues
    const todayRevenue = todaySales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const monthRevenue = monthSales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const lastMonthRevenue = lastMonthSales.reduce((sum, sale) => sum + Number(sale.total), 0)

    // Productos con stock bajo
    const lowStockProducts = allProducts.filter(p => p.stock <= p.minStock)

    // Valor total del inventario
    const inventoryValue = allProducts.reduce(
        (sum, product) => sum + Number(product.price) * product.stock,
        0
    )

    // Calcular tendencias
    const dailyTrend = yesterdayRevenue > 0
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        : todayRevenue > 0 ? 100 : 0

    const monthlyTrend = lastMonthRevenue > 0
        ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : monthRevenue > 0 ? 100 : 0

    return {
        todayRevenue,
        todaySalesCount: todaySales.length,
        dailyTrend,
        monthRevenue,
        monthSalesCount: monthSales.length,
        monthlyTrend,
        lowStockCount: lowStockProducts.length,
        inventoryValue,
        totalClients,
    }
}

export async function getTopProducts(limit: number = 5) {
    const organizationId = await getOrgId()
    if (!organizationId) return []

    // First get products for this organization
    const orgProducts = await db.product.findMany({
        where: { organizationId },
        select: { id: true }
    })
    const productIds = orgProducts.map(p => p.id)

    // Obtener items de ventas agrupados por producto (only for org products)
    const salesItems = await db.saleItem.groupBy({
        by: ['productId'],
        where: {
            productId: { in: productIds }
        },
        _sum: {
            quantity: true,
            subtotal: true,
        },
        orderBy: {
            _sum: {
                subtotal: 'desc',
            },
        },
        take: limit,
    })

    // Obtener detalles de los productos
    const productsWithStats = await Promise.all(
        salesItems.map(async (item) => {
            const product = await db.product.findUnique({
                where: { id: item.productId },
            })
            return {
                product: product ? serializeProduct(product) : null,
                totalQuantity: item._sum.quantity || 0,
                totalRevenue: Number(item._sum.subtotal || 0),
            }
        })
    )

    return productsWithStats
}

export async function getRecentSales(limit: number = 10) {
    const organizationId = await getOrgId()
    if (!organizationId) return []

    const sales = await db.sale.findMany({
        where: { organizationId },
        take: limit,
        orderBy: {
            date: 'desc',
        },
        include: {
            client: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
    })

    return sales.map(serializeSale)
}

export async function getSalesChartData(days: number = 7) {
    const organizationId = await getOrgId()
    if (!organizationId) return []

    const startDate = startOfDay(subDays(new Date(), days - 1))
    const sales = await db.sale.findMany({
        where: {
            organizationId,
            date: {
                gte: startDate,
            },
        },
        orderBy: {
            date: 'asc',
        },
    })

    // Agrupar por día
    const salesByDay: Record<string, { date: string; revenue: number; count: number }> = {}

    for (let i = 0; i < days; i++) {
        const date = subDays(new Date(), days - 1 - i)
        const dateKey = startOfDay(date).toISOString().split('T')[0]
        salesByDay[dateKey] = {
            date: dateKey,
            revenue: 0,
            count: 0,
        }
    }

    sales.forEach((sale) => {
        const dateKey = startOfDay(sale.date).toISOString().split('T')[0]
        if (salesByDay[dateKey]) {
            salesByDay[dateKey].revenue += Number(sale.total)
            salesByDay[dateKey].count += 1
        }
    })

    return Object.values(salesByDay)
}

export async function getLowStockProducts() {
    const organizationId = await getOrgId()
    if (!organizationId) return []

    const products = await db.product.findMany({
        where: {
            organizationId
        },
        orderBy: {
            stock: 'asc'
        }
    })

    // Filtrar manualmente ya que Prisma no soporta comparación entre campos
    const lowStock = products.filter(p => p.stock <= p.minStock)
    return lowStock.map(serializeProduct)
}

export async function getUserRecentSales(userId: number, limit: number = 5) {
    const organizationId = await getOrgId()
    if (!organizationId) return []

    const sales = await db.sale.findMany({
        where: {
            organizationId,
            userId
        },
        take: limit,
        orderBy: {
            date: 'desc',
        },
        include: {
            client: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
    })

    return sales.map(serializeSale)
}
