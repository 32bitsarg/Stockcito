"use server"

import { db } from "@/lib/db"
import { getSession, requireAuth } from "@/actions/auth-actions"
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays, subMonths } from "date-fns"

export type PeriodType = "today" | "week" | "month" | "custom"

interface DateRange {
    startDate: Date
    endDate: Date
}

function getDateRange(period: PeriodType, customStart?: Date, customEnd?: Date): DateRange {
    const now = new Date()
    
    switch (period) {
        case "today":
            return { startDate: startOfDay(now), endDate: endOfDay(now) }
        case "week":
            return { startDate: startOfWeek(now, { weekStartsOn: 1 }), endDate: endOfWeek(now, { weekStartsOn: 1 }) }
        case "month":
            return { startDate: startOfMonth(now), endDate: endOfMonth(now) }
        case "custom":
            return {
                startDate: customStart ? startOfDay(customStart) : startOfDay(now),
                endDate: customEnd ? endOfDay(customEnd) : endOfDay(now)
            }
        default:
            return { startDate: startOfDay(now), endDate: endOfDay(now) }
    }
}

// Reporte de ventas
export async function getSalesReport(period: PeriodType, customStart?: Date, customEnd?: Date) {
    await requireAuth()
    
    const { startDate, endDate } = getDateRange(period, customStart, customEnd)
    
    const sales = await db.sale.findMany({
        where: {
            date: { gte: startDate, lte: endDate },
            status: { not: "CANCELLED" }
        },
        include: {
            client: { select: { name: true } },
            user: { select: { name: true } },
            items: {
                include: {
                    product: { select: { name: true, category: { select: { name: true } } } }
                }
            }
        },
        orderBy: { date: "desc" }
    })

    // Calcular estadísticas
    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const totalTax = sales.reduce((sum, sale) => sum + Number(sale.taxAmount), 0)
    const totalDiscount = sales.reduce((sum, sale) => sum + Number(sale.discountAmount), 0)
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0
    
    // Ventas por día
    const salesByDay: Record<string, { count: number; total: number }> = {}
    sales.forEach(sale => {
        const day = sale.date.toISOString().split("T")[0]
        if (!salesByDay[day]) {
            salesByDay[day] = { count: 0, total: 0 }
        }
        salesByDay[day].count++
        salesByDay[day].total += Number(sale.total)
    })
    
    // Ventas por hora
    const salesByHour: number[] = new Array(24).fill(0)
    sales.forEach(sale => {
        const hour = sale.date.getHours()
        salesByHour[hour]++
    })

    // Vendedor con más ventas
    const salesByUser: Record<string, { name: string; count: number; total: number }> = {}
    sales.forEach(sale => {
        const userName = sale.user?.name || "Sin asignar"
        const key = sale.userId?.toString() || "none"
        if (!salesByUser[key]) {
            salesByUser[key] = { name: userName, count: 0, total: 0 }
        }
        salesByUser[key].count++
        salesByUser[key].total += Number(sale.total)
    })

    return {
        period: { startDate, endDate },
        summary: {
            totalSales,
            totalRevenue,
            totalTax,
            totalDiscount,
            averageTicket
        },
        salesByDay: Object.entries(salesByDay).map(([date, data]) => ({
            date,
            ...data
        })),
        salesByHour,
        salesByUser: Object.values(salesByUser).sort((a, b) => b.total - a.total),
        sales
    }
}

// Productos más vendidos
export async function getTopProductsReport(period: PeriodType, limit: number = 20, customStart?: Date, customEnd?: Date) {
    await requireAuth()
    
    const { startDate, endDate } = getDateRange(period, customStart, customEnd)
    
    const saleItems = await db.saleItem.findMany({
        where: {
            sale: {
                date: { gte: startDate, lte: endDate },
                status: { not: "CANCELLED" }
            }
        },
        include: {
            product: {
                include: { category: { select: { name: true } } }
            }
        }
    })

    // Agrupar por producto
    const productStats: Record<number, {
        id: number
        name: string
        category: string
        totalQuantity: number
        totalRevenue: number
        avgPrice: number
    }> = {}

    saleItems.forEach(item => {
        const pid = item.productId
        if (!productStats[pid]) {
            productStats[pid] = {
                id: pid,
                name: item.product.name,
                category: item.product.category?.name || "Sin categoría",
                totalQuantity: 0,
                totalRevenue: 0,
                avgPrice: 0
            }
        }
        productStats[pid].totalQuantity += item.quantity
        productStats[pid].totalRevenue += Number(item.subtotal)
    })

    // Calcular precio promedio
    Object.values(productStats).forEach(p => {
        p.avgPrice = p.totalQuantity > 0 ? p.totalRevenue / p.totalQuantity : 0
    })

    const sortedProducts = Object.values(productStats)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, limit)

    const totalItemsSold = saleItems.reduce((sum, item) => sum + item.quantity, 0)
    const totalRevenue = saleItems.reduce((sum, item) => sum + Number(item.subtotal), 0)

    return {
        period: { startDate, endDate },
        summary: {
            totalProducts: Object.keys(productStats).length,
            totalItemsSold,
            totalRevenue
        },
        products: sortedProducts
    }
}

// Reporte de inventario
export async function getInventoryReport() {
    await requireAuth()
    
    const products = await db.product.findMany({
        include: {
            category: { select: { name: true } },
            supplier: { select: { name: true } }
        },
        orderBy: { stock: "asc" }
    })

    const lowStock = products.filter(p => p.stock <= p.minStock)
    const outOfStock = products.filter(p => p.stock === 0)
    const healthyStock = products.filter(p => p.stock > p.minStock)

    const totalValue = products.reduce((sum, p) => sum + Number(p.cost) * p.stock, 0)
    const totalRetailValue = products.reduce((sum, p) => sum + Number(p.price) * p.stock, 0)
    const potentialProfit = totalRetailValue - totalValue

    // Por categoría
    const byCategory: Record<string, { count: number; totalStock: number; totalValue: number }> = {}
    products.forEach(p => {
        const cat = p.category?.name || "Sin categoría"
        if (!byCategory[cat]) {
            byCategory[cat] = { count: 0, totalStock: 0, totalValue: 0 }
        }
        byCategory[cat].count++
        byCategory[cat].totalStock += p.stock
        byCategory[cat].totalValue += Number(p.cost) * p.stock
    })

    return {
        summary: {
            totalProducts: products.length,
            lowStockCount: lowStock.length,
            outOfStockCount: outOfStock.length,
            healthyStockCount: healthyStock.length,
            totalValue,
            totalRetailValue,
            potentialProfit
        },
        lowStock,
        outOfStock,
        byCategory: Object.entries(byCategory).map(([name, data]) => ({
            name,
            ...data
        })).sort((a, b) => b.totalValue - a.totalValue),
        allProducts: products
    }
}

// Reporte de clientes
export async function getClientsReport(period: PeriodType, customStart?: Date, customEnd?: Date) {
    await requireAuth()
    
    const { startDate, endDate } = getDateRange(period, customStart, customEnd)
    
    const clients = await db.client.findMany({
        include: {
            sales: {
                where: {
                    date: { gte: startDate, lte: endDate },
                    status: { not: "CANCELLED" }
                },
                select: {
                    id: true,
                    total: true,
                    date: true
                }
            },
            _count: {
                select: { sales: true }
            }
        }
    })

    // Calcular métricas por cliente
    const clientStats = clients.map(client => {
        const periodSales = client.sales.length
        const periodRevenue = client.sales.reduce((sum, s) => sum + Number(s.total), 0)
        const avgTicket = periodSales > 0 ? periodRevenue / periodSales : 0
        const lastSale = client.sales.length > 0 
            ? client.sales.sort((a, b) => b.date.getTime() - a.date.getTime())[0].date 
            : null

        return {
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            totalSalesAllTime: client._count.sales,
            periodSales,
            periodRevenue,
            avgTicket,
            lastSale
        }
    })

    const topClients = [...clientStats]
        .sort((a, b) => b.periodRevenue - a.periodRevenue)
        .slice(0, 10)

    const activeClients = clientStats.filter(c => c.periodSales > 0).length
    const totalRevenue = clientStats.reduce((sum, c) => sum + c.periodRevenue, 0)

    // Clientes nuevos en el período
    const newClients = await db.client.count({
        where: {
            createdAt: { gte: startDate, lte: endDate }
        }
    })

    return {
        period: { startDate, endDate },
        summary: {
            totalClients: clients.length,
            activeClients,
            newClients,
            totalRevenue
        },
        topClients,
        allClients: clientStats.sort((a, b) => b.periodRevenue - a.periodRevenue)
    }
}

// Comparación con período anterior
export async function getComparisonReport(period: PeriodType) {
    await requireAuth()
    
    const { startDate, endDate } = getDateRange(period)
    const periodLength = endDate.getTime() - startDate.getTime()
    const previousStart = new Date(startDate.getTime() - periodLength)
    const previousEnd = new Date(endDate.getTime() - periodLength)

    // Período actual
    const currentSales = await db.sale.aggregate({
        where: {
            date: { gte: startDate, lte: endDate },
            status: { not: "CANCELLED" }
        },
        _sum: { total: true },
        _count: true
    })

    // Período anterior
    const previousSales = await db.sale.aggregate({
        where: {
            date: { gte: previousStart, lte: previousEnd },
            status: { not: "CANCELLED" }
        },
        _sum: { total: true },
        _count: true
    })

    const currentRevenue = Number(currentSales._sum.total) || 0
    const previousRevenue = Number(previousSales._sum.total) || 0
    const currentCount = currentSales._count
    const previousCount = previousSales._count

    const revenueChange = previousRevenue > 0 
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
        : 100
    const salesChange = previousCount > 0 
        ? ((currentCount - previousCount) / previousCount) * 100 
        : 100

    return {
        current: {
            period: { startDate, endDate },
            revenue: currentRevenue,
            salesCount: currentCount
        },
        previous: {
            period: { startDate: previousStart, endDate: previousEnd },
            revenue: previousRevenue,
            salesCount: previousCount
        },
        changes: {
            revenueChange,
            salesChange,
            revenueDiff: currentRevenue - previousRevenue,
            salesDiff: currentCount - previousCount
        }
    }
}

// Exportar datos a CSV
export async function exportSalesCSV(period: PeriodType, customStart?: Date, customEnd?: Date) {
    await requireAuth()
    
    const { startDate, endDate } = getDateRange(period, customStart, customEnd)
    
    const sales = await db.sale.findMany({
        where: {
            date: { gte: startDate, lte: endDate }
        },
        include: {
            client: { select: { name: true } },
            items: {
                include: {
                    product: { select: { name: true } }
                }
            }
        },
        orderBy: { date: "asc" }
    })

    // Generar CSV
    const headers = ["ID", "Fecha", "Cliente", "Productos", "Subtotal", "IVA", "Descuento", "Total", "Estado"]
    const rows = sales.map(sale => [
        sale.id.toString(),
        sale.date.toISOString(),
        sale.client?.name || "Consumidor Final",
        sale.items.map(i => `${i.product.name} x${i.quantity}`).join("; "),
        Number(sale.subtotal).toFixed(2),
        Number(sale.taxAmount).toFixed(2),
        Number(sale.discountAmount).toFixed(2),
        Number(sale.total).toFixed(2),
        sale.status
    ])

    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    return {
        filename: `ventas_${startDate.toISOString().split("T")[0]}_${endDate.toISOString().split("T")[0]}.csv`,
        content: csvContent
    }
}

// Obtener resumen de todos los reportes para la página principal
export async function getReportsSummary() {
    await requireAuth()
    
    const { startDate, endDate } = getDateRange("month")
    
    // Resumen de ventas
    const sales = await db.sale.findMany({
        where: {
            date: { gte: startDate, lte: endDate },
            status: { not: "CANCELLED" }
        },
        select: { total: true, taxAmount: true }
    })
    const salesSummary = {
        totalSales: sales.length,
        totalRevenue: sales.reduce((sum, s) => sum + Number(s.total), 0),
        totalTax: sales.reduce((sum, s) => sum + Number(s.taxAmount), 0)
    }

    // Top 5 productos
    const topProducts = await db.saleItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5
    })
    const productIds = topProducts.map(p => p.productId)
    const products = await db.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true }
    })
    const topProductsWithNames = topProducts.map(tp => {
        const product = products.find(p => p.id === tp.productId)
        return {
            name: product?.name || "Desconocido",
            quantity: tp._sum.quantity || 0,
            revenue: Number(tp._sum.subtotal) || 0
        }
    })

    // Resumen de inventario
    const inventoryProducts = await db.product.findMany({
        select: { stock: true, minStock: true, price: true, cost: true }
    })
    const inventorySummary = {
        totalProducts: inventoryProducts.length,
        lowStock: inventoryProducts.filter(p => p.stock <= p.minStock && p.stock > 0).length,
        outOfStock: inventoryProducts.filter(p => p.stock === 0).length,
        totalValue: inventoryProducts.reduce((sum, p) => sum + (Number(p.cost) * p.stock), 0)
    }

    // Resumen de clientes
    const clientSales = await db.sale.groupBy({
        by: ["clientId"],
        where: {
            date: { gte: startDate, lte: endDate },
            clientId: { not: null }
        },
        _count: { id: true },
        _sum: { total: true },
        orderBy: { _sum: { total: "desc" } },
        take: 5
    })
    const clientIds = clientSales.map(c => c.clientId).filter((id): id is number => id !== null)
    const clients = await db.client.findMany({
        where: { id: { in: clientIds } },
        select: { id: true, name: true }
    })
    const topClients = clientSales.map(cs => {
        const client = clients.find(c => c.id === cs.clientId)
        return {
            name: client?.name || "Consumidor Final",
            purchases: cs._count.id,
            total: Number(cs._sum.total) || 0
        }
    })

    const totalClients = await db.client.count()
    const activeClients = clientSales.length

    return {
        period: { startDate, endDate },
        sales: salesSummary,
        topProducts: topProductsWithNames,
        inventory: inventorySummary,
        clients: {
            total: totalClients,
            active: activeClients,
            topClients
        }
    }
}
