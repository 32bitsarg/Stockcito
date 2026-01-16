"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

import Decimal from 'decimal.js'
import { getSession, logAudit } from "@/actions/auth"
import { getUserPermissions, hasPermission, needsOverride, type SystemRole } from "@/lib/permissions"
import { saleLogger } from "@/lib/logger"

// Helper: Record refund/cancel in cash drawer
async function recordRefundInDrawer(
    tx: any,
    userId: number,
    organizationId: number,
    paymentMethod: string,
    amount: number,
    description: string
) {
    // Buscar caja abierta del usuario
    const drawer = await tx.cashDrawer.findFirst({
        where: {
            currentUserId: userId,
            organizationId,
            status: 'open'
        },
        include: {
            shifts: {
                where: { status: 'active' },
                orderBy: [{ startedAt: 'desc' }],
                take: 1
            }
        }
    })

    if (!drawer) return // Si no hay caja abierta, no registrar

    const isCash = paymentMethod === 'efectivo'
    const currentAmount = Number(drawer.currentAmount || 0)
    const expectedAmount = Number(drawer.expectedAmount || 0)
    
    // Solo efectivo descuenta del monto de la caja
    const newCurrentAmount = isCash ? Math.max(0, currentAmount - amount) : currentAmount
    const newExpectedAmount = isCash ? Math.max(0, expectedAmount - amount) : expectedAmount

    await tx.cashDrawer.update({
        where: { id: drawer.id },
        data: {
            currentAmount: newCurrentAmount.toString(),
            expectedAmount: newExpectedAmount.toString(),
            lastActivityAt: new Date()
        }
    })

    await tx.cashMovement.create({
        data: {
            organizationId,
            drawerId: drawer.id,
            userId,
            type: 'refund',
            amount: amount.toString(),
            balanceBefore: currentAmount.toString(),
            balanceAfter: newCurrentAmount.toString(),
            description
        }
    })

    // Actualizar turno
    if (drawer.shifts[0]) {
        const shift = drawer.shifts[0]
        const totalRefunds = Number(shift.totalRefunds || 0) + amount
        const refundCount = (shift.refundCount || 0) + 1

        await tx.shift.update({
            where: { id: shift.id },
            data: {
                totalRefunds: totalRefunds.toString(),
                refundCount
            }
        })
    }
}

// Cancel a sale completely (requires override for non-manager roles)
export async function cancelSale(
    id: number, 
    reason: string,
    overrideId?: number
) {
    const session = await getSession()
    if (!session?.organizationId) {
        return { error: "No autorizado" }
    }

    if (!reason || reason.trim() === '') {
        return { error: "Debe proporcionar un motivo de cancelación" }
    }

    // Verificar permisos
    const permissions = getUserPermissions(session.role as SystemRole, null)
    const canCancel = hasPermission(permissions, 'sales', 'cancelSale')
    
    if (!canCancel) {
        // Verificar si necesita override
        if (needsOverride('void_sale', session.role as SystemRole, permissions)) {
            if (!overrideId) {
                return { 
                    error: "Esta acción requiere autorización de un gerente",
                    requiresOverride: true,
                    action: 'void_sale' as const
                }
            }
            // Verificar y marcar override como usado
            const override = await db.managerOverride.findFirst({
                where: {
                    id: overrideId,
                    requestedById: session.id,
                    status: 'approved'
                }
            })
            if (!override) {
                return { error: "Autorización inválida o expirada" }
            }
            if (override.expiresAt && new Date() > override.expiresAt) {
                await db.managerOverride.update({
                    where: { id: overrideId },
                    data: { status: 'expired' }
                })
                return { error: "La autorización ha expirado" }
            }
        } else {
            return { error: "Sin permisos para anular ventas" }
        }
    }

    try {
        const sale = await db.sale.findUnique({
            where: { id },
            include: { items: true, creditNotes: true }
        })

        if (!sale) {
            return { error: "Venta no encontrada" }
        }

        if (sale.status === 'cancelled') {
            return { error: "La venta ya está cancelada" }
        }

        if (sale.status === 'refunded') {
            return { error: "La venta ya fue devuelta completamente" }
        }

        await db.$transaction(async (tx) => {
            // 1. Restore stock for all items
            for (const item of sale.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } }
                })
            }

            // 2. Update sale status
            await tx.sale.update({
                where: { id },
                data: {
                    status: 'cancelled',
                    cancelReason: reason,
                    refundedAt: new Date()
                }
            })

            // 3. Create credit note for full amount
            await tx.creditNote.create({
                data: {
                    saleId: id,
                    type: 'full',
                    reason,
                    amount: sale.total,
                    items: JSON.stringify(sale.items.map(i => ({
                        productId: i.productId,
                        quantity: i.quantity,
                        unitPrice: i.unitPrice.toString(),
                        subtotal: i.subtotal.toString()
                    })))
                }
            })

            // 4. Record refund in cash drawer
            if (session.organizationId) {
                await recordRefundInDrawer(
                    tx,
                    session.id,
                    session.organizationId,
                    sale.paymentMethod || 'efectivo',
                    Number(sale.total),
                    `Anulación venta #${id}: ${reason}`
                )
            }

            // 5. Mark override as used
            if (overrideId) {
                await tx.managerOverride.update({
                    where: { id: overrideId },
                    data: { status: 'used', usedAt: new Date() }
                })
            }
        })

        await logAudit(
            session.id,
            'cancel_sale',
            'sale',
            id,
            `Venta anulada: ${reason}${overrideId ? ' (con override)' : ''}`,
            undefined,
            session.organizationId
        )

        revalidatePath("/sales")
        revalidatePath("/sales/history")
        revalidatePath("/inventory")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        saleLogger.error('Error al cancelar la venta', error, { saleId: id })
        return { error: "Error al cancelar la venta" }
    }
}

// Partial refund - create credit note for specific items
export async function createPartialRefund(
    saleId: number,
    reason: string,
    items: { productId: number; quantity: number }[],
    overrideId?: number
) {
    const session = await getSession()
    if (!session?.organizationId) {
        return { error: "No autorizado" }
    }

    if (!reason || reason.trim() === '') {
        return { error: "Debe proporcionar un motivo de devolución" }
    }

    if (!items || items.length === 0) {
        return { error: "Debe seleccionar al menos un producto a devolver" }
    }

    // Verificar permisos
    const permissions = getUserPermissions(session.role as SystemRole, null)
    const canRefund = hasPermission(permissions, 'sales', 'refundSale')
    
    if (!canRefund) {
        if (needsOverride('refund', session.role as SystemRole, permissions)) {
            if (!overrideId) {
                return { 
                    error: "Esta acción requiere autorización de un gerente",
                    requiresOverride: true,
                    action: 'refund' as const
                }
            }
            const override = await db.managerOverride.findFirst({
                where: {
                    id: overrideId,
                    requestedById: session.id,
                    status: 'approved'
                }
            })
            if (!override || (override.expiresAt && new Date() > override.expiresAt)) {
                return { error: "Autorización inválida o expirada" }
            }
        } else {
            return { error: "Sin permisos para procesar devoluciones" }
        }
    }

    try {
        const sale = await db.sale.findUnique({
            where: { id: saleId },
            include: { items: true, creditNotes: true }
        })

        if (!sale) {
            return { error: "Venta no encontrada" }
        }

        if (sale.status === 'cancelled' || sale.status === 'refunded') {
            return { error: "No se puede hacer devolución de una venta cancelada o ya devuelta completamente" }
        }

        // Validate items
        let refundAmount = new Decimal(0)
        const refundItems: any[] = []

        for (const refundItem of items) {
            const saleItem = sale.items.find(i => i.productId === refundItem.productId)
            if (!saleItem) {
                return { error: `Producto ${refundItem.productId} no encontrado en la venta` }
            }

            // Calculate already refunded quantity for this product
            const existingRefunds = sale.creditNotes.reduce((acc, cn) => {
                if (cn.items) {
                    try {
                        const cnItems = JSON.parse(cn.items) as any[]
                        const found = cnItems.find((i: any) => i.productId === refundItem.productId)
                        if (found) return acc + found.quantity
                    } catch (e) {}
                }
                return acc
            }, 0)

            const availableQuantity = saleItem.quantity - existingRefunds
            if (refundItem.quantity > availableQuantity) {
                return { error: `Cantidad a devolver excede la cantidad disponible (${availableQuantity})` }
            }

            const unitRefund = new Decimal(saleItem.subtotal.toString()).dividedBy(saleItem.quantity)
            const itemRefund = unitRefund.times(refundItem.quantity)
            refundAmount = refundAmount.plus(itemRefund)

            refundItems.push({
                productId: refundItem.productId,
                quantity: refundItem.quantity,
                unitPrice: saleItem.unitPrice.toString(),
                subtotal: itemRefund.toString()
            })
        }

        await db.$transaction(async (tx) => {
            // 1. Restore stock
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } }
                })
            }

            // 2. Create credit note
            await tx.creditNote.create({
                data: {
                    saleId,
                    type: 'partial',
                    reason,
                    amount: refundAmount.toString(),
                    items: JSON.stringify(refundItems)
                }
            })

            // 3. Check if all items are now refunded
            const totalRefundedByProduct = new Map<number, number>()
            for (const cn of sale.creditNotes) {
                if (cn.items) {
                    try {
                        const cnItems = JSON.parse(cn.items) as any[]
                        for (const i of cnItems) {
                            totalRefundedByProduct.set(
                                i.productId,
                                (totalRefundedByProduct.get(i.productId) || 0) + i.quantity
                            )
                        }
                    } catch (e) {}
                }
            }
            // Add current refund
            for (const item of items) {
                totalRefundedByProduct.set(
                    item.productId,
                    (totalRefundedByProduct.get(item.productId) || 0) + item.quantity
                )
            }

            // Check if fully refunded
            const allRefunded = sale.items.every(saleItem => {
                const refunded = totalRefundedByProduct.get(saleItem.productId) || 0
                return refunded >= saleItem.quantity
            })

            if (allRefunded) {
                await tx.sale.update({
                    where: { id: saleId },
                    data: { status: 'refunded', refundedAt: new Date() }
                })
            }

            // 4. Record refund in cash drawer
            if (session.organizationId) {
                await recordRefundInDrawer(
                    tx,
                    session.id,
                    session.organizationId,
                    sale.paymentMethod || 'efectivo',
                    refundAmount.toNumber(),
                    `Devolución parcial venta #${saleId}: ${reason}`
                )
            }

            // 5. Mark override as used
            if (overrideId) {
                await tx.managerOverride.update({
                    where: { id: overrideId },
                    data: { status: 'used', usedAt: new Date() }
                })
            }
        })

        await logAudit(
            session.id,
            'partial_refund',
            'sale',
            saleId,
            `Devolución parcial: ${reason}${overrideId ? ' (con override)' : ''}`,
            undefined,
            session.organizationId
        )

        revalidatePath("/sales")
        revalidatePath("/sales/history")
        revalidatePath("/inventory")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        saleLogger.error('Error al procesar la devolución', error, { saleId: saleId })
        return { error: "Error al procesar la devolución" }
    }
}
