"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Package, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

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
    const maxRevenue = Math.max(...products.map((p) => p.totalRevenue), 1)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full"
        >
            <Card className="h-full flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden group">
                <CardHeader className="pb-6 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-950">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 italic">
                                <TrendingUp className="h-4 w-4 text-zinc-900 dark:text-zinc-50" />
                                Ranking de Productos
                            </CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                Desempeño por facturación bruta
                            </CardDescription>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center">
                            <ArrowUpRight className="h-4 w-4" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-6">
                    <div className="space-y-8">
                        {products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Package className="h-10 w-10 text-zinc-100 dark:text-zinc-900 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    No hay datos disponibles
                                </p>
                            </div>
                        ) : (
                            products.map((item, index) => {
                                if (!item.product) return null
                                const percentage = (item.totalRevenue / maxRevenue) * 100

                                return (
                                    <div
                                        key={item.product.id}
                                        className="group space-y-4"
                                    >
                                        <div className="flex items-center justify-between gap-6">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl font-black italic text-zinc-100 dark:text-zinc-900 tabular-nums w-8">
                                                        #{index + 1}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={`/inventory/${item.product.id}/edit`}
                                                            className="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase italic tracking-tighter truncate block group-hover:underline underline-offset-4"
                                                        >
                                                            {item.product.name}
                                                        </Link>
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
                                                            SKU: {item.product.sku || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-base font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tighter">
                                                    ${item.totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                </div>
                                                <div className="text-[10px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full inline-block mt-1">
                                                    {item.totalQuantity} VENDIDOS
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative h-1 w-full bg-zinc-50 dark:bg-zinc-900 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1.5, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                                className="absolute top-0 left-0 h-full bg-zinc-900 dark:bg-zinc-100 rounded-full group-hover:bg-primary transition-colors duration-500"
                                            />
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
