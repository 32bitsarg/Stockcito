"use server"
import { employeeLogger } from '@/lib/logger'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { requireOrganization, getSession, logAudit } from '@/actions/auth'
import { getUserPermissions, hasPermission, type SystemRole } from '@/lib/permissions'
import { useOverride } from './override-actions'

// ==========================================
// CASH DRAWER OPERATIONS (SHIFT/MOVEMENTS)
// ==========================================

/**
 * Abrir caja (iniciar turno)
 */
export async function openCashDrawer(
    drawerId: number,
    openingAmount: number
): Promise<{ success: boolean; shiftId?: number; error?: string }> {
    try {
        const { session, organizationId } = await requireOrganization()

        const drawer = await db.cashDrawer.findFirst({
            where: { id: drawerId, organizationId }
        })

        if (!drawer) {
            return { success: false, error: 'Caja no encontrada' }
        }

        if (drawer.status === 'open' && drawer.currentUserId) {
            return { success: false, error: 'La caja ya está abierta por otro usuario' }
        }

        // Verificar si el usuario ya tiene otra caja abierta
        const existingDrawer = await db.cashDrawer.findFirst({
            where: { currentUserId: session.id, status: 'open' }
        })

        if (existingDrawer) {
            return { success: false, error: 'Ya tienes una caja abierta' }
        }

        // Transacción: abrir caja + crear turno + movimiento
        const result = await db.$transaction(async (tx) => {
            // Actualizar caja
            await tx.cashDrawer.update({
                where: { id: drawerId },
                data: {
                    status: 'open',
                    currentUserId: session.id,
                    openingAmount: openingAmount.toString(),
                    currentAmount: openingAmount.toString(),
                    expectedAmount: openingAmount.toString(),
                    openedAt: new Date(),
                    lastActivityAt: new Date()
                }
            })

            // Crear turno
            const shift = await tx.shift.create({
                data: {
                    organizationId,
                    drawerId,
                    userId: session.id,
                    openingAmount: openingAmount.toString(),
                    status: 'active'
                }
            })

            // Crear movimiento de apertura
            await tx.cashMovement.create({
                data: {
                    organizationId,
                    drawerId,
                    userId: session.id,
                    type: 'open',
                    amount: openingAmount.toString(),
                    balanceAfter: openingAmount.toString(),
                    description: 'Apertura de caja'
                }
            })

            return shift
        })

        await logAudit(
            session.id, 
            'open_drawer', 
            'cash_drawer', 
            drawerId,
            `Caja abierta con $${openingAmount}`,
            undefined,
            organizationId
        )

        revalidatePath('/sales')
        return { success: true, shiftId: result.id }
    } catch (error) {
        employeeLogger.error('Open cash drawer error:', error)
        return { success: false, error: 'Error al abrir caja' }
    }
}

/**
 * Cerrar caja (finalizar turno con arqueo)
 */
export async function closeCashDrawer(
    drawerId: number,
    countedAmount: number,
    notes?: string
): Promise<{ success: boolean; difference?: number; error?: string }> {
    try {
        const { session, organizationId } = await requireOrganization()

        const drawer = await db.cashDrawer.findFirst({
            where: { id: drawerId, organizationId },
            include: {
                shifts: {
                    where: { status: 'active' },
                    orderBy: { startedAt: 'desc' },
                    take: 1
                }
            }
        })

        if (!drawer) {
            return { success: false, error: 'Caja no encontrada' }
        }

        if (drawer.status !== 'open') {
            return { success: false, error: 'La caja no está abierta' }
        }

        // Solo el usuario actual o un manager puede cerrar
        if (drawer.currentUserId !== session.id) {
            const permissions = getUserPermissions(session.role as SystemRole, null)
            if (!hasPermission(permissions, 'cashDrawer', 'forceClose')) {
                return { success: false, error: 'Solo puedes cerrar tu propia caja' }
            }
        }

        const expectedAmount = Number(drawer.expectedAmount || 0)
        const difference = countedAmount - expectedAmount

        const activeShift = drawer.shifts[0]

        // Transacción: cerrar caja + turno + movimiento
        await db.$transaction(async (tx) => {
            // Actualizar caja
            await tx.cashDrawer.update({
                where: { id: drawerId },
                data: {
                    status: 'closed',
                    currentUserId: null,
                    currentAmount: countedAmount.toString(),
                    lastActivityAt: new Date()
                }
            })

            // Cerrar turno
            if (activeShift) {
                await tx.shift.update({
                    where: { id: activeShift.id },
                    data: {
                        endedAt: new Date(),
                        closingAmount: countedAmount.toString(),
                        expectedAmount: expectedAmount.toString(),
                        difference: difference.toString(),
                        status: 'closed',
                        notes
                    }
                })
            }

            // Crear movimiento de cierre
            await tx.cashMovement.create({
                data: {
                    organizationId,
                    drawerId,
                    userId: session.id,
                    type: 'close',
                    amount: countedAmount.toString(),
                    expectedAmount: expectedAmount.toString(),
                    actualAmount: countedAmount.toString(),
                    difference: difference.toString(),
                    balanceBefore: expectedAmount.toString(),
                    balanceAfter: '0',
                    description: notes || 'Cierre de caja'
                }
            })
        })

        await logAudit(
            session.id,
            'close_drawer',
            'cash_drawer',
            drawerId,
            `Caja cerrada. Contado: $${countedAmount}, Esperado: $${expectedAmount}, Diferencia: $${difference}`,
            undefined,
            organizationId
        )

        revalidatePath('/sales')
        return { success: true, difference }
    } catch (error) {
        employeeLogger.error('Close cash drawer error:', error)
        return { success: false, error: 'Error al cerrar caja' }
    }
}

/**
 * Registrar movimiento de efectivo (ingreso/retiro)
 */
export async function recordCashMovement(
    drawerId: number,
    type: 'cash_in' | 'cash_out',
    amount: number,
    description: string,
    overrideId?: number
): Promise<{ success: boolean; error?: string }> {
    try {
        const { session, organizationId } = await requireOrganization()

        const drawer = await db.cashDrawer.findFirst({
            where: { id: drawerId, organizationId, status: 'open' }
        })

        if (!drawer) {
            return { success: false, error: 'Caja no encontrada o cerrada' }
        }

        if (drawer.currentUserId !== session.id) {
            return { success: false, error: 'Esta no es tu caja' }
        }

        const permissions = getUserPermissions(session.role as SystemRole, null)

        // Verificar permisos
        if (type === 'cash_out' && !hasPermission(permissions, 'cashDrawer', 'cashOut')) {
            if (!overrideId) {
                return { success: false, error: 'Requiere autorización de gerente' }
            }
            const overrideResult = await useOverride(overrideId)
            if (!overrideResult.success) {
                return { success: false, error: overrideResult.error }
            }
        }

        if (type === 'cash_in' && !hasPermission(permissions, 'cashDrawer', 'cashIn')) {
            return { success: false, error: 'Sin permisos para ingresar efectivo' }
        }

        const currentAmount = Number(drawer.currentAmount || 0)
        const newAmount = type === 'cash_in' 
            ? currentAmount + amount 
            : currentAmount - amount

        if (newAmount < 0) {
            return { success: false, error: 'Monto insuficiente en caja' }
        }

        await db.$transaction(async (tx) => {
            await tx.cashDrawer.update({
                where: { id: drawerId },
                data: {
                    currentAmount: newAmount.toString(),
                    expectedAmount: newAmount.toString(),
                    lastActivityAt: new Date()
                }
            })

            await tx.cashMovement.create({
                data: {
                    organizationId,
                    drawerId,
                    userId: session.id,
                    type,
                    amount: amount.toString(),
                    balanceBefore: currentAmount.toString(),
                    balanceAfter: newAmount.toString(),
                    description
                }
            })
        })

        await logAudit(
            session.id,
            type,
            'cash_drawer',
            drawerId,
            `${type === 'cash_in' ? 'Ingreso' : 'Retiro'}: $${amount} - ${description}`,
            undefined,
            organizationId
        )

        revalidatePath('/sales')
        return { success: true }
    } catch (error) {
        employeeLogger.error('Record cash movement error:', error)
        return { success: false, error: 'Error al registrar movimiento' }
    }
}

/**
 * Obtener estado actual de la caja del usuario
 */
export async function getCurrentDrawerStatus() {
    const session = await getSession()
    if (!session?.organizationId) return null

    const drawer = await db.cashDrawer.findFirst({
        where: {
            currentUserId: session.id,
            status: 'open'
        },
        include: {
            shifts: {
                where: { status: 'active' },
                orderBy: { startedAt: 'desc' },
                take: 1
            }
        }
    })

    if (!drawer) return null

    return {
        id: drawer.id,
        name: drawer.name,
        openingAmount: Number(drawer.openingAmount || 0),
        currentAmount: Number(drawer.currentAmount || 0),
        expectedAmount: Number(drawer.expectedAmount || 0),
        openedAt: drawer.openedAt,
        shiftId: drawer.shifts[0]?.id
    }
}

/**
 * Traspasar caja a otro usuario (cambio de turno sin cerrar caja)
 */
export async function transferCashDrawer(
    drawerId: number,
    toUserId: number,
    countedAmount: number,
    notes?: string
): Promise<{ success: boolean; newShiftId?: number; difference?: number; error?: string }> {
    try {
        const { session, organizationId } = await requireOrganization()

        const drawer = await db.cashDrawer.findFirst({
            where: { id: drawerId, organizationId },
            include: {
                shifts: {
                    where: { status: 'active' },
                    orderBy: { startedAt: 'desc' },
                    take: 1
                }
            }
        })

        if (!drawer) {
            return { success: false, error: 'Caja no encontrada' }
        }

        if (drawer.status !== 'open') {
            return { success: false, error: 'La caja no está abierta' }
        }

        // Solo el usuario actual o un manager puede traspasar
        if (drawer.currentUserId !== session.id) {
            const permissions = getUserPermissions(session.role as SystemRole, null)
            if (!hasPermission(permissions, 'cashDrawer', 'forceClose')) {
                return { success: false, error: 'Solo puedes traspasar tu propia caja' }
            }
        }

        // Verificar que el nuevo usuario exista y esté activo
        const newUser = await db.user.findFirst({
            where: { id: toUserId, organizationId, active: true }
        })

        if (!newUser) {
            return { success: false, error: 'Usuario destino no encontrado o inactivo' }
        }

        // Verificar que el nuevo usuario no tenga otra caja abierta
        const existingDrawer = await db.cashDrawer.findFirst({
            where: { currentUserId: toUserId, status: 'open' }
        })

        if (existingDrawer) {
            return { success: false, error: 'El usuario destino ya tiene una caja abierta' }
        }

        const expectedAmount = Number(drawer.expectedAmount || 0)
        const difference = countedAmount - expectedAmount
        const activeShift = drawer.shifts[0]

        const result = await db.$transaction(async (tx) => {
            // 1. Cerrar turno actual
            if (activeShift) {
                await tx.shift.update({
                    where: { id: activeShift.id },
                    data: {
                        endedAt: new Date(),
                        closingAmount: countedAmount.toString(),
                        expectedAmount: expectedAmount.toString(),
                        difference: difference.toString(),
                        status: 'closed',
                        notes: notes || `Traspaso a ${newUser.name}`
                    }
                })
            }

            // 2. Registrar movimiento de traspaso (salida)
            await tx.cashMovement.create({
                data: {
                    organizationId,
                    drawerId,
                    userId: session.id,
                    type: 'transfer_out',
                    amount: countedAmount.toString(),
                    expectedAmount: expectedAmount.toString(),
                    actualAmount: countedAmount.toString(),
                    difference: difference.toString(),
                    balanceBefore: expectedAmount.toString(),
                    balanceAfter: countedAmount.toString(),
                    description: `Traspaso de caja a ${newUser.name}`
                }
            })

            // 3. Actualizar caja con nuevo usuario
            await tx.cashDrawer.update({
                where: { id: drawerId },
                data: {
                    currentUserId: toUserId,
                    openingAmount: countedAmount.toString(),
                    currentAmount: countedAmount.toString(),
                    expectedAmount: countedAmount.toString(),
                    openedAt: new Date(),
                    lastActivityAt: new Date()
                }
            })

            // 4. Crear nuevo turno para el usuario destino
            const newShift = await tx.shift.create({
                data: {
                    organizationId,
                    drawerId,
                    userId: toUserId,
                    openingAmount: countedAmount.toString(),
                    status: 'active'
                }
            })

            // 5. Registrar movimiento de traspaso (entrada)
            await tx.cashMovement.create({
                data: {
                    organizationId,
                    drawerId,
                    userId: toUserId,
                    type: 'transfer_in',
                    amount: countedAmount.toString(),
                    balanceAfter: countedAmount.toString(),
                    description: `Recepción de caja de ${session.name}`
                }
            })

            return newShift
        })

        await logAudit(
            session.id,
            'transfer_drawer',
            'cash_drawer',
            drawerId,
            `Caja traspasada a ${newUser.name}. Monto: $${countedAmount}, Diferencia: $${difference}`,
            undefined,
            organizationId
        )

        revalidatePath('/sales')
        return { success: true, newShiftId: result.id, difference }
    } catch (error) {
        employeeLogger.error('Transfer cash drawer error:', error)
        return { success: false, error: 'Error al traspasar caja' }
    }
}
