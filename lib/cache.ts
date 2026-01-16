// Server-side caching utilities using Next.js unstable_cache
// and simple in-memory cache for frequently accessed data

import { unstable_cache } from "next/cache"
import { db } from "@/lib/db"

// Cache durations in seconds
export const CACHE_DURATIONS = {
  SHORT: 30,      // 30 seconds - for frequently changing data
  MEDIUM: 300,    // 5 minutes - for semi-static data
  LONG: 3600,     // 1 hour - for rarely changing data
  DAY: 86400,     // 24 hours - for static data
}

// Cache tags for invalidation
export const CACHE_TAGS = {
  PRODUCTS: "products",
  CATEGORIES: "categories",
  CLIENTS: "clients",
  SALES: "sales",
  DASHBOARD: "dashboard",
  PERMISSIONS: "permissions",
} as const

/**
 * Get categories with caching
 */
export const getCachedCategories = unstable_cache(
  async (organizationId: number) => {
    return db.category.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
    })
  },
  ["categories"],
  {
    revalidate: CACHE_DURATIONS.LONG,
    tags: [CACHE_TAGS.CATEGORIES],
  }
)

/**
 * Get products list with caching (for dropdowns, selects, etc.)
 */
export const getCachedProductsList = unstable_cache(
  async (organizationId: number) => {
    return db.product.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        stock: true,
        categoryId: true,
      },
      orderBy: { name: "asc" },
    })
  },
  ["products-list"],
  {
    revalidate: CACHE_DURATIONS.MEDIUM,
    tags: [CACHE_TAGS.PRODUCTS],
  }
)

/**
 * Get suppliers list with caching
 */
export const getCachedSuppliers = unstable_cache(
  async (organizationId: number) => {
    return db.supplier.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
      orderBy: { name: "asc" },
    })
  },
  ["suppliers"],
  {
    revalidate: CACHE_DURATIONS.LONG,
    tags: ["suppliers"],
  }
)

/**
 * Get organization settings with caching
 */
export const getCachedOrgSettings = unstable_cache(
  async (organizationId: number) => {
    return db.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        planStatus: true,
        theme: true,
        settings: true,
        taxId: true,
      },
    })
  },
  ["org-settings"],
  {
    revalidate: CACHE_DURATIONS.MEDIUM,
    tags: ["organization"],
  }
)

// Simple in-memory cache for very frequent access (permissions, roles)
const memoryCache = new Map<string, { data: any; expires: number }>()

/**
 * Get from memory cache or fetch
 */
export function getFromMemoryCache<T>(
  key: string,
  fetcher: () => T | Promise<T>,
  ttlSeconds: number = 60
): T | Promise<T> {
  const cached = memoryCache.get(key)
  const now = Date.now()

  if (cached && cached.expires > now) {
    return cached.data as T
  }

  const result = fetcher()

  if (result instanceof Promise) {
    return result.then((data) => {
      memoryCache.set(key, { data, expires: now + ttlSeconds * 1000 })
      return data
    })
  }

  memoryCache.set(key, { data: result, expires: now + ttlSeconds * 1000 })
  return result
}

/**
 * Invalidate memory cache entries by prefix
 */
export function invalidateMemoryCache(prefix: string): void {
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key)
    }
  }
}

/**
 * Clear entire memory cache
 */
export function clearMemoryCache(): void {
  memoryCache.clear()
}

// Periodically clean expired entries from memory cache
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of memoryCache.entries()) {
    if (value.expires < now) {
      memoryCache.delete(key)
    }
  }
}, 60000) // Every minute
