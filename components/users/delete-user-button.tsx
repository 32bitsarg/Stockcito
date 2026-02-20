"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteUser } from "@/actions/auth-actions"
import { useOfflineMutation } from "@/hooks/use-offline-mutation"
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

interface DeleteUserButtonProps {
    userId: number
    userName: string
}

export function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)

    const deleteMutation = useOfflineMutation({
        mutationFn: deleteUser,
        invalidateQueries: [['users']],
        onSuccess: (result: any) => {
            if (result.success) {
                setOpen(false)
                router.refresh()
            } else {
                alert(result.error || "Error al eliminar")
            }
        },
        onError: () => alert("Error de conexión al eliminar")
    })

    const isPending = deleteMutation.isPending

    const handleDelete = () => {
        deleteMutation.mutate(userId)
    }

    return (
        <AlertDialog open={open} onOpenChange={(details) => setOpen(details.open)}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Estás por eliminar al usuario <strong>{userName}</strong>.
                        {" "}Si el usuario tiene ventas registradas, será desactivado en lugar de eliminado.
                        Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isPending}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
