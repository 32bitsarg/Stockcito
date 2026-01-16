"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar } from "lucide-react"

interface ReportPeriodSelectorProps {
    currentPeriod: string
}

export function ReportPeriodSelector({ currentPeriod }: ReportPeriodSelectorProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handlePeriodChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("period", value)
        router.push(`?${params.toString()}`)
    }

    return (
        <Select value={currentPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mes</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
        </Select>
    )
}
