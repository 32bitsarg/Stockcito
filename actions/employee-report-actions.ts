"use server"

import { db } from "@/lib/db"
import { getSession } from "@/actions/auth-actions"
import { startOfMonth, endOfMonth, differenceInMinutes } from "date-fns"
import Decimal from 'decimal.js'

/**
 * Obtiene el reporte de empleados para la organización del usuario.
 * 
 * SEGURIDAD:
 * - Valida sesión y organizationId internamente
 * - Solo retorna datos de la organización del usuario autenticado
 * - No acepta organizationId como parámetro externo
 */
export async function getEmployeeReports() {
    const session = await getSession()
    if (!session?.organizationId) return null

    const organizationId = session.organizationId

    try {
        const now = new Date()
        const monthStart = startOfMonth(now)
        const monthEnd = endOfMonth(now)

        // Obtener empleados con sus métricas
        const employees = await db.user.findMany({
            where: {
                organizationId,
                active: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                commissionRate: true
            },
            orderBy: { name: 'asc' }
        })

        // Obtener ventas por empleado en el mes
        const sales = await db.sale.groupBy({
            by: ['userId'],
            where: {
                organizationId,
                date: { gte: monthStart, lte: monthEnd },
                status: 'completed'
            },
            _sum: { total: true },
            _count: { id: true }
        })

        // Obtener entradas de tiempo del mes
        const timeEntries = await db.timeEntry.findMany({
            where: {
                organizationId,
                clockIn: { gte: monthStart, lte: monthEnd }
            },
            select: {
                userId: true,
                clockIn: true,
                clockOut: true,
                status: true
            }
        })

        // Obtener turnos del mes
        const shifts = await db.shift.findMany({
            where: {
                organizationId,
                startedAt: { gte: monthStart, lte: monthEnd }
            },
            select: {
                userId: true,
                totalSales: true,
                difference: true,
                status: true
            }
        })

        // Construir reporte por empleado
        const report = employees.map(emp => {
            const empSales = sales.find(s => s.userId === emp.id)
            const totalSales = empSales?._sum.total ? Number(empSales._sum.total) : 0
            const salesCount = empSales?._count.id || 0

            // Calcular horas trabajadas
            const empTimeEntries = timeEntries.filter(t => t.userId === emp.id)
            let totalMinutes = 0
            empTimeEntries.forEach(entry => {
                if (entry.clockOut) {
                    totalMinutes += differenceInMinutes(entry.clockOut, entry.clockIn)
                }
            })
            const hoursWorked = Math.round(totalMinutes / 60 * 10) / 10

            // Calcular diferencias en caja
            const empShifts = shifts.filter(s => s.userId === emp.id)
            let totalDifference = new Decimal(0)
            let shiftsWithDifference = 0
            empShifts.forEach(shift => {
                if (shift.difference) {
                    const diff = new Decimal(shift.difference.toString())
                    if (!diff.equals(0)) {
                        totalDifference = totalDifference.plus(diff)
                        shiftsWithDifference++
                    }
                }
            })

            // Calcular comisión
            const commissionRate = emp.commissionRate ? Number(emp.commissionRate) : 0
            const commission = totalSales * (commissionRate / 100)

            return {
                id: emp.id,
                name: emp.name,
                email: emp.email,
                role: emp.role,
                totalSales,
                salesCount,
                hoursWorked,
                daysWorked: empTimeEntries.filter(t => t.status === 'completed').length,
                averagePerSale: salesCount > 0 ? totalSales / salesCount : 0,
                salesPerHour: hoursWorked > 0 ? salesCount / hoursWorked : 0,
                cashDifference: totalDifference.toNumber(),
                shiftsWithDifference,
                commissionRate,
                commission
            }
        })

        // Ordenar por ventas (top performers primero)
        report.sort((a, b) => b.totalSales - a.totalSales)

        // Calcular totales
        const totals = {
            totalSales: report.reduce((sum, r) => sum + r.totalSales, 0),
            totalCount: report.reduce((sum, r) => sum + r.salesCount, 0),
            totalHours: report.reduce((sum, r) => sum + r.hoursWorked, 0),
            totalCommission: report.reduce((sum, r) => sum + r.commission, 0)
        }

        return {
            report,
            totals,
            period: {
                start: monthStart.toISOString(),
                end: monthEnd.toISOString()
            }
        }
    } catch (error) {
        console.error("Error fetching employee reports:", error)
        return null
    }
}
