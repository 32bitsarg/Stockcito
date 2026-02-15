"use client"

import { useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query"
import { useNetworkStatus } from "@/lib/offline-sync"

/**
 * Hook genérico para datos offline-first con seguridad.
 * 
 * SEGURIDAD:
 * - Los datos se cachean scopeados a la queryKey (que incluye el contexto de sesión del server action).
 * - Los server actions ya validan organizationId internamente, así que el caché
 *   solo contiene datos que el usuario tiene permiso de ver.
 * - El caché se limpia automáticamente al hacer logout (ver clearOfflineCache).
 * - No se cachean datos sensibles (contraseñas, tokens, etc.) ya que los server actions
 *   nunca los retornan.
 * 
 * @param queryKey - Clave única para identificar estos datos en el caché
 * @param fetcher - Función que obtiene los datos (generalmente un server action)
 * @param options - Opciones adicionales
 */
export function useOfflineData<T>(
    queryKey: QueryKey,
    fetcher: () => Promise<T>,
    options?: {
        staleTime?: number
        gcTime?: number
        enabled?: boolean
        /** Si es true, no intenta refetch cuando está offline */
        offlineFriendly?: boolean
    }
) {
    const isOnline = useNetworkStatus()

    const query = useQuery({
        queryKey,
        queryFn: fetcher,
        staleTime: options?.staleTime ?? 1000 * 60 * 5,       // 5 min como fresh
        gcTime: options?.gcTime ?? 1000 * 60 * 60 * 24,       // 24h en caché
        enabled: options?.enabled !== false,
        retry: isOnline ? 2 : 0,                               // No reintentar sin internet
        refetchOnWindowFocus: isOnline,                        // Solo refetch con internet
        refetchOnReconnect: true,                              // Refetch al volver online
        networkMode: 'offlineFirst',                           // Servir caché primero
    })

    // Determinar si los datos mostrados son del caché (offline)
    const isOfflineData = !isOnline && query.data !== undefined && !query.isFetching

    return {
        data: query.data as T | undefined,
        isLoading: query.isLoading,
        isError: query.isError && isOnline, // Solo mostrar error si estamos online
        error: query.error,
        isFetching: query.isFetching,
        isOfflineData,
        isOnline,
        refetch: query.refetch,
        /** Timestamp de cuándo se obtuvieron los datos */
        dataUpdatedAt: query.dataUpdatedAt,
    }
}

/**
 * SEGURIDAD: Limpia todo el caché offline al cerrar sesión.
 * Esto previene que un usuario diferente vea datos del usuario anterior
 * al iniciar sesión en la misma máquina.
 * 
 * Debe llamarse ANTES de borrar la cookie de sesión.
 */
export async function clearOfflineCache() {
    // Limpiar IndexedDB (idb-keyval store usado por TanStack Query persister)
    try {
        const { del } = await import('idb-keyval')
        await del('stockcito-offline-cache')
        await del('stockcito-last-sync')
    } catch (e) {
        console.error('Error limpiando caché offline:', e)
    }

    // Limpiar cola de mutaciones pendientes
    try {
        const { del } = await import('idb-keyval')
        await del('stockcito-offline-queue')
    } catch (e) {
        console.error('Error limpiando cola offline:', e)
    }
}

/**
 * Hook para limpiar caché desde un componente React.
 * Útil para el botón de logout.
 */
export function useClearCache() {
    const queryClient = useQueryClient()

    const clearAll = async () => {
        // 1. Limpiar caché en memoria de TanStack Query
        queryClient.clear()

        // 2. Limpiar almacenamiento persistido (IndexedDB)
        await clearOfflineCache()
    }

    return clearAll
}
