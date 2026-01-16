"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import Link from "next/link"

interface TopProductsWidgetProps {
    products: Array<{
        product: {
            id: number
            name: string
            sku: string | null
        } | null
        totalQuantity: number
        totalRevenue: number
    }>
}

export function TopProductsWidget({ products }: TopProductsWidgetProps) {
    const maxRevenue = Math.max(...products.map((p) => p.totalRevenue))

    return (
        <div className="h-full animate-fade-in" style={{ animationDelay: '150ms' }}>
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        Productos Más Vendidos
                    </CardTitle>
                    <CardDescription>
                        Top {products.length} por ingresos generados
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                    <div className="space-y-4">
                        {products.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No hay datos de ventas aún
                            </p>
                        ) : (
                            products.map((item, index) => {
                                if (!item.product) return null
                                const percentage = (item.totalRevenue / maxRevenue) * 100

                                return (
                                    <div
                                        key={item.product.id}
                                        className="space-y-2 animate-stagger"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <Link
                                                href={`/inventory/${item.product.id}/edit`}
                                                className="text-sm font-medium hover:underline"
                                            >
                                                {item.product.name}
                                            </Link>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold text-green-600">
                                                    ${item.totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.totalQuantity} vendidos
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                                                style={{ 
                                                    width: `${percentage}%`,
                                                    animationDelay: `${index * 100 + 200}ms`
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
