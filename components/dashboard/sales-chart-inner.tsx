"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { motion } from "framer-motion"
import Link from "next/link"

interface SalesChartInnerProps {
    data: Array<{
        date: string
        revenue: number
        count: number
    }>
    type?: "line" | "bar"
}

export function SalesChartInner({ data }: SalesChartInnerProps) {
    const formattedData = data.map((item) => ({
        ...item,
        dateLabel: format(new Date(item.date), "dd MMM", { locale: es }),
        revenueFormatted: `$${Number(item.revenue).toFixed(2)}`,
    }))

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-950 text-white backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 animate-in fade-in zoom-in duration-300">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 pb-1.5 border-b border-white/5">
                        {payload[0].payload.dateLabel}
                    </p>
                    <div className="space-y-1">
                        <p className="text-2xl font-black font-mono tracking-tighter italic text-white">
                            ${payload[0].value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">
                                {payload[0].payload.count.toString().padStart(2, '0')} OPERACIONES
                            </p>
                        </div>
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="h-full font-sans"
        >
            <Card className="h-full flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden group relative">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                    <div className="w-48 h-48 md:w-64 md:h-64 border border-zinc-900 dark:border-white rounded-full scale-150" />
                </div>

                <CardHeader className="pb-6 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-950 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.1em] italic text-zinc-900 dark:text-zinc-50">Análisis de Rendimiento</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                Evolución financiera / Últimos {data.length} días
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 px-3 py-1 rounded-full shadow-lg">
                            <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white dark:text-zinc-900">En vivo</span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 pt-10 px-2 pb-0 relative z-10 min-w-0 overflow-hidden">
                    <ResponsiveContainer width="99%" height="100%">
                        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="currentColor" stopOpacity={0.15} className="text-zinc-900 dark:text-zinc-50" />
                                    <stop offset="100%" stopColor="currentColor" stopOpacity={0} className="text-zinc-900 dark:text-zinc-50" />
                                </linearGradient>
                            </defs>

                            {/* Minimalism: Remove CartesianGrid or make it invisible */}
                            <CartesianGrid vertical={false} strokeDasharray="3 3" verticalFill={['#000', '#eee']} fillOpacity={0.02} strokeOpacity={0.1} />

                            <XAxis
                                dataKey="dateLabel"
                                axisLine={false}
                                tickLine={false}
                                className="text-[9px] font-black uppercase tracking-widest opacity-40"
                                tick={{ fill: "currentColor" }}
                                dy={15}
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                className="text-[9px] font-black uppercase tracking-widest font-mono opacity-40"
                                tick={{ fill: "currentColor" }}
                                tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                                dx={-10}
                            />

                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{
                                    stroke: 'currentColor',
                                    strokeWidth: 1,
                                    strokeDasharray: '4 4',
                                    strokeOpacity: 0.2
                                }}
                            />

                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="currentColor"
                                strokeWidth={3}
                                strokeLinecap="round"
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                className="text-zinc-900 dark:text-zinc-50"
                                activeDot={{
                                    r: 6,
                                    strokeWidth: 4,
                                    stroke: "white",
                                    fill: "black",
                                    className: "dark:stroke-zinc-950 dark:fill-white shadow-xl"
                                }}
                                animationDuration={2500}
                                animationEasing="ease-in-out"
                            />
                        </AreaChart>
                    </ResponsiveContainer>

                    {/* Bottom Status Bar */}
                    <div className="flex justify-between items-center px-4 py-3 border-t border-zinc-100 dark:border-zinc-900 mt-4 h-12">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Total Periodo</span>
                                <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 font-mono tracking-tighter italic">
                                    ${data.reduce((acc, i) => acc + i.revenue, 0).toLocaleString('es-AR')}
                                </span>
                            </div>
                            <div className="w-px h-6 bg-zinc-100 dark:bg-zinc-900" />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Promedio Diario</span>
                                <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 font-mono tracking-tighter italic">
                                    ${(data.reduce((acc, i) => acc + i.revenue, 0) / (data.length || 1)).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        </div>
                        <Link href="/changelog" className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-300 dark:text-zinc-700 hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors">
                            Analytics Unit v0.1.6
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
