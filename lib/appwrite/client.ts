/**
 * Appwrite Client Configuration
 * 
 * Server-side client for logging and other backend operations.
 * Uses node-appwrite SDK for server-side operations.
 */

import { Client, Databases, ID, Query } from 'node-appwrite'

// Environment variables for Appwrite
// Support both NEXT_PUBLIC_ prefix (for shared config) and non-prefixed (server-only)
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || ''
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ''
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '' // API Key should NEVER have NEXT_PUBLIC_ prefix

// Database and Collection IDs for logging
export const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'stockcito'
export const APPWRITE_LOGS_COLLECTION_ID = process.env.APPWRITE_LOGS_COLLECTION_ID || 'logs'

// Check if Appwrite is configured
export function isAppwriteConfigured(): boolean {
    return !!(APPWRITE_ENDPOINT && APPWRITE_PROJECT_ID && APPWRITE_API_KEY)
}

// Create server-side Appwrite client
let clientInstance: Client | null = null

export function getAppwriteClient(): Client {
    if (!clientInstance) {
        if (!isAppwriteConfigured()) {
            throw new Error('Appwrite is not configured. Set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, and APPWRITE_API_KEY environment variables.')
        }

        clientInstance = new Client()
            .setEndpoint(APPWRITE_ENDPOINT)
            .setProject(APPWRITE_PROJECT_ID)
            .setKey(APPWRITE_API_KEY)
    }
    return clientInstance
}

// Get Databases service
export function getAppwriteDatabases(): Databases {
    return new Databases(getAppwriteClient())
}

// Re-export utilities
export { ID, Query }
