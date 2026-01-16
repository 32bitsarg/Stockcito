"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, User, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface RecentActivityProps {
    sales: Array<{
        id: number
        date: Date
        total: any
        client: {
            name: string
        } | null
        items: Array<{
            quantity: number
            product: {
                name: string
            }
        }>
    }>
}

export function RecentActivity({ sales }: RecentActivityProps) {
    return (
        <div className="h-full animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Actividad Reciente
                    </CardTitle>
                    <CardDescription>
                        Últimas {sales.length} ventas realizadas
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                    <div className="space-y-4">
                        {sales.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No hay ventas registradas aún
                            </p>
                        ) : (
                            sales.map((sale, index) => (
                                <div
                                    key={sale.id}
                                    className="flex gap-4 pb-4 border-b last:border-0 last:pb-0 animate-stagger"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <ShoppingCart className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Venta #{sale.id}
                                                </p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    {sale.client ? (
                                                        <>
                                                            <User className="h-3 w-3" />
                                                            {sale.client.name}
                                                        </>
                                                    ) : (
                                                        "Consumidor Final"
                                                    )}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-green-600">
                                                    ${Number(sale.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(sale.date), {
                                                        addSuffix: true,
                                                        locale: es,
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {sale.items.length} producto{sale.items.length !== 1 ? 's' : ''}
                                            {sale.items.length > 0 && sale.items.length <= 2 && (
                                                <>: {sale.items.map(item => item.product.name).join(', ')}</>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
