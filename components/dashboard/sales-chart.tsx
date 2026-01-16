"use client"

import dynamic from "next/dynamic"
import { ChartSkeleton } from "@/components/ui/chart-skeleton"

// Lazy load the chart component - reduces initial bundle by ~200KB (recharts)
const SalesChartInner = dynamic(
    () => import("./sales-chart-inner").then(mod => ({ default: mod.SalesChartInner })),
    { 
        loading: () => <ChartSkeleton />,
        ssr: false 
    }
)

interface SalesChartProps {
    data: Array<{
        date: string
        revenue: number
        count: number
    }>
    type?: "line" | "bar"
}

export function SalesChart({ data, type = "line" }: SalesChartProps) {
    return <SalesChartInner data={data} type={type} />
}
