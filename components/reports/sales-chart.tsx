"use client"

import dynamic from "next/dynamic"
import { AreaChartSkeleton } from "@/components/ui/chart-skeleton"

// Lazy load the chart component - reduces initial bundle by ~200KB (recharts)
const SalesChartInner = dynamic(
    () => import("./sales-chart-inner").then(mod => ({ default: mod.SalesChartInner })),
    { 
        loading: () => <AreaChartSkeleton />,
        ssr: false 
    }
)

interface SalesChartProps {
    data: Array<{
        date: string
        count: number
        total: number
    }>
}

export function SalesChart({ data }: SalesChartProps) {
    return <SalesChartInner data={data} />
}
