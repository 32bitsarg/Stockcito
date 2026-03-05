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
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-none lg:scale-105 z-10"
                    : "bg-white dark:bg-zinc-950 hover:border-zinc-900 dark:hover:border-zinc-100"
            )}>
                <CardContent className="p-3 md:p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1 md:space-y-4">
                            <p className={cn(
                                "text-[8px] md:text-[10px] font-black uppercase tracking-widest italic leading-tight",
                                variant === 'premium' ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-500 dark:text-zinc-400"
                            )}>
                                {title}
                            </p>
                            <div className="text-lg md:text-4xl font-black tracking-tighter font-mono italic">
                                {value}
                            </div>
                        </div>
                        <div className={cn(
                            "p-2 md:p-3 rounded-xl md:rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 [&_svg]:h-4 [&_svg]:w-4 md:[&_svg]:h-6 md:[&_svg]:w-6",
                            variant === 'premium'
                                ? "bg-white/10 dark:bg-zinc-900/5 text-white dark:text-zinc-900"
                                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900"
                        )}>
                            {icon}
                        </div>
                    </div>

                    {trend !== undefined && (
                        <div className={cn(
                            "flex items-center gap-1.5 md:gap-2 mt-3 md:mt-6 pt-3 md:pt-6 border-t",
                            variant === 'premium' ? "border-white/10 dark:border-zinc-200" : "border-zinc-100 dark:border-zinc-900"
                        )}>
                            <div className={cn(
                                "flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-black italic uppercase",
                                isPositiveTrend
                                    ? (variant === 'premium' ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white" : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900")
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                            )}>
                                {isPositiveTrend ? <ArrowUpRight className="h-2.5 w-2.5 md:h-3 md:w-3" /> : <ArrowDownRight className="h-2.5 w-2.5 md:h-3 md:w-3" />}
                                {Math.abs(trend).toFixed(1)}%
                            </div>
                            {trendLabel && (
                                <span className={cn(
                                    "text-[7px] md:text-[9px] font-black uppercase tracking-tighter opacity-60 hidden sm:inline",
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
                    "absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity duration-700 hidden md:block",
                    variant === 'premium' ? "text-white" : "text-zinc-900"
                )}>
                    <Hash className="w-24 h-24 md:w-32 md:h-32" />
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
        <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4 pb-4">
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
