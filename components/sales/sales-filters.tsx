"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { useState } from "react"

export function SalesFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [startDate, setStartDate] = useState(searchParams.get('startDate') || '')
    const [endDate, setEndDate] = useState(searchParams.get('endDate') || '')

    function handleFilter() {
        const params = new URLSearchParams()
        if (startDate) params.set('startDate', startDate)
        if (endDate) params.set('endDate', endDate)
        router.push(`/sales/history?${params.toString()}`)
    }

    function handleClear() {
        setStartDate('')
        setEndDate('')
        router.push('/sales/history')
    }

    const hasFilters = startDate || endDate

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="startDate">Fecha Desde</Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endDate">Fecha Hasta</Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end gap-2">
                        <Button onClick={handleFilter} className="flex-1">
                            Filtrar
                        </Button>
                        {hasFilters && (
                            <Button onClick={handleClear} variant="outline" size="icon">
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
