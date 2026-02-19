"use client"

import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query"
import { useNetworkStatus } from "@/lib/offline-sync"

interface UseOfflineMutationOptions<TData, TVariables> {
    /** La función que realiza la mutación (Server Action) */
    mutationFn: (variables: TVariables) => Promise<TData>

    /** 
     * Las claves de consulta (QueryKeys) a invalidar automáticamente cuando 
     * la mutación sea exitosa. Ej: [['suppliers'], ['dashboard']]
     */
    invalidateQueries?: string[][]

    /** Callbacks opcionales */
    onSuccess?: (data: TData, variables: TVariables, context: unknown) => Promise<unknown> | void
    onError?: (error: Error, variables: TVariables, context: unknown) => Promise<unknown> | void
    onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables, context: unknown) => Promise<unknown> | void
    onMutate?: (variables: TVariables) => Promise<unknown> | unknown
}

export function useOfflineMutation<TData, TVariables>({
    mutationFn,
    invalidateQueries = [],
    onSuccess,
    onError,
    onSettled,
    onMutate
}: UseOfflineMutationOptions<TData, TVariables>) {
    const queryClient = useQueryClient()
    const isOnline = useNetworkStatus()

    return useMutation<TData, Error, TVariables, unknown>({
        mutationFn,
        // CRÍTICO: 'offlineFirst' encola la mutación en IndexedDB si no hay red
        networkMode: 'offlineFirst',

        onMutate,

        onSuccess: async (data, variables, context) => {
            // Nota: Para Server Actions que devuelven { error: string }, 
            // la mutación se considera "exitosa" por React Query porque la 
            // promesa se resuelve. Se debe verificar si hay data.error en el 
            // onSuccess del componente para evitar invalidar cuando hay error de negocio.

            // Si obtenemos un resultado con .error explicito del Server Action,
            // no invalidamos (fue un rechazo lógico, ej: CUIT duplicado).
            const hasBusinessError = data && typeof data === 'object' && 'error' in data

            if (!hasBusinessError && invalidateQueries.length > 0) {
                // Invalidar todas las claves solicitadas para limpiar el caché offline
                await Promise.all(
                    invalidateQueries.map(queryKey =>
                        queryClient.invalidateQueries({ queryKey })
                    )
                )
            }

            if (onSuccess) {
                await onSuccess(data, variables, context)
            }
        },
        onError,
        onSettled
    })
}
