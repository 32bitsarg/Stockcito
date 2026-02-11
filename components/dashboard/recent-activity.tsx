"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, User, Clock, CheckCircle2, ChevronRight, Hash } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { motion } from "framer-motion"

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
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="h-full font-sans"
        >
            <Card className="h-full flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden group">
                <CardHeader className="pb-6 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-950">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 italic">
                                <Clock className="h-4 w-4 text-zinc-900 dark:text-zinc-50" />
                                Flujo de Actividad
                            </CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                Registro cronológico de operaciones
                            </CardDescription>
                        </div>
                        <Hash className="h-4 w-4 text-zinc-300" />
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-0">
                    <div className="relative">
                        {/* Timeline vertical line */}
                        <div className="absolute left-[31px] top-0 bottom-0 w-px bg-zinc-100 dark:bg-zinc-900" />

                        <div className="divide-y divide-zinc-50 dark:divide-zinc-900/40">
                            {sales.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 text-center">
                                    <ShoppingCart className="h-10 w-10 mb-4 text-zinc-100 dark:text-zinc-900" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Sin Operaciones Registradas</p>
                                </div>
                            ) : (
                                sales.map((sale, index) => (
                                    <div
                                        key={sale.id}
                                        className="relative group/item flex items-start gap-8 p-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all duration-300"
                                    >
                                        {/* Timeline Dot */}
                                        <div className="relative z-10 flex-shrink-0 mt-1.5">
                                            <div className="w-4 h-4 rounded-full bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center transition-all group-hover/item:border-zinc-900 dark:group-hover/item:border-white group-hover/item:scale-125 shadow-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 transition-all group-hover/item:bg-zinc-900 dark:group-hover/item:bg-white" />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 space-y-4">
                                            <div className="flex items-start justify-between gap-6">
                                                <div className="space-y-1.5 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase italic tracking-tighter">
                                                            Venta Digital #{sale.id.toString().padStart(4, '0')}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full text-[9px] font-black text-zinc-500 uppercase tracking-widest border border-zinc-200 dark:border-zinc-800">
                                                            <CheckCircle2 className="h-2.5 w-2.5 text-zinc-900 dark:text-zinc-100" />
                                                            Verificado
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                                        <User className="h-3 w-3" />
                                                        {sale.client?.name || "CONSUMIDOR FINAL"}
                                                    </p>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <div className="text-base font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tighter tabular-nums leading-none mb-1">
                                                        ${Number(sale.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                    </div>
                                                    <div className="text-[9px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-tighter">
                                                        {formatDistanceToNow(new Date(sale.date), {
                                                            addSuffix: true,
                                                            locale: es,
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Item Summary Tags */}
                                            <div className="flex flex-wrap gap-1.5">
                                                {sale.items.map((item, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-2 py-0.5 rounded-md text-[9px] font-black text-zinc-500 uppercase tracking-widest shadow-sm group-hover/item:bg-zinc-50 dark:group-hover/item:bg-zinc-800 transition-colors"
                                                    >
                                                        <span className="text-zinc-950 dark:text-zinc-100 font-mono">{item.quantity}x</span>
                                                        <span className="truncate max-w-[100px]">{item.product.name}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Action Arrow */}
                                        <div className="flex-shrink-0 opacity-0 group-hover/item:opacity-100 transition-all translate-x-2 group-hover/item:translate-x-0 mt-1">
                                            <ChevronRight className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
