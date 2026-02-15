"use client"

import { useEffect, useRef } from "react"
import { useNetworkStatus, syncOfflineMutations } from "@/lib/offline-sync"
import { toast } from "sonner"

/**
 * Servicio de sincronización automática.
 * 
 * Se ejecuta en 2 escenarios:
 * 1. Al montar la app (startup) si ya hay internet → sincroniza pendientes de sesiones anteriores
 * 2. Al pasar de offline → online → sincroniza pendientes de la sesión actual
 */
export function SyncService() {
    const isOnline = useNetworkStatus()
    const hasRunStartupSync = useRef(false)

    // Sync on app startup (covers: app was closed offline, reopened with internet)
    useEffect(() => {
        if (hasRunStartupSync.current) return
        hasRunStartupSync.current = true

        if (navigator.onLine) {
            const timer = setTimeout(async () => {
                const { synced, failed } = await syncOfflineMutations()
                if (synced > 0) {
                    toast.success("Sincronización completada", {
                        description: `${synced} operación${synced !== 1 ? 'es' : ''} pendiente${synced !== 1 ? 's' : ''} enviada${synced !== 1 ? 's' : ''} al servidor.`
                    })
                }
                if (failed > 0) {
                    toast.error("Error de sincronización", {
                        description: `${failed} operación${failed !== 1 ? 'es' : ''} no pudieron enviarse.`
                    })
                }
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [])

    // Sync on reconnect (covers: offline → online transition)
    useEffect(() => {
        if (isOnline) {
            const runSync = async () => {
                const { synced, failed } = await syncOfflineMutations()
                if (synced > 0) {
                    toast.success("Sincronización completada", {
                        description: `${synced} operación${synced !== 1 ? 'es' : ''} pendiente${synced !== 1 ? 's' : ''} enviada${synced !== 1 ? 's' : ''} al servidor.`
                    })
                }
                if (failed > 0) {
                    toast.error("Error de sincronización", {
                        description: `${failed} operación${failed !== 1 ? 'es' : ''} no pudieron enviarse.`
                    })
                }
            }
            const timer = setTimeout(runSync, 2000)
            return () => clearTimeout(timer)
        }
    }, [isOnline])

    return null
}
