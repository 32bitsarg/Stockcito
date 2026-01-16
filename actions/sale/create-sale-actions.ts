"use server"

import { db } from "@/lib/db"
import { saleSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import Decimal from 'decimal.js'
import { calculateLine } from '@/lib/tax-calculator'
import { getSession } from "@/actions/auth"
import { UsageTracker } from "@/lib/subscription/usage-tracker"
import { saleLogger } from "@/lib/logger"

// Helper: Get current open drawer for user
async function getUserOpenDrawer(userId: number, organizationId: number) {
    return db.cashDrawer.findFirst({
        where: {
            currentUserId: userId,
            organizationId,
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
}

// Helper: Record sale in cash drawer and shift
async function recordSaleInDrawer(
    tx: any,
    drawerId: number,
    shiftId: number,
    userId: number,
    organizationId: number,
    paymentMethod: string,
    amount: number
) {
    const drawer = await tx.cashDrawer.findUnique({ where: { id: drawerId } })
    if (!drawer) return

    const currentAmount = Number(drawer.currentAmount || 0)
    const expectedAmount = Number(drawer.expectedAmount || 0)

    // Solo efectivo suma al monto de la caja
    const isCash = paymentMethod === 'efectivo'
    const newCurrentAmount = isCash ? currentAmount + amount : currentAmount
    const newExpectedAmount = isCash ? expectedAmount + amount : expectedAmount

    // Actualizar caja
    await tx.cashDrawer.update({
        where: { id: drawerId },
        data: {
            currentAmount: newCurrentAmount.toString(),
            expectedAmount: newExpectedAmount.toString(),
            lastActivityAt: new Date()
        }
    })

    // Registrar movimiento de caja
    const movementType = isCash ? 'sale_cash' : 'sale_card'
    await tx.cashMovement.create({
        data: {
            organizationId,
            drawerId,
            userId,
            type: movementType,
            amount: amount.toString(),
            balanceBefore: currentAmount.toString(),
            balanceAfter: newCurrentAmount.toString(),
            description: `Venta ${paymentMethod}`
        }
    })

    // Actualizar turno
    const shift = await tx.shift.findUnique({ where: { id: shiftId } })
    if (shift) {
        const totalSales = Number(shift.totalSales || 0) + amount
        const totalCash = Number(shift.totalCash || 0) + (isCash ? amount : 0)
        const totalCard = Number(shift.totalCard || 0) + (isCash ? 0 : amount)
        const salesCount = (shift.salesCount || 0) + 1

        await tx.shift.update({
            where: { id: shiftId },
            data: {
                totalSales: totalSales.toString(),
                totalCash: totalCash.toString(),
                totalCard: totalCard.toString(),
                salesCount
            }
        })
    }
}

export async function createSale(data: z.infer<typeof saleSchema>) {
    const session = await getSession()
    if (!session?.organizationId) {
        return { error: "No autorizado" }
    }

    const result = saleSchema.safeParse(data);
    if (!result.success) return { error: result.error.flatten().fieldErrors }

    const {
        items,
        clientId,
        total,
        userId,
        discountAmount: saleDiscountAmount,
        discountRate: saleDiscountRate,
        paymentMethod = 'efectivo',
        requireOpenDrawer = true
    } = result.data

    // Verificar si requiere caja abierta
    let drawer: Awaited<ReturnType<typeof getUserOpenDrawer>> = null

    if (requireOpenDrawer) {
        drawer = await getUserOpenDrawer(session.id, session.organizationId)
        if (!drawer) {
            return {
                error: "Debes abrir una caja antes de realizar ventas",
                requiresDrawer: true
            }
        }
    }

    // Check invoice limit only if issuing invoice
    if (result.data.issueInvoice) {
        const tracker = new UsageTracker(session.organizationId)
        const canCreate = await tracker.canCreate("invoices")
        if (!canCreate) {
            return {
                error: "Has alcanzado el límite de facturas de tu plan. Puedes continuar vendiendo sin factura o actualizar a Premium.",
                limitReached: true
            }
        }
    }

    try {
        await db.$transaction(async (tx) => {
            let calculatedSubtotal = new Decimal(0)
            let calculatedTax = new Decimal(0)
            let calculatedTotal = new Decimal(0)
            let calculatedDiscountTotal = new Decimal(0)

            const saleItemsData: any[] = []
            const lineCalculations: Array<{ idx: number; taxableBase: Decimal; taxAmount: Decimal }> = []

            // First pass: calculate per-line without sale-level discount
            for (let i = 0; i < items.length; i++) {
                const item = items[i]
                const product = await tx.product.findFirst({
                    where: {
                        id: item.productId,
                        organizationId: session.organizationId
                    }
                })
                if (!product) throw new Error(`Producto ${item.productId} no encontrado`)

                const calc = calculateLine({
                    unitPrice: product.price,
                    quantity: item.quantity,
                    taxRate: product.taxRate,
                    discountAmount: item.discountAmount,
                    discountRate: item.discountRate
                })

                lineCalculations.push({ idx: i, taxableBase: calc.taxableBase, taxAmount: calc.taxAmount })

                calculatedSubtotal = calculatedSubtotal.plus(calc.taxableBase)
                calculatedTax = calculatedTax.plus(calc.taxAmount)
                calculatedTotal = calculatedTotal.plus(calc.total)
                calculatedDiscountTotal = calculatedDiscountTotal.plus(calc.discountAmount)

                saleItemsData.push({
                    productId: product.id,
                    quantity: item.quantity,
                    unitPrice: product.price, // Precio neto
                    taxRate: product.taxRate ?? 0,
                    taxAmount: calc.taxAmount.toString(),
                    discountAmount: calc.discountAmount.toString(),
                    subtotal: calc.total.toString()
                })

                // Update stock
                await tx.product.update({
                    where: { id: product.id },
                    data: { stock: { decrement: item.quantity } }
                })
            }

            // Apply sale-level discount proportionally if exists
            let saleLevelDiscount = new Decimal(0)
            if (saleDiscountAmount) {
                saleLevelDiscount = new Decimal(saleDiscountAmount)
            } else if (saleDiscountRate) {
                saleLevelDiscount = calculatedSubtotal.times(new Decimal(saleDiscountRate).dividedBy(100))
            }

            if (saleLevelDiscount.greaterThan(0)) {
                // Distribute proportionally across items and adjust tax/total
                const subtotalBefore = calculatedSubtotal
                calculatedSubtotal = new Decimal(0)
                calculatedTax = new Decimal(0)
                calculatedTotal = new Decimal(0)

                for (let i = 0; i < saleItemsData.length; i++) {
                    const item = saleItemsData[i]
                    const origTaxable = new Decimal(lineCalculations[i].taxableBase)
                    const share = origTaxable.dividedBy(subtotalBefore).times(saleLevelDiscount)
                    const newTaxable = origTaxable.minus(share)
                    const newTax = newTaxable.times(new Decimal(item.taxRate).dividedBy(100))
                    const newTotal = newTaxable.plus(newTax)

                    item.discountAmount = (new Decimal(item.discountAmount).plus(share)).toString()
                    item.taxAmount = newTax.toString()
                    item.subtotal = newTotal.toString()

                    calculatedSubtotal = calculatedSubtotal.plus(newTaxable)
                    calculatedTax = calculatedTax.plus(newTax)
                    calculatedTotal = calculatedTotal.plus(newTotal)
                }

                calculatedDiscountTotal = calculatedDiscountTotal.plus(saleLevelDiscount)
            }

            // 1. Create Sale
            const sale = await tx.sale.create({
                data: {
                    clientId,
                    userId: session.id, // Always use session user ID
                    organizationId: session.organizationId,
                    subtotal: calculatedSubtotal.toString(),
                    taxAmount: calculatedTax.toString(),
                    discountAmount: calculatedDiscountTotal.toString(),
                    total: calculatedTotal.toString(),
                    paymentMethod,
                    status: 'completed',
                    items: {
                        create: saleItemsData
                    }
                }
            })

            // 2. Create invoice record if requested (CAE issuance handled separately)
            if (sale && result.data.issueInvoice) {
                await tx.invoice.create({
                    data: {
                        saleId: sale.id,
                        organizationId: session.organizationId,
                        type: result.data.invoiceType || 'B',
                        pointOfSale: result.data.pointOfSale,
                        total: calculatedTotal.toString()
                    }
                })
            }

            // 3. Record sale in cash drawer if open
            if (drawer && drawer.shifts[0] && session.organizationId) {
                await recordSaleInDrawer(
                    tx,
                    drawer.id,
                    drawer.shifts[0].id,
                    session.id,
                    session.organizationId,
                    paymentMethod,
                    calculatedTotal.toNumber()
                )
            }
        })

        revalidatePath("/sales")
        revalidatePath("/inventory")
        revalidatePath("/") // dashboard
        return { success: true }

    } catch (error) {
        saleLogger.error('Error al procesar la venta', error)
        return { error: "Error al procesar la venta." }
    }
}
