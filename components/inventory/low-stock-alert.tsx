"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package } from "lucide-react"
import Link from "next/link"

interface LowStockAlertProps {
    products: Array<{
        id: number
        name: string
        stock: number
        minStock: number
        sku: string | null
    }>
}

export function LowStockAlert({ products }: LowStockAlertProps) {
    if (products.length === 0) return null

    return (
        <div className="animate-fade-in-down">
            <Card className="border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                        <AlertTriangle className="h-5 w-5" />
                        Alerta de Stock Bajo
                    </CardTitle>
                    <CardDescription>
                        {products.length} producto{products.length !== 1 ? 's' : ''} necesita{products.length === 1 ? '' : 'n'} reposición
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {products.slice(0, 5).map((product, index) => (
                            <div
                                key={product.id}
                                className="flex items-center justify-between p-3 bg-background rounded-lg border animate-stagger"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-md">
                                        <Package className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        {product.sku && (
                                            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <Badge variant="destructive" className="font-mono">
                                            {product.stock} / {product.minStock}
                                        </Badge>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Stock / Mínimo
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {products.length > 5 && (
                            <div className="text-center pt-2">
                                <Link href="/inventory?filter=low-stock">
                                    <Button variant="outline" size="sm">
                                        Ver todos ({products.length})
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
