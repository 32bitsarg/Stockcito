"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

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
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-2xl relative">
                {/* Warning accent line */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-zinc-900 dark:bg-zinc-100" />

                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-900">
                    {/* Left: Info Section */}
                    <div className="md:w-1/3 p-6 bg-zinc-50/50 dark:bg-zinc-900/10 flex flex-col justify-between gap-6">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Atención Crítica</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-zinc-900 dark:text-zinc-100 leading-none mb-2">
                                    Quiebre de Stock
                                </h3>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                                    Se detectarón {products.length} productos que requieren reposición inmediata para evitar pérdida de ventas.
                                </p>
                            </div>
                        </div>

                        <Link href="/inventory?filter=low-stock">
                            <Button variant="outline" size="sm" className="w-full justify-between items-center h-10 border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-all group">
                                Gestionar Inventario
                                <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                            </Button>
                        </Link>
                    </div>

                    {/* Right: Products List */}
                    <div className="md:w-2/3 p-2 bg-white dark:bg-zinc-950">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {products.slice(0, 4).map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-4 rounded-xl border border-zinc-50 dark:border-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-all group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-10 w-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-lg group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-all">
                                            <Package className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 truncate uppercase italic tracking-tighter">{product.name}</p>
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
                                                SKU: {product.sku || '---'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="text-base font-black font-mono tracking-tighter text-red-500 dark:text-red-400">
                                            {product.stock.toString().padStart(2, '0')}
                                        </div>
                                        <div className="text-[8px] font-black uppercase tracking-widest text-zinc-300 dark:text-zinc-700">
                                            Disp. / {product.minStock}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {products.length > 4 && (
                                <div className="col-span-1 sm:col-span-2 p-3 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                        + {products.length - 4} productos adicionales en alerta
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}
