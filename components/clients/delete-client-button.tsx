"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteClient } from "@/actions/client-actions"
import { Button } from "@/components/ui/button"
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
import { Trash2, Loader2 } from "lucide-react"

interface DeleteClientButtonProps {
    clientId: number
    clientName: string
}

export function DeleteClientButton({ clientId, clientName }: DeleteClientButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteClient(clientId)
            if (!result.error) {
                setOpen(false)
                router.refresh()
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={(details) => setOpen(details.open)}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Eliminar" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción eliminará permanentemente a <strong>{clientName}</strong> y no se puede deshacer.
                        Si el cliente tiene ventas asociadas, no podrá ser eliminado.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Eliminando...
                            </>
                        ) : (
                            "Eliminar"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
