"use client"

import { WifiOff, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface OfflineDataBadgeProps {
    /** Si true, muestra el badge */
    isOfflineData: boolean
    /** Timestamp de la última actualización de los datos */
    dataUpdatedAt?: number
    className?: string
}

/**
 * Badge visual que indica que los datos mostrados son del caché local.
 * Aparece cuando el usuario está offline y los datos se sirven desde IndexedDB.
 * 
 * SEGURIDAD: No expone ningún dato sensible, solo el estado de la conexión
 * y cuándo se obtuvieron los datos por última vez.
 */
export function OfflineDataBadge({ isOfflineData, dataUpdatedAt, className = "" }: OfflineDataBadgeProps) {
    if (!isOfflineData) return null

    const timeAgo = dataUpdatedAt
        ? formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true, locale: es })
        : null

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-medium ${className}`}>
            <WifiOff className="w-3.5 h-3.5" />
            <span>Datos locales</span>
            {timeAgo && (
                <>
                    <span className="opacity-50">·</span>
                    <Clock className="w-3 h-3 opacity-70" />
                    <span className="opacity-70">{timeAgo}</span>
                </>
            )}
        </div>
    )
}
