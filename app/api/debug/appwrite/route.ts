import { NextRequest, NextResponse } from 'next/server'
import { isAppwriteConfigured, getAppwriteDatabases, APPWRITE_DATABASE_ID, APPWRITE_LOGS_COLLECTION_ID, ID } from '@/lib/appwrite'

// Test endpoint to verify Appwrite connection
// GET /api/debug/appwrite
export async function GET(request: NextRequest) {
    // Only allow in development or with secret header
    const authHeader = request.headers.get('x-debug-secret')
    const isDev = process.env.NODE_ENV !== 'production'
    const expectedSecret = process.env.DEBUG_SECRET || 'stockcito-debug-2026'

    if (!isDev && authHeader !== expectedSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    }

    // Check if Appwrite is configured
    results.isConfigured = isAppwriteConfigured()

    // Check environment variables (masked)
    results.envVars = {
        APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT ? `${process.env.APPWRITE_ENDPOINT.substring(0, 20)}...` : 'NOT SET',
        APPWRITE_PROJECT_ID: process.env.APPWRITE_PROJECT_ID ? `${process.env.APPWRITE_PROJECT_ID.substring(0, 10)}...` : 'NOT SET',
        APPWRITE_API_KEY: process.env.APPWRITE_API_KEY ? 'SET (hidden)' : 'NOT SET',
        APPWRITE_DATABASE_ID: APPWRITE_DATABASE_ID || 'NOT SET',
        APPWRITE_LOGS_COLLECTION_ID: APPWRITE_LOGS_COLLECTION_ID || 'NOT SET',
    }

    if (!isAppwriteConfigured()) {
        results.status = 'NOT_CONFIGURED'
        results.message = 'Appwrite environment variables are not set'
        return NextResponse.json(results, { status: 200 })
    }

    // Try to connect
    try {
        const databases = getAppwriteDatabases()

        // Try to create a test document
        const testDoc = await databases.createDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_LOGS_COLLECTION_ID,
            ID.unique(),
            {
                level: 'info',
                message: 'Test log from debug endpoint',
                module: 'Debug',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'unknown'
            }
        )

        results.status = 'SUCCESS'
        results.message = 'Successfully connected to Appwrite and created test document'
        results.testDocId = testDoc.$id

        // Clean up - delete the test document
        try {
            await databases.deleteDocument(
                APPWRITE_DATABASE_ID,
                APPWRITE_LOGS_COLLECTION_ID,
                testDoc.$id
            )
            results.cleanedUp = true
        } catch {
            results.cleanedUp = false
        }

        return NextResponse.json(results, { status: 200 })

    } catch (error) {
        results.status = 'ERROR'
        results.error = error instanceof Error ? {
            name: error.name,
            message: error.message,
            // Include more details for debugging
            stack: isDev ? error.stack : undefined
        } : String(error)

        return NextResponse.json(results, { status: 500 })
    }
}
