"use client"

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

interface SalesChartInnerProps {
    data: Array<{
        date: string
        count: number
        total: number
    }>
}

export function SalesChartInner({ data }: SalesChartInnerProps) {
    const chartData = data.map(item => ({
        ...item,
        displayDate: format(parseISO(item.date), "dd MMM", { locale: es })
    }))

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                No hay datos para mostrar
            </div>
        )
    }

    return (
        <div className="h-full w-full animate-fade-in">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                        dataKey="displayDate" 
                        className="text-xs"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis 
                        className="text-xs"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-background border rounded-lg shadow-lg p-3">
                                        <p className="font-medium">{label}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {payload[0].payload.count} ventas
                                        </p>
                                        <p className="text-sm font-semibold text-primary">
                                            ${Number(payload[0].value).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                )
                            }
                            return null
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
