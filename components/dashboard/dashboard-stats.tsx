"use client"

import { DollarSign, ShoppingCart, Package, Users, ArrowUpRight, ArrowDownRight, Hash } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    trend?: number
    trendLabel?: string
    delay?: number
    variant?: 'default' | 'premium'
}

function StatCard({ title, value, icon, trend, trendLabel, delay = 0, variant = 'default' }: StatCardProps) {
    const isPositiveTrend = trend !== undefined && trend >= 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
        >
            <Card className={cn(
                "group relative overflow-hidden h-full border-zinc-200 dark:border-zinc-800 transition-all duration-500 shadow-sm hover:shadow-2xl",
                variant === 'premium'
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-none scale-105 z-10"
                    : "bg-white dark:bg-zinc-950 hover:border-zinc-900 dark:hover:border-zinc-100"
            )}>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-4">
                            <p className={cn(
                                "text-[10px] font-black uppercase tracking-widest italic",
                                variant === 'premium' ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-500 dark:text-zinc-400"
                            )}>
                                {title}
                            </p>
                            <div className="text-4xl font-black tracking-tighter font-mono italic">
                                {value}
                            </div>
                        </div>
                        <div className={cn(
                            "p-3 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                            variant === 'premium'
                                ? "bg-white/10 dark:bg-zinc-900/5 text-white dark:text-zinc-900"
                                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900"
                        )}>
                            {icon}
                        </div>
                    </div>

                    {trend !== undefined && (
                        <div className={cn(
                            "flex items-center gap-2 mt-6 pt-6 border-t",
                            variant === 'premium' ? "border-white/10 dark:border-zinc-200" : "border-zinc-100 dark:border-zinc-900"
                        )}>
                            <div className={cn(
                                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black italic uppercase",
                                isPositiveTrend
                                    ? (variant === 'premium' ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white" : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900")
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                            )}>
                                {isPositiveTrend ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                {Math.abs(trend).toFixed(1)}%
                            </div>
                            {trendLabel && (
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-tighter opacity-60",
                                    variant === 'premium' ? "text-white" : "text-zinc-400"
                                )}>
                                    {trendLabel}
                                </span>
                            )}
                        </div>
                    )}
                </CardContent>

                {/* Background Pattern */}
                <div className={cn(
                    "absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity duration-700",
                    variant === 'premium' ? "text-white" : "text-zinc-900"
                )}>
                    <Hash className="w-32 h-32" />
                </div>
            </Card>
        </motion.div>
    )
}

interface DashboardStatsProps {
    metrics: {
        todayRevenue: number
        todaySalesCount: number
        dailyTrend: number
        monthRevenue: number
        todaySalesCountMonthly?: number
        monthlyTrend: number
        lowStockCount: number
        inventoryValue: number
        totalClients: number
    }
}

export function DashboardStats({ metrics }: DashboardStatsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 pb-4">
            <StatCard
                variant="premium"
                title="Flujo de Ingresos / Hoy"
                value={`$${metrics.todayRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                icon={<DollarSign className="h-6 w-6" />}
                trend={metrics.dailyTrend}
                trendLabel="vs periodo anterior"
                delay={0}
            />
            <StatCard
                title="Performance Mensual"
                value={`$${metrics.monthRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                icon={<ShoppingCart className="h-6 w-6" />}
                trend={metrics.monthlyTrend}
                trendLabel="crecimiento acumulado"
                delay={100}
            />
            <StatCard
                title="Nivel de Existencias"
                value={metrics.lowStockCount.toString().padStart(2, '0')}
                icon={<Package className="h-6 w-6" />}
                trend={metrics.lowStockCount > 5 ? -metrics.lowStockCount : undefined}
                trendLabel="alertas críticas"
                delay={200}
            />
            <StatCard
                title="Base de Activos"
                value={metrics.totalClients.toString().padStart(2, '0')}
                icon={<Users className="h-6 w-6" />}
                trendLabel="clientes totales"
                trend={2.4}
                delay={300}
            />
        </div>
    )
}
