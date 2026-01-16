"use server"

import { db } from '@/lib/db'
import { requireOrganization } from '@/actions/auth'

// ==========================================
// SHIFT REPORTS
// ==========================================

/**
 * Obtener reporte de turno
 */
export async function getShiftReport(shiftId: number) {
    const { organizationId } = await requireOrganization()

    const shift = await db.shift.findFirst({
        where: { id: shiftId, organizationId },
        include: {
            drawer: { select: { name: true } }
        }
    })

    if (!shift) {
        throw new Error('Turno no encontrado')
    }

    // Obtener movimientos del turno
    const movements = await db.cashMovement.findMany({
        where: {
            drawerId: shift.drawerId,
            createdAt: {
                gte: shift.startedAt,
                lte: shift.endedAt || new Date()
            }
        },
        orderBy: { createdAt: 'asc' }
    })

    return {
        shift,
        movements,
        summary: {
            totalSales: Number(shift.totalSales),
            totalCash: Number(shift.totalCash),
            totalCard: Number(shift.totalCard),
            totalRefunds: Number(shift.totalRefunds),
            salesCount: shift.salesCount,
            openingAmount: Number(shift.openingAmount),
            closingAmount: shift.closingAmount ? Number(shift.closingAmount) : null,
            expectedAmount: shift.expectedAmount ? Number(shift.expectedAmount) : null,
            difference: shift.difference ? Number(shift.difference) : null
        }
    }
}

/**
 * Obtener historial de turnos
 */
export async function getShiftHistory(
    drawerId?: number,
    userId?: number,
    limit = 20
) {
    const { organizationId } = await requireOrganization()

    return db.shift.findMany({
        where: {
            organizationId,
            ...(drawerId && { drawerId }),
            ...(userId && { userId })
        },
        include: {
            drawer: { select: { name: true } }
        },
        orderBy: { startedAt: 'desc' },
        take: limit
    })
}
