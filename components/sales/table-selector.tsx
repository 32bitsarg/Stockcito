"use client"

import { useState, useEffect } from "react"
import { LayoutGrid, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface Table {
    id: number
    number: number
    name: string | null
    capacity: number
    status: 'available' | 'occupied' | 'reserved' | 'cleaning'
}

interface TableSelectorProps {
    tables: Table[]
    selectedTableId: number | null
    onSelectTable: (tableId: number | null) => void
}

export function TableSelector({ tables, selectedTableId, onSelectTable }: TableSelectorProps) {
    const [open, setOpen] = useState(false)

    const selectedTable = tables.find(t => t.id === selectedTableId)
    const availableTables = tables.filter(t => t.status === 'available')

    const getStatusColor = (status: Table['status']) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300'
            case 'occupied':
                return 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300 opacity-60 cursor-not-allowed'
            case 'reserved':
                return 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300 opacity-60 cursor-not-allowed'
            case 'cleaning':
                return 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300 opacity-60 cursor-not-allowed'
        }
    }

    const handleSelect = (table: Table) => {
        if (table.status !== 'available') return
        onSelectTable(table.id)
        setOpen(false)
    }

    const handleClear = () => {
        onSelectTable(null)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={(details) => setOpen(details.open)}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start gap-2",
                        selectedTable && "border-primary bg-primary/5"
                    )}
                >
                    <LayoutGrid className="h-4 w-4" />
                    {selectedTable ? (
                        <>
                            <span className="font-medium">
                                {selectedTable.name || `Mesa ${selectedTable.number}`}
                            </span>
                            <Badge variant="secondary" className="ml-auto">
                                {selectedTable.capacity} personas
                            </Badge>
                        </>
                    ) : (
                        <>
                            <span className="text-muted-foreground">Seleccionar mesa</span>
                            {availableTables.length > 0 && (
                                <Badge variant="outline" className="ml-auto">
                                    {availableTables.length} disponibles
                                </Badge>
                            )}
                        </>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LayoutGrid className="h-5 w-5" />
                        Seleccionar Mesa
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-green-500" />
                            <span>Disponible</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-red-500" />
                            <span>Ocupada</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-yellow-500" />
                            <span>Reservada</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-blue-500" />
                            <span>Limpieza</span>
                        </div>
                    </div>

                    {/* Tables Grid */}
                    <div className="grid grid-cols-4 gap-3 max-h-[300px] overflow-y-auto">
                        {tables.map(table => (
                            <button
                                key={table.id}
                                onClick={() => handleSelect(table)}
                                disabled={table.status !== 'available'}
                                className={cn(
                                    "relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all",
                                    getStatusColor(table.status),
                                    table.id === selectedTableId && "ring-2 ring-primary ring-offset-2"
                                )}
                            >
                                {table.id === selectedTableId && (
                                    <div className="absolute top-1 right-1">
                                        <Check className="h-4 w-4 text-primary" />
                                    </div>
                                )}
                                <span className="text-2xl font-bold">{table.number}</span>
                                <span className="text-xs opacity-75">
                                    {table.capacity}p
                                </span>
                                {table.name && (
                                    <span className="text-[10px] mt-1 truncate max-w-full">
                                        {table.name}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {tables.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <LayoutGrid className="h-12 w-12 mx-auto mb-2 opacity-30" />
                            <p>No hay mesas configuradas</p>
                            <p className="text-xs">Ve a Configuración → Mesas para crear mesas</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                        {selectedTableId && (
                            <Button
                                variant="outline"
                                onClick={handleClear}
                                className="flex-1"
                            >
                                Sin mesa (llevar)
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className={selectedTableId ? "" : "w-full"}
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
