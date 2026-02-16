"use client"

import { useState, useEffect } from "react"
import { get, set, del } from "idb-keyval"
import { toast } from "sonner"
import { createSale } from "@/actions/sale-actions"
import { createClient } from "@/actions/client-actions"
import { updateProduct } from "@/actions/product-actions"

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

export type OfflineMutationType = 'CREATE_SALE' | 'UPDATE_STOCK' | 'CREATE_CLIENT'

export interface OfflineMutation {
    id: string
    type: OfflineMutationType
    payload: any
    createdAt: number
    status: 'pending' | 'syncing' | 'failed'
    retryCount: number
    error?: string
}

const OFFLINE_QUEUE_KEY = 'stockcito-offline-queue'
const LAST_SYNC_KEY = 'stockcito-last-sync'

// ----------------------------------------------------------------------
// HOOKS
// ----------------------------------------------------------------------

export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        if (typeof window === 'undefined') return

        // Real connectivity check - navigator.onLine is unreliable in Electron
        const checkConnectivity = async () => {
            if (!navigator.onLine) {
                setIsOnline(false)
                return
            }
            try {
                // Fetch our own server with a short timeout as a heartbeat
                const controller = new AbortController()
                const timeout = setTimeout(() => controller.abort(), 3000)
                await fetch('/api/sales/sync', {
                    method: 'HEAD',
                    signal: controller.signal,
                    cache: 'no-store'
                })
                clearTimeout(timeout)
                setIsOnline(true)
            } catch {
                setIsOnline(false)
            }
        }

        // Initial check
        checkConnectivity()

        // Heartbeat every 10 seconds
        const interval = setInterval(checkConnectivity, 10000)

        // Also respond to browser events immediately 
        const handleOnline = () => { checkConnectivity() }
        const handleOffline = () => { setIsOnline(false) }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            clearInterval(interval)
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return isOnline
}

// ----------------------------------------------------------------------
// UTILS
// ----------------------------------------------------------------------

export async function getOfflineMutations(): Promise<OfflineMutation[]> {
    return (await get<OfflineMutation[]>(OFFLINE_QUEUE_KEY)) || []
}

export async function saveOfflineMutation(type: OfflineMutationType, payload: any) {
    const queue = await getOfflineMutations()
    const newMutation: OfflineMutation = {
        id: crypto.randomUUID(),
        type,
        payload,
        createdAt: Date.now(),
        status: 'pending',
        retryCount: 0
    }

    await set(OFFLINE_QUEUE_KEY, [...queue, newMutation])
    return newMutation
}

export async function removeOfflineMutation(id: string) {
    const queue = await getOfflineMutations()
    await set(OFFLINE_QUEUE_KEY, queue.filter(m => m.id !== id))
}

// ----------------------------------------------------------------------
// LAST SYNC TIMESTAMP
// ----------------------------------------------------------------------

export async function getLastSyncTimestamp(): Promise<number | null> {
    return await get<number>(LAST_SYNC_KEY) || null
}

export async function clearLastSyncTimestamp(): Promise<void> {
    await del(LAST_SYNC_KEY)
}

// ----------------------------------------------------------------------
// SYNC ENGINE
// ----------------------------------------------------------------------

export async function syncOfflineMutations() {
    const queue = await getOfflineMutations()
    if (queue.length === 0) return { synced: 0, failed: 0, stockConflicts: 0 }

    let synced = 0
    let failed = 0
    let totalStockConflicts = 0

    // Process queue sequentially to maintain order
    for (const mutation of queue) {
        if (mutation.status === 'failed' && mutation.retryCount > 3) continue // Skip persistently failed items locally

        try {
            const result = await processMutation(mutation) as any
            await removeOfflineMutation(mutation.id)
            synced++

            // Track stock conflicts from sale syncs
            if (result?.stockConflicts?.length > 0) {
                totalStockConflicts += result.stockConflicts.length
            }
        } catch (error) {
            console.error(`Failed to sync mutation ${mutation.id}:`, error)
            failed++

            // Update mutation status/retry count
            const currentQueue = await getOfflineMutations()
            const updatedQueue = currentQueue.map(m =>
                m.id === mutation.id
                    ? { ...m, status: 'failed', retryCount: m.retryCount + 1, error: String(error) } as OfflineMutation
                    : m
            )
            await set(OFFLINE_QUEUE_KEY, updatedQueue)
        }
    }

    // Save last sync timestamp on successful sync
    if (synced > 0) {
        await set(LAST_SYNC_KEY, Date.now())
    }

    // Notify about stock conflicts if any
    if (totalStockConflicts > 0) {
        toast.warning("⚠️ Conflicto de stock detectado", {
            description: `${totalStockConflicts} producto(s) quedaron con stock negativo tras la sincronización. Revise las alertas en el Dashboard.`,
            duration: 8000
        })
    }

    return { synced, failed, stockConflicts: totalStockConflicts }
}

/**
 * Procesa una mutación pendiente llamando al server action correspondiente.
 * 
 * SEGURIDAD: Los server actions validan sesión y organizationId internamente,
 * por lo que un usuario no puede ejecutar mutaciones de otra organización.
 */
async function processMutation(mutation: OfflineMutation) {
    switch (mutation.type) {
        case 'CREATE_SALE': {
            const result = await createSale(mutation.payload)
            if (!result.success) {
                throw new Error(String(result.error))
            }
            return result
        }

        case 'CREATE_CLIENT': {
            const result = await createClient(mutation.payload)
            if ('error' in result && result.error) {
                throw new Error(typeof result.error === 'string' ? result.error : 'Error al crear cliente')
            }
            return result
        }

        case 'UPDATE_STOCK': {
            // payload: { productId: number, productData: ProductFormData }
            const { productId, productData } = mutation.payload
            const result = await updateProduct(productId, productData)
            if (result && 'error' in result && result.error) {
                throw new Error(typeof result.error === 'string' ? result.error : 'Error al actualizar stock')
            }
            return result
        }

        default:
            throw new Error(`Unknown mutation type: ${mutation.type}`)
    }
}
