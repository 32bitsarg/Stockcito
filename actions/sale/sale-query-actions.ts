"use server"

import { db } from "@/lib/db"

// Get sale by ID with all details
export async function getSaleById(id: number) {
    return db.sale.findUnique({
        where: { id },
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
}

// Get credit notes for a sale
export async function getCreditNotes(saleId: number) {
    return db.creditNote.findMany({
        where: { saleId },
        orderBy: { issuedAt: 'desc' }
    })
}
