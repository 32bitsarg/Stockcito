"use client"

import { useState, useEffect, useCallback } from "react"
import { Cloud, CloudOff, RefreshCw, AlertTriangle, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PendingSale {
    id: number
    status: 'pending' | 'syncing' | 'failed' | 'synced'
    createdAt: string
    syncAttempts: number
    lastError?: string
    items?: { name: string; quantity: number }[]
    total?: number
}

export function OfflineStatus() {
    const [isOnline, setIsOnline] = useState(true)
    const [pendingSales, setPendingSales] = useState<PendingSale[]>([])
    const [isSyncing, setIsSyncing] = useState(false)
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

    // Listen for online/offline events
    useEffect(() => {
        setIsOnline(navigator.onLine)

        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    // Listen for Service Worker messages
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return

        const handleMessage = (event: MessageEvent) => {
            const { data } = event

            if (data.type === 'PENDING_SALES') {
                setPendingSales(data.sales || [])
            }

            if (data.type === 'SALE_SYNCED') {
                // Update the specific sale as synced
                setPendingSales(prev =>
                    prev.map(s => s.id === data.offlineSaleId
                        ? { ...s, status: 'synced' as const }
                        : s
                    )
                )
                setLastSyncTime(new Date())
            }

            if (data.type === 'SYNC_COMPLETE') {
                setIsSyncing(false)
                setLastSyncTime(new Date())
                // Refresh the list
                requestPendingSales()
            }
        }

        navigator.serviceWorker.addEventListener('message', handleMessage)

        // Initial fetch
        requestPendingSales()

        return () => {
            navigator.serviceWorker.removeEventListener('message', handleMessage)
        }
    }, [])

    const requestPendingSales = useCallback(async () => {
        if (!('serviceWorker' in navigator)) return

        const registration = await navigator.serviceWorker.ready
        registration.active?.postMessage({ type: 'GET_PENDING_SALES' })
    }, [])

    const handleForceSync = useCallback(async () => {
        if (!('serviceWorker' in navigator) || !isOnline) return

        setIsSyncing(true)
        const registration = await navigator.serviceWorker.ready
        registration.active?.postMessage({ type: 'FORCE_SYNC' })

        // Also try the Background Sync API if available
        if ('sync' in registration) {
            try {
                await (registration as any).sync.register('sync-sales')
            } catch {
                // Background sync not supported or failed, SW will handle it
            }
        }
    }, [isOnline])

    const pendingCount = pendingSales.filter(s => s.status === 'pending').length
    const failedCount = pendingSales.filter(s => s.status === 'failed').length
    const hasPending = pendingCount > 0 || failedCount > 0

    // Don't show anything if online and no pending sales
    if (isOnline && !hasPending && !isSyncing) {
        return null
    }

    const getStatusIcon = () => {
        if (isSyncing) {
            return <Loader2 className="h-4 w-4 animate-spin" />
        }
        if (!isOnline) {
            return <CloudOff className="h-4 w-4" />
        }
        if (failedCount > 0) {
            return <AlertTriangle className="h-4 w-4" />
        }
        if (pendingCount > 0) {
            return <Cloud className="h-4 w-4" />
        }
        return <Check className="h-4 w-4" />
    }

    const getStatusColor = () => {
        if (!isOnline) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30"
        if (failedCount > 0) return "text-red-600 bg-red-100 dark:bg-red-900/30"
        if (pendingCount > 0) return "text-blue-600 bg-blue-100 dark:bg-blue-900/30"
        return "text-green-600 bg-green-100 dark:bg-green-900/30"
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("relative", getStatusColor())}
                    title={isOnline ? "Estado de sincronización" : "Sin conexión"}
                >
                    {getStatusIcon()}
                    {hasPending && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                            {pendingCount + failedCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                    {/* Connection Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isOnline ? (
                                <>
                                    <Cloud className="h-4 w-4 text-green-600" />
                                    <span className="font-medium">Conectado</span>
                                </>
                            ) : (
                                <>
                                    <CloudOff className="h-4 w-4 text-yellow-600" />
                                    <span className="font-medium">Sin conexión</span>
                                </>
                            )}
                        </div>
                        {lastSyncTime && (
                            <span className="text-xs text-muted-foreground">
                                Última sync: {formatTime(lastSyncTime)}
                            </span>
                        )}
                    </div>

                    {/* Pending Sales Summary */}
                    {hasPending && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Ventas pendientes</span>
                                <Badge variant="secondary">{pendingCount}</Badge>
                            </div>
                            {failedCount > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-red-600">Ventas fallidas</span>
                                    <Badge variant="destructive">{failedCount}</Badge>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pending Sales List */}
                    {pendingSales.length > 0 && (
                        <div className="border rounded-md max-h-48 overflow-y-auto">
                            {pendingSales.slice(0, 5).map((sale) => (
                                <div
                                    key={sale.id}
                                    className={cn(
                                        "p-2 border-b last:border-0 text-sm",
                                        sale.status === 'failed' && "bg-red-50 dark:bg-red-900/10"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs">
                                            #{sale.id}
                                        </span>
                                        <Badge
                                            variant={sale.status === 'failed' ? 'destructive' : 'outline'}
                                            className="text-[10px]"
                                        >
                                            {sale.status === 'pending' && 'Pendiente'}
                                            {sale.status === 'syncing' && 'Sincronizando...'}
                                            {sale.status === 'failed' && 'Fallido'}
                                            {sale.status === 'synced' && 'Sincronizado'}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {new Date(sale.createdAt).toLocaleString('es-AR')}
                                    </div>
                                    {sale.lastError && (
                                        <div className="text-xs text-red-600 mt-1 truncate">
                                            Error: {sale.lastError}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {pendingSales.length > 5 && (
                                <div className="p-2 text-xs text-center text-muted-foreground">
                                    +{pendingSales.length - 5} más
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sync Button */}
                    {isOnline && hasPending && (
                        <Button
                            onClick={handleForceSync}
                            disabled={isSyncing}
                            className="w-full"
                            size="sm"
                        >
                            {isSyncing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Sincronizando...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Sincronizar ahora
                                </>
                            )}
                        </Button>
                    )}

                    {/* Offline Message */}
                    {!isOnline && (
                        <p className="text-xs text-muted-foreground">
                            Las ventas se guardarán localmente y se sincronizarán cuando vuelva la conexión.
                        </p>
                    )}

                    {/* All Synced Message */}
                    {isOnline && !hasPending && !isSyncing && (
                        <div className="flex items-center gap-2 text-green-600">
                            <Check className="h-4 w-4" />
                            <span className="text-sm">Todo sincronizado</span>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
