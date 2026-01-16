"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Clock, Utensils, Sparkles, MoreVertical, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
    occupyTable,
    releaseTable,
    markTableClean,
    type TableData,
    type TableStatus
} from "@/actions/table-actions"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface TableCardProps {
    table: TableData
    onEdit?: (table: TableData) => void
    onDelete?: (table: TableData) => void
    isAdmin?: boolean
}

export function TableCard({ table, onEdit, onDelete, isAdmin = false }: TableCardProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleStatusChange = async (action: 'occupy' | 'release' | 'clean') => {
        setIsLoading(true)
        try {
            let result
            switch (action) {
                case 'occupy':
                    result = await occupyTable(table.id)
                    break
                case 'release':
                    result = await releaseTable(table.id, true)
                    break
                case 'clean':
                    result = await markTableClean(table.id)
                    break
            }

            if (result.success) {
                toast.success(getSuccessMessage(action))
                router.refresh()
            } else {
                toast.error(result.error || "Error al actualizar mesa")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const getSuccessMessage = (action: string) => {
        switch (action) {
            case 'occupy': return 'Mesa ocupada'
            case 'release': return 'Mesa liberada'
            case 'clean': return 'Mesa marcada como lista'
            default: return 'Actualizado'
        }
    }

    const getStatusConfig = (status: TableStatus) => {
        switch (status) {
            case 'available':
                return {
                    color: 'border-green-400 bg-green-50 dark:bg-green-900/20',
                    badge: 'bg-green-100 text-green-700',
                    label: 'Libre',
                    icon: <Sparkles className="h-4 w-4" />
                }
            case 'occupied':
                return {
                    color: 'border-red-400 bg-red-50 dark:bg-red-900/20',
                    badge: 'bg-red-100 text-red-700',
                    label: 'Ocupada',
                    icon: <Utensils className="h-4 w-4" />
                }
            case 'reserved':
                return {
                    color: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
                    badge: 'bg-yellow-100 text-yellow-700',
                    label: 'Reservada',
                    icon: <Clock className="h-4 w-4" />
                }
            case 'cleaning':
                return {
                    color: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20',
                    badge: 'bg-blue-100 text-blue-700',
                    label: 'Limpieza',
                    icon: <Sparkles className="h-4 w-4" />
                }
        }
    }

    const statusConfig = getStatusConfig(table.status)

    const getOccupiedTime = () => {
        if (!table.occupiedAt) return null
        return formatDistanceToNow(new Date(table.occupiedAt), { locale: es, addSuffix: false })
    }

    return (
        <Card
            className={cn(
                "relative transition-all hover:shadow-lg cursor-pointer",
                statusConfig.color,
                isLoading && "opacity-50 pointer-events-none"
            )}
        >
            {/* Actions Menu */}
            <div className="absolute top-2 right-2 z-10">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <MoreVertical className="h-4 w-4" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table.status === 'available' && (
                            <DropdownMenuItem onClick={() => handleStatusChange('occupy')}>
                                <Utensils className="mr-2 h-4 w-4" />
                                Ocupar mesa
                            </DropdownMenuItem>
                        )}
                        {table.status === 'occupied' && (
                            <DropdownMenuItem onClick={() => handleStatusChange('release')}>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Liberar mesa
                            </DropdownMenuItem>
                        )}
                        {table.status === 'cleaning' && (
                            <DropdownMenuItem onClick={() => handleStatusChange('clean')}>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Marcar lista
                            </DropdownMenuItem>
                        )}
                        {table.status === 'reserved' && (
                            <DropdownMenuItem onClick={() => handleStatusChange('occupy')}>
                                <Utensils className="mr-2 h-4 w-4" />
                                Cliente llegó
                            </DropdownMenuItem>
                        )}
                        {isAdmin && (
                            <>
                                <DropdownMenuSeparator />
                                {onEdit && (
                                    <DropdownMenuItem onClick={() => onEdit(table)}>
                                        Editar
                                    </DropdownMenuItem>
                                )}
                                {onDelete && (
                                    <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => onDelete(table)}
                                    >
                                        Eliminar
                                    </DropdownMenuItem>
                                )}
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <CardContent className="pt-6 pb-4 text-center">
                {/* Table Number */}
                <div className="text-3xl font-bold mb-1">
                    {table.number}
                </div>

                {/* Table Name */}
                {table.name && (
                    <p className="text-sm text-muted-foreground mb-2">
                        {table.name}
                    </p>
                )}

                {/* Status Badge */}
                <Badge className={cn("mb-2", statusConfig.badge)}>
                    {statusConfig.icon}
                    <span className="ml-1">{statusConfig.label}</span>
                </Badge>

                {/* Capacity */}
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{table.capacity} personas</span>
                </div>

                {/* Occupied Time */}
                {table.status === 'occupied' && table.occupiedAt && (
                    <div className="mt-2 text-xs text-muted-foreground">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {getOccupiedTime()}
                    </div>
                )}

                {/* Reservation Info */}
                {table.status === 'reserved' && table.reservedName && (
                    <div className="mt-2 text-xs">
                        <span className="font-medium">{table.reservedName}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
