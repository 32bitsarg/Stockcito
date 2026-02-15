"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { get, set, del } from 'idb-keyval'
import { ReactNode, useState } from 'react'
import { isServer } from '@tanstack/react-query'

// Custom persister using idb-keyval for IndexedDB storage
// This allows us to store large datasets (products, clients) that localStorage can't handle
const createIDBPersister = (idbValidKey: IDBValidKey = "reactQuery") => {
    return {
        persistClient: async (client: any) => {
            await set(idbValidKey, client)
        },
        restoreClient: async () => {
            return await get<any>(idbValidKey)
        },
        removeClient: async () => {
            await del(idbValidKey)
        },
    } as const
}

// Create a client
function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Time until data is considered "stale" (needs refetching)
                // For offline-first, we want this high (e.g. 5 minutes) so it doesn't constantly fetch
                staleTime: 1000 * 60 * 5,
                // Time data stays in memory/cache before garbage collection
                // 24 hours to ensure it survives offline periods
                gcTime: 1000 * 60 * 60 * 24,
                refetchOnWindowFocus: false, // Don't refetch on focus to avoid jarring updates
                retry: 1,
            },
        },
    })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
    if (isServer) {
        // Server: always make a new query client
        return makeQueryClient()
    } else {
        // Browser: make a new query client if we don't already have one
        // This is very important, so we don't re-make a new client if React
        // suspends during the initial render. This may not be needed if we
        // have a suspense boundary BELOW the creation of the query client
        if (!browserQueryClient) browserQueryClient = makeQueryClient()
        return browserQueryClient
    }
}

export default function QueryProvider({ children }: { children: ReactNode }) {
    // NOTE: We avoid useState for the client initialization in the new App Router pattern
    // to prevent hydration mismatches, but PersistQueryClientProvider handles its own state.
    const queryClient = getQueryClient()
    const [persister] = useState(() => {
        if (typeof window !== 'undefined') {
            return createIDBPersister('stockcito-offline-cache')
        }
        return undefined
    })

    if (!persister) {
        // Fallback for SSR
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )
    }

    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister }}
        >
            {children}
        </PersistQueryClientProvider>
    )
}
