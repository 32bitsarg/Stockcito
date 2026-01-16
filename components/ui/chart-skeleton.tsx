"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ChartSkeleton() {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56 mt-1" />
            </CardHeader>
            <CardContent className="flex-1 flex items-end gap-2 pb-6">
                {/* Simulate bar chart bars */}
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end h-full">
                        <Skeleton 
                            className="w-full rounded-t"
                            style={{ 
                                height: `${Math.random() * 60 + 20}%`,
                                animationDelay: `${i * 100}ms`
                            }} 
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

export function AreaChartSkeleton() {
    return (
        <div className="h-full w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full animate-pulse" />
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
    )
}
