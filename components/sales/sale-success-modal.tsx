"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Printer, CheckCircle2, ArrowRight } from "lucide-react"
import { TicketReceipt } from "./ticket-receipt"
import { useEffect, useState } from "react"
import type { Sale, Organization, SaleItem } from "@prisma/client"

// Helper types since we might not have the full Prisma types in the client
type ExtendedSaleItem = SaleItem & { productName?: string | null; product?: { name: string } }
type ExtendedSale = Sale & { items: ExtendedSaleItem[]; client?: { name: string; taxId?: string } | null }

interface SaleSuccessModalProps {
    isOpen: boolean
    onClose: () => void
    sale: ExtendedSale | null
    organization?: Organization | null // Optional if we want to pass it
}

export function SaleSuccessModal({ isOpen, onClose, sale, organization }: SaleSuccessModalProps) {
    const [showConfetti, setShowConfetti] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true)
            const timer = setTimeout(() => setShowConfetti(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    const handlePrint = () => {
        window.print()
    }

    if (!sale) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center items-center">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <DialogTitle className="text-2xl text-center">¡Venta Exitosa!</DialogTitle>
                    <DialogDescription className="text-center">
                        Ticket: <strong>{sale.ticketNumber || `#${sale.id}`}</strong>
                        <br />
                        Total: <span className="text-green-600 font-bold text-lg">${Number(sale.total).toLocaleString("es-AR")}</span>
                    </DialogDescription>
                </DialogHeader>

                {/* Hidden ticket for printing */}
                {organization && (
                    <div className="hidden">
                        <TicketReceipt sale={sale} organization={organization} />
                    </div>
                )}

                {/* Visible preview - simplified */}
                <div className="bg-muted/40 p-4 rounded-lg border text-sm space-y-2">
                    <div className="flex justify-between font-medium">
                        <span>Items:</span>
                        <span>{sale.items.reduce((acc, i) => acc + i.quantity, 0)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                        <span>Método Pago:</span>
                        <span className="capitalize">{sale.paymentMethod}</span>
                    </div>
                    {sale.client && (
                        <div className="flex justify-between font-medium">
                            <span>Cliente:</span>
                            <span>{sale.client.name}</span>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={handlePrint}
                    >
                        <Printer className="h-4 w-4" />
                        Imprimir Ticket
                    </Button>
                    <Button
                        className="flex-1 gap-2"
                        onClick={onClose}
                    >
                        Nueva Venta
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
