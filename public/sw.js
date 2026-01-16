const CACHE_NAME = 'stockcito-v1';
const STATIC_CACHE = 'stockcito-static-v1';
const DYNAMIC_CACHE = 'stockcito-dynamic-v1';
const OFFLINE_SALES_STORE = 'stockcito-offline-sales';
const DB_NAME = 'stockcito-offline';
const DB_VERSION = 1;

// Resources to cache immediately
const STATIC_ASSETS = [
    '/',
    '/dashboard',
    '/sales/new',
    '/inventory',
    '/offline',
    '/manifest.json'
];

// IndexedDB helper functions for offline sales
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create store for offline sales
            if (!db.objectStoreNames.contains('offlineSales')) {
                const store = db.createObjectStore('offlineSales', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                store.createIndex('status', 'status', { unique: false });
                store.createIndex('createdAt', 'createdAt', { unique: false });
            }
            
            // Create store for sync queue
            if (!db.objectStoreNames.contains('syncQueue')) {
                const syncStore = db.createObjectStore('syncQueue', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                syncStore.createIndex('type', 'type', { unique: false });
                syncStore.createIndex('status', 'status', { unique: false });
            }
        };
    });
}

async function saveOfflineSale(saleData) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['offlineSales'], 'readwrite');
        const store = transaction.objectStore('offlineSales');
        
        const sale = {
            ...saleData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            syncAttempts: 0
        };
        
        const request = store.add(sale);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getPendingOfflineSales() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['offlineSales'], 'readonly');
        const store = transaction.objectStore('offlineSales');
        const index = store.index('status');
        const request = index.getAll('pending');
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function markSaleAsSynced(id) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['offlineSales'], 'readwrite');
        const store = transaction.objectStore('offlineSales');
        
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
            const sale = getRequest.result;
            if (sale) {
                sale.status = 'synced';
                sale.syncedAt = new Date().toISOString();
                const updateRequest = store.put(sale);
                updateRequest.onsuccess = () => resolve(true);
                updateRequest.onerror = () => reject(updateRequest.error);
            } else {
                resolve(false);
            }
        };
        getRequest.onerror = () => reject(getRequest.error);
    });
}

async function markSaleAsFailed(id, error) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['offlineSales'], 'readwrite');
        const store = transaction.objectStore('offlineSales');
        
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
            const sale = getRequest.result;
            if (sale) {
                sale.syncAttempts += 1;
                sale.lastError = error;
                sale.lastAttemptAt = new Date().toISOString();
                
                // Mark as failed after 5 attempts
                if (sale.syncAttempts >= 5) {
                    sale.status = 'failed';
                }
                
                const updateRequest = store.put(sale);
                updateRequest.onsuccess = () => resolve(true);
                updateRequest.onerror = () => reject(updateRequest.error);
            } else {
                resolve(false);
            }
        };
        getRequest.onerror = () => reject(getRequest.error);
    });
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip API and auth requests
    if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_next')) {
        return;
    }

    // Network first strategy for HTML pages
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone and cache successful responses
                    if (response.ok) {
                        const clonedResponse = response.clone();
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(request, clonedResponse);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cache, then offline page
                    return caches.match(request).then((cachedResponse) => {
                        return cachedResponse || caches.match('/offline');
                    });
                })
        );
        return;
    }

    // Cache first for static assets
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return cached version, but fetch new version in background
                fetch(request).then((response) => {
                    if (response.ok) {
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(request, response);
                        });
                    }
                });
                return cachedResponse;
            }

            // Not in cache, fetch from network
            return fetch(request).then((response) => {
                if (response.ok) {
                    const clonedResponse = response.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(request, clonedResponse);
                    });
                }
                return response;
            });
        })
    );
});

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
    const data = event.data?.json() || {};
    const title = data.title || 'Stockcito';
    const options = {
        body: data.body || 'Tienes una nueva notificación',
        icon: '/icons/icon.svg',
        badge: '/icons/icon.svg',
        vibrate: [100, 50, 100],
        data: data.url || '/dashboard',
        actions: [
            { action: 'open', title: 'Abrir' },
            { action: 'close', title: 'Cerrar' }
        ]
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // If app is already open, focus it
            for (const client of clientList) {
                if (client.url === event.notification.data && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open new window
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data);
            }
        })
    );
});

// Background sync for offline sales
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-sales') {
        event.waitUntil(syncOfflineSales());
    }
});

async function syncOfflineSales() {
    console.log('[SW] Starting offline sales sync...');
    
    try {
        const pendingSales = await getPendingOfflineSales();
        
        if (pendingSales.length === 0) {
            console.log('[SW] No pending sales to sync');
            return;
        }
        
        console.log(`[SW] Found ${pendingSales.length} pending sales to sync`);
        
        for (const sale of pendingSales) {
            try {
                // Attempt to sync the sale with the server
                const response = await fetch('/api/sales/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        offlineSaleId: sale.id,
                        items: sale.items,
                        clientId: sale.clientId,
                        paymentMethod: sale.paymentMethod,
                        paymentDetails: sale.paymentDetails,
                        discount: sale.discount,
                        notes: sale.notes,
                        createdAt: sale.createdAt,
                        isOffline: true
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    await markSaleAsSynced(sale.id);
                    console.log(`[SW] Sale ${sale.id} synced successfully, server ID: ${result.saleId}`);
                    
                    // Notify the client about successful sync
                    const clients = await self.clients.matchAll();
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'SALE_SYNCED',
                            offlineSaleId: sale.id,
                            serverSaleId: result.saleId
                        });
                    });
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.error || `HTTP ${response.status}`;
                    await markSaleAsFailed(sale.id, errorMessage);
                    console.error(`[SW] Failed to sync sale ${sale.id}:`, errorMessage);
                }
            } catch (error) {
                await markSaleAsFailed(sale.id, error.message);
                console.error(`[SW] Error syncing sale ${sale.id}:`, error);
            }
        }
        
        // Notify clients about sync completion
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_COMPLETE',
                syncedCount: pendingSales.length
            });
        });
        
        console.log('[SW] Offline sales sync completed');
    } catch (error) {
        console.error('[SW] Error during offline sales sync:', error);
    }
}

// Listen for messages from the main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SAVE_OFFLINE_SALE') {
        event.waitUntil(
            saveOfflineSale(event.data.sale)
                .then((id) => {
                    // Respond to the client
                    event.source.postMessage({
                        type: 'OFFLINE_SALE_SAVED',
                        id: id,
                        success: true
                    });
                    
                    // Register for background sync
                    return self.registration.sync.register('sync-sales');
                })
                .catch((error) => {
                    event.source.postMessage({
                        type: 'OFFLINE_SALE_SAVED',
                        success: false,
                        error: error.message
                    });
                })
        );
    }
    
    if (event.data && event.data.type === 'GET_PENDING_SALES') {
        event.waitUntil(
            getPendingOfflineSales()
                .then((sales) => {
                    event.source.postMessage({
                        type: 'PENDING_SALES',
                        sales: sales
                    });
                })
        );
    }
    
    if (event.data && event.data.type === 'FORCE_SYNC') {
        event.waitUntil(syncOfflineSales());
    }
});
