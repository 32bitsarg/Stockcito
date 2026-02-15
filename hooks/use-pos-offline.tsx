"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getProducts } from "@/actions/product-actions"
import { getClientsAll } from "@/actions/client-actions"
import { saveOfflineMutation, useNetworkStatus } from "@/lib/offline-sync"
import { createSale } from "@/actions/sale-actions"
import { toast } from "sonner"

/**
 * Hook principal para el POS con soporte offline completo.
 * 
 * FUNCIONALIDAD:
 * - Cachea productos y clientes en IndexedDB para funcionar offline.
 * - Crea ventas online → si falla → guarda en cola offline.
 * - Optimistic Updates: al vender, decrementa stock local inmediatamente
 *   para que el siguiente cajero/venta vea el stock actualizado sin esperar sync.
 * 
 * SEGURIDAD:
 * - Los server actions validan session y organizationId internamente.
 * - No se cachean datos sensibles (contraseñas, tokens).
 * - El caché se limpia al cerrar sesión (clearOfflineCache en header/user-menu).
 */
export function usePOSOffline() {
    const isOnline = useNetworkStatus()
    const queryClient = useQueryClient()

    // Query for Products - caches indefinitely for offline use
    const productsQuery = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const data = await getProducts()
            return data
        },
        staleTime: 1000 * 60 * 5, // 5 minutes considered fresh
        gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24h
        networkMode: 'offlineFirst', // Serve cache first
    })

    // Query for Clients - caches indefinitely for offline use
    const clientsQuery = useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const data = await getClientsAll()
            return data
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 60 * 24,
        networkMode: 'offlineFirst',
    })

    /**
     * Actualización optimista del stock local.
     * 
     * Cuando se realiza una venta (online u offline), decrementamos
     * el stock en el caché de TanStack Query inmediatamente. Esto logra:
     * 1. El POS muestra el stock correcto sin esperar al servidor.
     * 2. Si otra venta ocurre antes del sync, ve el stock ya decrementado.
     * 3. Cuando se reconecta, el refetch trae el stock real del servidor.
     * 
     * @param items - Array de { productId, quantity } de la venta
     */
    const optimisticallyUpdateStock = (items: Array<{ productId: number; quantity: number }>) => {
        queryClient.setQueryData(['products'], (oldProducts: any[] | undefined) => {
            if (!oldProducts) return oldProducts

            return oldProducts.map((product: any) => {
                const soldItem = items.find(item => item.productId === product.id)
                if (soldItem) {
                    return {
                        ...product,
                        stock: Math.max(0, product.stock - soldItem.quantity)
                    }
                }
                return product
            })
        })
    }

    // Offline-aware Create Sale Wrapper
    const createSaleOfflineAware = async (saleData: any) => {
        // Extraer items para actualización optimista
        const saleItems = saleData.items?.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity
        })) || []

        if (isOnline) {
            try {
                const result = await createSale(saleData)
                if (!result.success) throw new Error(String(result.error))

                // Actualización optimista del stock local tras venta exitosa
                optimisticallyUpdateStock(saleItems)

                return { success: true, mode: 'online', data: result }
            } catch (error) {
                console.error("Online sale failed, falling back to offline queue:", error)
                // Fallthrough to offline handling if online request fails unexpectedly
                toast.warning("Error de conexión. Guardando venta localmente.")
            }
        }

        // Offline Handling
        try {
            await saveOfflineMutation('CREATE_SALE', saleData)

            // Actualización optimista del stock incluso en modo offline
            // Para que las siguientes ventas vean el stock decrementado
            optimisticallyUpdateStock(saleItems)

            return { success: true, mode: 'offline', data: { sale: { id: 'temp-' + Date.now() } } }
        } catch (error) {
            console.error("Offline save failed:", error)
            return { success: false, error }
        }
    }

    return {
        products: productsQuery.data || [],
        clients: clientsQuery.data || [],
        isLoading: productsQuery.isLoading || clientsQuery.isLoading,
        isError: productsQuery.isError || clientsQuery.isError,
        isOnline,
        createSale: createSaleOfflineAware,
        refetchProducts: productsQuery.refetch,
        refetchClients: clientsQuery.refetch
    }
}
