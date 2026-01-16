import { PrismaClient } from '@prisma/client'
import * as argon2 from 'argon2'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create default organization for existing data
  const defaultOrg = await prisma.organization.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Mi Negocio',
      slug: 'mi-negocio',
      email: 'admin@stockcito.com',
      businessCode: 'MNG-0001-AA',
      plan: 'premium', // Give premium for trial
      planStatus: 'trialing',
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    }
  })

  console.log(`✅ Created/updated default organization: ${defaultOrg.name}`)

  // Check if admin user exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'admin' }
  })

  if (!existingAdmin) {
    // Create default admin user
    const hashedPassword = await argon2.hash('admin123')
    
    const adminUser = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@stockcito.com',
        password: hashedPassword,
        role: 'admin',
        organizationId: defaultOrg.id
      }
    })
    
    console.log(`✅ Created admin user: ${adminUser.email}`)
    console.log('   Password: admin123 (change this immediately!)')
  } else {
    // Update existing admin to have organization
    if (!existingAdmin.organizationId) {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { organizationId: defaultOrg.id }
      })
      console.log(`✅ Updated existing admin with organization`)
    }
  }

  // Update all existing records to have the default organization
  const tables = [
    'Product',
    'Category', 
    'Client',
    'Supplier',
    'Sale',
    'Discount',
    'Invoice',
    'CreditNote',
    'AuditLog'
  ]

  for (const table of tables) {
    try {
      // @ts-ignore - dynamic table access
      const updated = await prisma[table.toLowerCase()].updateMany({
        where: { organizationId: null },
        data: { organizationId: defaultOrg.id }
      })
      
      if (updated.count > 0) {
        console.log(`✅ Updated ${updated.count} ${table} records with organizationId`)
      }
    } catch (error) {
      // Table might not exist or not have the column yet
      console.log(`⚠️ Could not update ${table}: might not exist yet`)
    }
  }

  // Update all users to have the default organization
  const updatedUsers = await prisma.user.updateMany({
    where: { organizationId: null },
    data: { organizationId: defaultOrg.id }
  })

  if (updatedUsers.count > 0) {
    console.log(`✅ Updated ${updatedUsers.count} User records with organizationId`)
  }

  console.log('')
  console.log('🎉 Seed completed successfully!')
  console.log('')
  console.log('Next steps:')
  console.log('1. Set your MercadoPago credentials in .env:')
  console.log('   MERCADOPAGO_ACCESS_TOKEN=your_access_token')
  console.log('   NEXT_PUBLIC_APP_URL=http://localhost:3000')
  console.log('')
  console.log('2. Run the app: npm run dev')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
