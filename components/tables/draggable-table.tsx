"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { type TableData } from "@/actions/table-actions"
import { GripVertical } from "lucide-react"

interface DraggableTableProps {
    table: TableData
    onEdit: (table: TableData) => void
    isLayoutMode: boolean
}

export function DraggableTable({ table, onEdit, isLayoutMode }: DraggableTableProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: table.id.toString(),
        data: table,
        disabled: !isLayoutMode,
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        left: table.positionX ? `${table.positionX}px` : '0px',
        top: table.positionY ? `${table.positionY}px` : '0px',
        position: 'absolute' as const,
    }

    const getShapeStyles = (shape: string) => {
        switch (shape) {
            case 'round': return 'rounded-full'
            case 'rectangle': return 'rounded-md aspect-[1.5/1]'
            default: return 'rounded-lg aspect-square' // square
        }
    }

    const getStatusColors = (status: string) => {
        switch (status) {
            case 'occupied': return 'bg-red-100 border-red-300 text-red-700'
            case 'reserved': return 'bg-yellow-100 border-yellow-300 text-yellow-700'
            case 'cleaning': return 'bg-blue-100 border-blue-300 text-blue-700'
            default: return 'bg-green-100 border-green-300 text-green-700'
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...(isLayoutMode ? listeners : {})}
            className={cn(
                "w-24 border-2 flex flex-col items-center justify-center p-2 shadow-sm transition-shadow cursor-grab active:cursor-grabbing hover:shadow-md hover:z-10 bg-background",
                getShapeStyles(table.shape),
                getStatusColors(table.status),
                isDragging ? "opacity-50 z-50 shadow-xl scale-105" : "",
                !isLayoutMode && "cursor-pointer"
            )}
            onClick={(e) => {
                // Prevent edit click when dragging finished
                if (!isDragging && !isLayoutMode) {
                    onEdit(table)
                }
            }}
        >
            {isLayoutMode && (
                <div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 border shadow-sm">
                    <GripVertical className="w-3 h-3 text-muted-foreground" />
                </div>
            )}
            <span className="font-bold text-lg">{table.number}</span>
            <span className="text-[10px] uppercase font-semibold text-center leading-tight truncate w-full">
                {table.name || 'Mesa'}
            </span>
            <span className="text-[10px] text-muted-foreground/80 mt-1">
                {table.capacity}p
            </span>
        </div>
    )
}
