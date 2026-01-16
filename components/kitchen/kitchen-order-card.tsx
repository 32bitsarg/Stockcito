"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, User, ChefHat, Check, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { updateKitchenOrderStatus, type KitchenOrder, type KitchenOrderStatus } from "@/actions/kitchen-actions"
import { toast } from "sonner"

interface KitchenOrderCardProps {
    order: KitchenOrder
}

export function KitchenOrderCard({ order }: KitchenOrderCardProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleStatusChange = async (newStatus: KitchenOrderStatus) => {
        setIsLoading(true)
        try {
            const result = await updateKitchenOrderStatus(order.id, newStatus)
            if (result.success) {
                router.refresh()
                // Play sound on status change
                if (newStatus === 'ready') {
                    playNotificationSound()
                }
            } else {
                toast.error(result.error || "Error al actualizar")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const playNotificationSound = () => {
        try {
            const audio = new Audio('/sounds/notification.mp3')
            audio.play().catch(() => {
                // Ignore autoplay errors
            })
        } catch {
            // Ignore audio errors
        }
    }

    const getStatusColor = () => {
        switch (order.status) {
            case 'pending':
                return 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
            case 'preparing':
                return 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            case 'ready':
                return 'border-green-400 bg-green-50 dark:bg-green-900/20 animate-pulse'
            default:
                return ''
        }
    }

    const getTimeColor = () => {
        if (order.elapsedMinutes > 15) return 'text-red-600'
        if (order.elapsedMinutes > 10) return 'text-yellow-600'
        return 'text-muted-foreground'
    }

    const getNextAction = (): { label: string; status: KitchenOrderStatus; icon: React.ReactNode } | null => {
        switch (order.status) {
            case 'pending':
                return { label: 'Iniciar', status: 'preparing', icon: <ChefHat className="h-4 w-4" /> }
            case 'preparing':
                return { label: 'Listo', status: 'ready', icon: <Check className="h-4 w-4" /> }
            case 'ready':
                return { label: 'Entregado', status: 'delivered', icon: <Check className="h-4 w-4" /> }
            default:
                return null
        }
    }

    const nextAction = getNextAction()

    return (
        <Card className={cn("transition-all", getStatusColor(), isLoading && "opacity-50")}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold font-mono">
                            {order.orderNumber}
                        </span>
                        {order.tableName && (
                            <Badge variant="outline">{order.tableName}</Badge>
                        )}
                    </div>
                    <div className={cn("flex items-center gap-1 text-sm font-medium", getTimeColor())}>
                        <Clock className="h-4 w-4" />
                        {order.elapsedMinutes} min
                    </div>
                </div>
                {order.clientName && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        {order.clientName}
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Items List */}
                <div className="space-y-1">
                    {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                                    {item.quantity}
                                </span>
                                <span className="font-medium">{item.productName}</span>
                            </div>
                            {item.notes && (
                                <span className="text-xs text-muted-foreground italic">
                                    {item.notes}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Action Button */}
                {nextAction && (
                    <Button
                        onClick={() => handleStatusChange(nextAction.status)}
                        disabled={isLoading}
                        className="w-full"
                        size="lg"
                        variant={order.status === 'preparing' ? 'default' : 'outline'}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                {nextAction.icon}
                                <span className="ml-2">{nextAction.label}</span>
                            </>
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
