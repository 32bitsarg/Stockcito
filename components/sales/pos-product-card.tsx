"use client"

import { Product } from "@prisma/client"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface POSProductCardProps {
    product: Product & { category?: { name: string } | null }
    onAddToCart: (product: any) => void
    compact?: boolean
}

export function POSProductCard({ product, onAddToCart, compact = false }: POSProductCardProps) {
    const hasStock = product.stock > 0
    const isLowStock = product.stock <= 5 && hasStock

    return (
        <div
            className={cn(
                "group relative flex flex-col justify-between rounded-xl border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:border-primary/50 cursor-pointer overflow-hidden",
                !hasStock && "opacity-60 grayscale cursor-not-allowed hover:border-border hover:shadow-sm",
                compact ? "h-32" : "h-40"
            )}
            onClick={() => hasStock && onAddToCart(product)}
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-10 bg-primary/5 rounded-bl-[100px] z-0 transition-transform group-hover:scale-150" />

            <div className="z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider line-clamp-1">
                            {product.category?.name || "Sin Categ."}
                        </span>
                        {isLowStock && (
                            <span className="text-[10px] font-bold text-red-500 bg-red-100 dark:bg-red-950/50 px-1.5 py-0.5 rounded-full">
                                Bajo: {product.stock}
                            </span>
                        )}
                    </div>
                    <h3 className={cn("font-bold leading-tight line-clamp-2", compact ? "text-sm" : "text-base")}>
                        {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {product.sku}
                    </p>
                </div>

                <div className="flex items-end justify-between mt-2">
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-primary">
                            ${Number(product.price).toLocaleString('es-AR')}
                        </span>
                    </div>

                    <Button
                        size="icon"
                        variant="secondary"
                        className={cn(
                            "h-8 w-8 rounded-full shadow-sm transition-transform active:scale-95 group-hover:bg-primary group-hover:text-primary-foreground",
                            !hasStock && "opacity-0"
                        )}
                        disabled={!hasStock}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
