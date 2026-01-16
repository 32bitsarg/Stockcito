"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { cancelSale } from "@/actions/sale-actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Ban, Loader2 } from "lucide-react"

interface CancelSaleButtonProps {
    saleId: number
}

export function CancelSaleButton({ saleId }: CancelSaleButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState("")
    const [error, setError] = useState<string | null>(null)

    const handleCancel = () => {
        if (!reason.trim()) {
            setError("Debe proporcionar un motivo de cancelación")
            return
        }

        setError(null)
        startTransition(async () => {
            const result = await cancelSale(saleId, reason)
            if (result.error) {
                setError(typeof result.error === 'string' ? result.error : 'Error al cancelar')
            } else {
                setOpen(false)
                setReason("")
                router.refresh()
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={(details) => setOpen(details.open)}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">
                    <Ban className="mr-2 h-4 w-4" />
                    Anular Venta
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Anular esta venta?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción anulará completamente la venta #{saleId}, restaurará el stock de todos los productos y generará una nota de crédito.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="space-y-2">
                    <Label htmlFor="reason">Motivo de anulación *</Label>
                    <Textarea 
                        id="reason"
                        placeholder="Ingrese el motivo de la anulación..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending} onClick={() => { setReason(""); setError(null) }}>
                        Cancelar
                    </AlertDialogCancel>
                    <Button
                        onClick={handleCancel}
                        disabled={isPending}
                        variant="destructive"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Anulando...
                            </>
                        ) : (
                            "Anular Venta"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
