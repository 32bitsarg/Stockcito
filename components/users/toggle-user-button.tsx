"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toggleUserActive } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Power, Loader2 } from "lucide-react"

interface ToggleUserButtonProps {
    userId: number
    isActive: boolean
}

export function ToggleUserButton({ userId, isActive }: ToggleUserButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleToggle = () => {
        startTransition(async () => {
            const result = await toggleUserActive(userId)
            if (result.success) {
                router.refresh()
            } else {
                alert(result.error || "Error al cambiar estado")
            }
        })
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
