"use client"

import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    trend?: number
    trendLabel?: string
    gradient?: string
    delay?: number
}

function StatCard({ title, value, icon, trend, trendLabel, gradient, delay = 0 }: StatCardProps) {
    const isPositiveTrend = trend !== undefined && trend >= 0

    return (
        <div 
            className="animate-stagger"
            style={{ animationDelay: `${delay}ms` }}
        >
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div
                    className="absolute top-0 right-0 w-32 h-32 opacity-10"
                    style={{
                        background: gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: "0 0 0 100%",
                    }}
                />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    <div className="p-2 rounded-lg bg-primary/10">
                        {icon}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{value}</div>
                    {trend !== undefined && (
                        <div className="flex items-center gap-1 mt-2">
                            {isPositiveTrend ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span
                                className={`text-sm font-medium ${isPositiveTrend ? "text-green-500" : "text-red-500"
                                    }`}
                            >
                                {Math.abs(trend).toFixed(1)}%
                            </span>
                            {trendLabel && (
                                <span className="text-sm text-muted-foreground ml-1">
                                    {trendLabel}
                                </span>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

interface DashboardStatsProps {
    metrics: {
        todayRevenue: number
        todaySalesCount: number
        dailyTrend: number
        monthRevenue: number
        monthSalesCount: number
        monthlyTrend: number
        lowStockCount: number
        inventoryValue: number
        totalClients: number
    }
}

export function DashboardStats({ metrics }: DashboardStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Ventas Hoy"
                value={`$${metrics.todayRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                icon={<DollarSign className="h-4 w-4 text-primary" />}
                trend={metrics.dailyTrend}
                trendLabel="vs ayer"
                gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                delay={0}
            />
            <StatCard
                title="Ventas del Mes"
                value={`$${metrics.monthRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                icon={<ShoppingCart className="h-4 w-4 text-primary" />}
                trend={metrics.monthlyTrend}
                trendLabel="vs mes anterior"
                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                delay={50}
            />
            <StatCard
                title="Stock Bajo"
                value={metrics.lowStockCount}
                icon={<Package className="h-4 w-4 text-orange-500" />}
                gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                delay={100}
            />
            <StatCard
                title="Clientes"
                value={metrics.totalClients}
                icon={<Users className="h-4 w-4 text-primary" />}
                gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                delay={150}
            />
        </div>
    )
}
