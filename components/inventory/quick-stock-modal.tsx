"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, Minus } from "lucide-react"
import { quickStockAdjust } from "@/actions/barcode-actions"
import { toast } from "sonner"

interface QuickStockModalProps {
    isOpen: boolean
    onClose: () => void
    product: {
        id: number
        name: string
        stock: number
    }
    onSuccess: (newStock: number) => void
}

export function QuickStockModal({
    isOpen,
    onClose,
    product,
    onSuccess
}: QuickStockModalProps) {
    const [adjustment, setAdjustment] = useState<number>(0)
    const [reason, setReason] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = async () => {
        if (adjustment === 0) {
            onClose()
            return
        }

        setIsLoading(true)
        try {
            const result = await quickStockAdjust(product.id, adjustment, reason)

            if (result.success && result.newStock !== undefined) {
                toast.success("Stock actualizado correctamente")
                onSuccess(result.newStock)
                onClose()
                setAdjustment(0)
                setReason("")
            } else {
                toast.error(result.error || "Error al actualizar stock")
            }
        } catch {
            toast.error("Error al actualizar stock")
        } finally {
            setIsLoading(false)
        }
    }

    const currentStock = product.stock
    const finalStock = currentStock + adjustment

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ajuste Rápido de Stock</DialogTitle>
                    <DialogDescription>
                        {product.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col items-center p-3 border rounded-lg bg-muted/50 w-full">
                            <span className="text-xs text-muted-foreground uppercase">Actual</span>
                            <span className="text-2xl font-bold">{currentStock}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-muted-foreground">→</span>
                        </div>
                        <div className="flex flex-col items-center p-3 border rounded-lg bg-primary/10 w-full animate-in fade-in">
                            <span className="text-xs text-primary uppercase">Nuevo</span>
                            <span className="text-2xl font-bold text-primary">{finalStock}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Ajuste</Label>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setAdjustment(prev => prev - 1)}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                                type="number"
                                value={adjustment}
                                onChange={(e) => setAdjustment(Number(e.target.value))}
                                className="text-center text-lg font-bold"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setAdjustment(prev => prev + 1)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Motivo (opcional)</Label>
                        <Textarea
                            placeholder="Ej: Conteo rápido, merma, ingreso..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
