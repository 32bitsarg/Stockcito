"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ExportButtonProps {
    data: any[]
    filename: string
    label?: string
}

export function ExportButton({ data, filename, label = "Exportar CSV" }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        if (!data || data.length === 0) {
            alert("No hay datos para exportar")
            return
        }

        setIsExporting(true)
        
        try {
            // Dynamic import of papaparse - only loads when user clicks export (~40KB saved)
            const Papa = (await import("papaparse")).default
            
            const csv = Papa.unparse(data)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)

            link.setAttribute('href', url)
            link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Error exporting CSV:", error)
            alert("Error al exportar. Intente nuevamente.")
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <Button onClick={handleExport} variant="outline" size="sm" disabled={isExporting}>
            {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
                <Download className="h-4 w-4 mr-2" />
            )}
            {isExporting ? "Exportando..." : label}
        </Button>
    )
}
