"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

interface BarcodeResultModalProps {
    isOpen: boolean
    onClose: () => void
    scannedCode: string
    canCreate: boolean
}

export function BarcodeResultModal({
    isOpen,
    onClose,
    scannedCode,
    canCreate
}: BarcodeResultModalProps) {
    const router = useRouter()

    const handleCreate = () => {
        onClose()
        // Redirigir al formulario de creación con el SKU prellenado
        router.push(`/inventory/products/new?sku=${encodeURIComponent(scannedCode)}`)
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Producto no encontrado</AlertDialogTitle>
                    <AlertDialogDescription>
                        El código de barras <span className="font-mono font-bold">{scannedCode}</span> no está registrado en el inventario.
                        {canCreate
                            ? " ¿Deseas agregar este producto ahora?"
                            : " No tienes permisos para agregar nuevos productos."
                        }
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
                    {canCreate && (
                        <AlertDialogAction onClick={handleCreate}>
                            Crear Producto
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
