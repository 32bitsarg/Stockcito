"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createPartialRefund } from "@/actions/sale-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RotateCcw, Loader2 } from "lucide-react"

interface SaleItem {
    id: number
    productId: number
    product: { id: number; name: string; sku: string | null }
    quantity: number
    unitPrice: any
    subtotal: any
}

interface Sale {
    id: number
    items: SaleItem[]
    creditNotes: { items: string | null }[]
}

interface RefundSaleButtonProps {
    sale: Sale
}

export function RefundSaleButton({ sale }: RefundSaleButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [selectedItems, setSelectedItems] = useState<Map<number, number>>(new Map())

    // Calculate already refunded quantities
    const refundedQuantities = new Map<number, number>()
    for (const cn of sale.creditNotes) {
        if (cn.items) {
            try {
                const items = JSON.parse(cn.items) as any[]
                for (const item of items) {
                    refundedQuantities.set(
                        item.productId,
                        (refundedQuantities.get(item.productId) || 0) + item.quantity
                    )
                }
            } catch (e) {}
        }
    }

    const toggleItem = (productId: number, maxQuantity: number) => {
        const newSelected = new Map(selectedItems)
        if (newSelected.has(productId)) {
            newSelected.delete(productId)
        } else {
            newSelected.set(productId, maxQuantity)
        }
        setSelectedItems(newSelected)
    }

    const updateQuantity = (productId: number, quantity: number, maxQuantity: number) => {
        const newSelected = new Map(selectedItems)
        if (quantity <= 0) {
            newSelected.delete(productId)
        } else {
            newSelected.set(productId, Math.min(quantity, maxQuantity))
        }
        setSelectedItems(newSelected)
    }

    const handleRefund = () => {
        if (!reason.trim()) {
            setError("Debe proporcionar un motivo de devolución")
            return
        }

        if (selectedItems.size === 0) {
            setError("Debe seleccionar al menos un producto a devolver")
            return
        }

        const items = Array.from(selectedItems.entries()).map(([productId, quantity]) => ({
            productId,
            quantity
        }))

        setError(null)
        startTransition(async () => {
            const result = await createPartialRefund(sale.id, reason, items)
            if (result.error) {
                setError(typeof result.error === 'string' ? result.error : 'Error al procesar devolución')
            } else {
                setOpen(false)
                setReason("")
                setSelectedItems(new Map())
                router.refresh()
            }
        })
    }

    const handleClose = () => {
        setOpen(false)
        setReason("")
        setSelectedItems(new Map())
        setError(null)
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); else setOpen(true) }}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Devolución
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Devolución de Productos</DialogTitle>
                    <DialogDescription>
                        Seleccione los productos a devolver y las cantidades. Se restaurará el stock y se generará una nota de crédito.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-8"></TableHead>
                                <TableHead>Producto</TableHead>
                                <TableHead className="text-right">Disponible</TableHead>
                                <TableHead className="text-right w-24">Devolver</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sale.items.map((item) => {
                                const alreadyRefunded = refundedQuantities.get(item.productId) || 0
                                const availableQuantity = item.quantity - alreadyRefunded
                                const isSelected = selectedItems.has(item.productId)
                                const selectedQuantity = selectedItems.get(item.productId) || 0

                                if (availableQuantity <= 0) {
                                    return (
                                        <TableRow key={item.id} className="opacity-50">
                                            <TableCell></TableCell>
                                            <TableCell>
                                                <div>
                                                    <span className="font-medium">{item.product.name}</span>
                                                    <span className="text-xs text-muted-foreground ml-2">(ya devuelto)</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">0</TableCell>
                                            <TableCell className="text-right">-</TableCell>
                                        </TableRow>
                                    )
                                }

                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleItem(item.productId, availableQuantity)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{item.product.name}</span>
                                        </TableCell>
                                        <TableCell className="text-right">{availableQuantity}</TableCell>
                                        <TableCell className="text-right">
                                            {isSelected && (
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={availableQuantity}
                                                    value={selectedQuantity}
                                                    onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0, availableQuantity)}
                                                    className="w-20 text-right"
                                                />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>

                    <div className="space-y-2">
                        <Label htmlFor="refund-reason">Motivo de devolución *</Label>
                        <Textarea 
                            id="refund-reason"
                            placeholder="Ingrese el motivo de la devolución..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={2}
                        />
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button onClick={handleRefund} disabled={isPending || selectedItems.size === 0}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            <>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Procesar Devolución
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
