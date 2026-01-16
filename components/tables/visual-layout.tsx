"use client"

import { useState, useRef } from "react"
import {
    DndContext,
    useSensor,
    useSensors,
    PointerSensor,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DragOverlay
} from "@dnd-kit/core"
import { restrictToParentElement } from "@dnd-kit/modifiers"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DraggableTable } from "./draggable-table"
import { TableData, updateTablePositions } from "@/actions/table-actions"
import { toast } from "sonner"
import { Save, LayoutGrid, MousePointer2 } from "lucide-react"

interface VisualLayoutProps {
    tables: TableData[]
    onEditTable: (table: TableData) => void
    isAdmin: boolean
}

export function VisualLayout({ tables: initialTables, onEditTable, isAdmin }: VisualLayoutProps) {
    const [tables, setTables] = useState<TableData[]>(initialTables)
    const [isLayoutMode, setIsLayoutMode] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [activeId, setActiveId] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent drag on simple clicks
            },
        })
    )

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event
        setActiveId(null)

        if (!delta.x && !delta.y) return

        setTables((prev) =>
            prev.map((table) => {
                if (table.id.toString() === active.id) {
                    const newX = Math.max(0, (table.positionX || 0) + delta.x)
                    const newY = Math.max(0, (table.positionY || 0) + delta.y)
                    return { ...table, positionX: newX, positionY: newY }
                }
                return table
            })
        )
        setHasUnsavedChanges(true)
    }

    const handleSave = async () => {
        const updates = tables.map(t => ({
            id: t.id,
            positionX: t.positionX || 0,
            positionY: t.positionY || 0
        }))

        const result = await updateTablePositions(updates)
        if (result.success) {
            toast.success("Distribución guardada correctamente")
            setHasUnsavedChanges(false)
            setIsLayoutMode(false)
        } else {
            toast.error("Error al guardar distribución")
        }
    }

    // Identify active table for overlay
    const activeTable = tables.find(t => t.id.toString() === activeId)

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="layout-mode"
                            checked={isLayoutMode}
                            onCheckedChange={(e) => setIsLayoutMode(e.checked)}
                            disabled={!isAdmin}
                        />
                        <Label htmlFor="layout-mode" className="flex items-center gap-2 cursor-pointer">
                            {isLayoutMode ? <LayoutGrid className="w-4 h-4" /> : <MousePointer2 className="w-4 h-4" />}
                            {isLayoutMode ? "Modo Edición" : "Modo Operativo"}
                        </Label>
                    </div>
                </div>

                {isLayoutMode && (
                    <Button
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges}
                        variant={hasUnsavedChanges ? "default" : "outline"}
                        size="sm"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                    </Button>
                )}
            </div>

            {/* Canvas Container */}
            <div
                ref={containerRef}
                className="relative w-full h-[600px] bg-muted/30 border-2 border-dashed rounded-xl overflow-hidden shadow-inner bg-[url('/grid-pattern.svg')] bg-repeat"
            >
                <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToParentElement]}
                >
                    {tables.map((table) => (
                        <DraggableTable
                            key={table.id}
                            table={table}
                            onEdit={onEditTable}
                            isLayoutMode={isLayoutMode}
                        />
                    ))}

                    <DragOverlay>
                        {activeTable ? (
                            <DraggableTable
                                table={activeTable}
                                onEdit={() => { }}
                                isLayoutMode={true}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>

                {!isLayoutMode && tables.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground p-8 text-center">
                        <p>No hay mesas. Activá el modo edición o agregá mesas desde la lista.</p>
                    </div>
                )}
            </div>

            <div className="text-xs text-muted-foreground text-center">
                {isLayoutMode
                    ? "Arrastrá las mesas para acomodarlas. Recordá guardar los cambios."
                    : "Hacé click en una mesa para ver detalles o gestionarla."}
            </div>
        </div>
    )
}
