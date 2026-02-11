"use client"

import { Product } from "@prisma/client"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface POSProductCardProps {
    product: Product & { category?: { name: string } | null }
    onAddToCart: (product: any) => void
    onEditStock?: (product: any) => void
    compact?: boolean
}

export function POSProductCard({ product, onAddToCart, onEditStock, compact = false }: POSProductCardProps) {
    const hasStock = product.stock > 0
    const isLowStock = product.stock <= 5 && hasStock

    return (
        <div
            className={cn(
                "group relative flex flex-col justify-between rounded-2xl border bg-white dark:bg-zinc-950 p-4 transition-all duration-300 hover:shadow-2xl hover:border-zinc-900 dark:hover:border-zinc-100 cursor-pointer overflow-hidden border-zinc-200 dark:border-zinc-800",
                !hasStock && "opacity-40 grayscale cursor-not-allowed hover:border-zinc-200 dark:hover:border-zinc-800",
                compact ? "h-36" : "h-44"
            )}
            onClick={() => hasStock && onAddToCart(product)}
        >
            <div className="z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full">
                            {product.category?.name || "STOCK"}
                        </span>

                        {(isLowStock || onEditStock) && (
                            <span
                                onClick={(e) => {
                                    if (onEditStock) {
                                        e.stopPropagation()
                                        onEditStock(product)
                                    }
                                }}
                                className={cn(
                                    "text-[10px] font-black px-2 py-0.5 rounded-full z-20 transition-all font-mono",
                                    onEditStock && "cursor-pointer hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900",
                                    !hasStock ? "bg-zinc-200 text-zinc-500" :
                                        isLowStock ? "bg-zinc-500 text-white animate-pulse" :
                                            "bg-zinc-100 text-zinc-500 dark:bg-zinc-900"
                                )}
                            >
                                {product.stock.toString().padStart(2, '0')}
                            </span>
                        )}
                    </div>

                    <h3 className={cn("font-black text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2 italic uppercase tracking-tighter", compact ? "text-sm" : "text-base")}>
                        {product.name}
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-1.5 font-mono uppercase font-bold tracking-widest">
                        SKU: {product.sku || 'N/A'}
                    </p>
                </div>

                <div className="flex items-end justify-between mt-3">
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 font-mono tracking-tighter">
                            ${Number(product.price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    <div className={cn(
                        "h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center transition-all group-hover:bg-zinc-900 group-hover:text-zinc-100 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 shadow-sm",
                        !hasStock && "hidden"
                    )}>
                        <Plus className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Hover visual effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-zinc-900/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    )
}
