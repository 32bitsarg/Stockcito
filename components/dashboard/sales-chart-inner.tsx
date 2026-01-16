"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface SalesChartInnerProps {
    data: Array<{
        date: string
        revenue: number
        count: number
    }>
    type?: "line" | "bar"
}

export function SalesChartInner({ data, type = "line" }: SalesChartInnerProps) {
    const formattedData = data.map((item) => ({
        ...item,
        dateLabel: format(new Date(item.date), "dd MMM", { locale: es }),
        revenueFormatted: `$${item.revenue.toFixed(2)}`,
    }))

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="font-semibold">{payload[0].payload.dateLabel}</p>
                    <p className="text-sm text-green-600">
                        Ingresos: ${payload[0].value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Ventas: {payload[0].payload.count}
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="h-full animate-fade-in">
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle>Ventas Recientes</CardTitle>
                    <CardDescription>
                        Ingresos de los últimos {data.length} días
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        {type === "line" ? (
                            <LineChart data={formattedData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="dateLabel"
                                    className="text-xs"
                                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                                />
                                <YAxis
                                    className="text-xs"
                                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        ) : (
                            <BarChart data={formattedData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="dateLabel"
                                    className="text-xs"
                                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                                />
                                <YAxis
                                    className="text-xs"
                                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="revenue"
                                    fill="hsl(var(--primary))"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
