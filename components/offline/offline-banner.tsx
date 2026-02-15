"use client"

import { WifiOff, Loader2, CheckCircle2 } from "lucide-react"
import { useNetworkStatus, syncOfflineMutations } from "@/lib/offline-sync"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function OfflineBanner() {
    const isOnline = useNetworkStatus()
    const [isSyncing, setIsSyncing] = useState(false)
    const [pendingCount, setPendingCount] = useState(0)

    // Monitor for online status to trigger sync
    useEffect(() => {
        if (isOnline) {
            handleSync()
        }
    }, [isOnline])

    const handleSync = async () => {
        setIsSyncing(true)
        try {
            const { synced, failed } = await syncOfflineMutations()
            if (synced > 0) {
                toast.success(`Sincronización completada`, {
                    description: `${synced} operaciones enviadas al servidor.`
                })
            }
            if (failed > 0) {
                toast.error(`Error de sincronización`, {
                    description: `${failed} operaciones fallaron. Revise la consola.`
                })
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSyncing(false)
        }
    }

    if (isOnline && !isSyncing) return null

    return (
        <div className={cn(
            "w-full py-1.5 px-4 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider transition-colors z-50",
            isOnline
                ? "bg-green-500 text-white"
                : "bg-amber-500 text-black animate-in slide-in-from-top duration-300"
        )}>
            {!isOnline ? (
                <>
                    <WifiOff className="h-3.5 w-3.5" />
                    <span>Sin Conexión • Modo Offline Activo</span>
                </>
            ) : (
                <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Conexión restaurada • Sincronizando datos...</span>
                </>
            )}
        </div>
    )
}
