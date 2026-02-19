"use client"

import { useRouter } from "next/navigation"
import { toggleDiscountActive } from "@/actions/discount-actions"
import { useOfflineMutation } from "@/hooks/use-offline-mutation"
import { Button } from "@/components/ui/button"
import { Power, Loader2 } from "lucide-react"

interface ToggleDiscountButtonProps {
    discountId: number
    isActive: boolean
}

export function ToggleDiscountButton({ discountId, isActive }: ToggleDiscountButtonProps) {
    const router = useRouter()

    const toggleMutation = useOfflineMutation({
        mutationFn: toggleDiscountActive,
        invalidateQueries: [['discounts']],
        onSuccess: () => {
            router.refresh()
        }
    })

    const isPending = toggleMutation.isPending

    const handleToggle = () => {
        toggleMutation.mutate(discountId)
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            title={isActive ? "Desactivar" : "Activar"}
            onClick={handleToggle}
            disabled={isPending}
            className={isActive ? "text-green-600 hover:text-green-700" : "text-muted-foreground"}
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Power className="h-4 w-4" />
            )}
        </Button>
    )
}
