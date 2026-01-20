/**
 * Appwrite Setup Script
 * 
 * Creates the database and collection needed for logging.
 * Run this once after configuring Appwrite credentials.
 * 
 * Usage: npx tsx scripts/setup-appwrite.ts
 */

import { Client, Databases, ID } from 'node-appwrite'

// Load environment variables
import 'dotenv/config'

const ENDPOINT = process.env.APPWRITE_ENDPOINT || ''
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || ''
const API_KEY = process.env.APPWRITE_API_KEY || ''
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'stockcito'
const LOGS_COLLECTION_ID = process.env.APPWRITE_LOGS_COLLECTION_ID || 'logs'

async function main() {
    console.log('🚀 Starting Appwrite setup...\n')

    // Validate configuration
    if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
        console.error('❌ Missing configuration! Set these environment variables:')
        console.error('   - APPWRITE_ENDPOINT')
        console.error('   - APPWRITE_PROJECT_ID')
        console.error('   - APPWRITE_API_KEY')
        process.exit(1)
    }

    console.log(`📡 Connecting to: ${ENDPOINT}`)
    console.log(`📁 Project: ${PROJECT_ID}\n`)

    // Initialize client
    const client = new Client()
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID)
        .setKey(API_KEY)

    const databases = new Databases(client)

    try {
        // 1. Create database (if not exists)
        console.log(`📦 Creating database: ${DATABASE_ID}...`)
        try {
            await databases.create(DATABASE_ID, 'Stockcito')
            console.log('   ✅ Database created')
        } catch (error: any) {
            if (error.code === 409) {
                console.log('   ℹ️  Database already exists')
            } else {
                throw error
            }
        }

        // 2. Create logs collection
        console.log(`📋 Creating logs collection: ${LOGS_COLLECTION_ID}...`)
        try {
            await databases.createCollection(
                DATABASE_ID,
                LOGS_COLLECTION_ID,
                'Application Logs',
                [
                    // Anyone can read logs (for dashboard), only server can write
                    // You can make this more restrictive if needed
                ]
            )
            console.log('   ✅ Collection created')
        } catch (error: any) {
            if (error.code === 409) {
                console.log('   ℹ️  Collection already exists')
            } else {
                throw error
            }
        }

        // 3. Create attributes
        console.log('📝 Creating collection attributes...')

        const attributes = [
            { key: 'level', type: 'string', size: 10, required: true },
            { key: 'message', type: 'string', size: 1000, required: true },
            { key: 'module', type: 'string', size: 50, required: false },
            { key: 'userId', type: 'string', size: 20, required: false },
            { key: 'organizationId', type: 'string', size: 20, required: false },
            { key: 'action', type: 'string', size: 100, required: false },
            { key: 'entity', type: 'string', size: 50, required: false },
            { key: 'entityId', type: 'string', size: 50, required: false },
            { key: 'errorMessage', type: 'string', size: 500, required: false },
            { key: 'errorStack', type: 'string', size: 2000, required: false },
            { key: 'metadata', type: 'string', size: 5000, required: false },
            { key: 'userAgent', type: 'string', size: 500, required: false },
            { key: 'ip', type: 'string', size: 50, required: false },
            { key: 'url', type: 'string', size: 500, required: false },
            { key: 'timestamp', type: 'string', size: 30, required: true },
            { key: 'environment', type: 'string', size: 20, required: true },
        ]

        for (const attr of attributes) {
            try {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    LOGS_COLLECTION_ID,
                    attr.key,
                    attr.size,
                    attr.required
                )
                console.log(`   ✅ Created attribute: ${attr.key}`)
            } catch (error: any) {
                if (error.code === 409) {
                    console.log(`   ℹ️  Attribute already exists: ${attr.key}`)
                } else {
                    console.error(`   ❌ Failed to create ${attr.key}:`, error.message)
                }
            }
        }

        // 4. Create indexes for common queries
        console.log('🔍 Creating indexes...')

        const indexes = [
            { key: 'level_idx', attributes: ['level'] },
            { key: 'module_idx', attributes: ['module'] },
            { key: 'timestamp_idx', attributes: ['timestamp'] },
            { key: 'org_idx', attributes: ['organizationId'] },
            { key: 'level_timestamp_idx', attributes: ['level', 'timestamp'] },
        ]

        for (const idx of indexes) {
            try {
                await databases.createIndex(
                    DATABASE_ID,
                    LOGS_COLLECTION_ID,
                    idx.key,
                    'key' as any, // IndexType.Key
                    idx.attributes
                )
                console.log(`   ✅ Created index: ${idx.key}`)
            } catch (error: any) {
                if (error.code === 409) {
                    console.log(`   ℹ️  Index already exists: ${idx.key}`)
                } else {
                    console.error(`   ❌ Failed to create ${idx.key}:`, error.message)
                }
            }
        }

        console.log('\n✨ Appwrite setup complete!')
        console.log('\n📋 Next steps:')
        console.log('   1. Add these to your .env:')
        console.log(`      APPWRITE_ENDPOINT="${ENDPOINT}"`)
        console.log(`      APPWRITE_PROJECT_ID="${PROJECT_ID}"`)
        console.log(`      APPWRITE_API_KEY="<your-api-key>"`)
        console.log(`      APPWRITE_DATABASE_ID="${DATABASE_ID}"`)
        console.log(`      APPWRITE_LOGS_COLLECTION_ID="${LOGS_COLLECTION_ID}"`)
        console.log('   2. Restart your application')
        console.log('   3. Logs will now be sent to Appwrite!\n')

    } catch (error) {
        console.error('\n❌ Setup failed:', error)
        process.exit(1)
    }
}

main()
