"use client"

import { useRouter } from "next/navigation"
import { toggleUserActive } from "@/actions/auth-actions"
import { useOfflineMutation } from "@/hooks/use-offline-mutation"
import { Button } from "@/components/ui/button"
import { Power, Loader2 } from "lucide-react"

interface ToggleUserButtonProps {
    userId: number
    isActive: boolean
}

export function ToggleUserButton({ userId, isActive }: ToggleUserButtonProps) {
    const router = useRouter()

    const toggleMutation = useOfflineMutation({
        mutationFn: toggleUserActive,
        invalidateQueries: [['users']],
        onSuccess: (result: any) => {
            if (result.success) {
                router.refresh()
            } else {
                alert(result.error || "Error al cambiar estado")
            }
        },
        onError: () => alert("Error de conexión, no se pudo cambiar el estado")
    })

    const isPending = toggleMutation.isPending

    const handleToggle = () => {
        toggleMutation.mutate(userId)
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            disabled={isPending}
            title={isActive ? "Desactivar usuario" : "Activar usuario"}
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Power className={`h-4 w-4 ${isActive ? "text-green-600" : "text-gray-400"}`} />
            )}
        </Button>
    )
}
