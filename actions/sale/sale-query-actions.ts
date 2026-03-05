"use server"

import { db } from "@/lib/db"
import { getSession } from "@/actions/auth"

// Get sale by ID with all details
export async function getSaleById(id: number) {
    const session = await getSession()
    if (!session?.organizationId) {
        return null
    }

    const sale = await db.sale.findFirst({
        where: {
            id,
            organizationId: session.organizationId  // ← Multi-tenant filter
        },
        include: {
            client: true,
            user: { select: { id: true, name: true, email: true } },
            items: {
                include: {
                    product: { select: { id: true, name: true, sku: true } }
                }
            },
            invoice: true,
            creditNotes: true
        }
    })

    if (!sale) return null

    // Serializar Decimals → numbers para compatibilidad con Client Components
    return {
        ...sale,
        subtotal: Number(sale.subtotal),
        taxAmount: Number(sale.taxAmount),
        discountAmount: Number(sale.discountAmount),
        total: Number(sale.total),
        items: sale.items.map((item) => ({
            ...item,
            unitPrice: Number(item.unitPrice),
            taxRate: Number(item.taxRate),
            taxAmount: Number(item.taxAmount),
            discountAmount: Number(item.discountAmount),
            subtotal: Number(item.subtotal),
        })),
        creditNotes: sale.creditNotes.map((cn) => ({
            ...cn,
            amount: Number(cn.amount),
        }))
    }
}

// Get credit notes for a sale
export async function getCreditNotes(saleId: number) {
    const session = await getSession()
    if (!session?.organizationId) {
        return []
    }

    // Verificar que la venta pertenece a la organización antes de devolver notas de crédito
    const sale = await db.sale.findFirst({
        where: {
            id: saleId,
            organizationId: session.organizationId
        },
        select: { id: true }
    })

    if (!sale) return []

    return db.creditNote.findMany({
        where: { saleId },
        orderBy: { issuedAt: 'desc' }
    })
}
