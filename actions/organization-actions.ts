"use server"
import { logError } from '@/lib/logger'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { requireAuth, requireRole } from './auth-actions'
import { z } from 'zod'
import { sanitizeString, sanitizeEmail, sanitizePhone, sanitizeTaxId } from '@/lib/security/sanitizer'

const organizationSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
})

export type OrganizationData = z.infer<typeof organizationSchema>

// Get current user's organization
export async function getCurrentOrganization() {
  const session = await requireAuth()
  
  const user = await db.user.findUnique({
    where: { id: session.id },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          email: true,
          phone: true,
          address: true,
          taxId: true,
          logo: true,
          plan: true,
          planStatus: true,
          theme: true,
          trialEndsAt: true,
          subscriptionEndsAt: true,
          createdAt: true,
          _count: {
            select: {
              users: true,
              products: true,
              clients: true,
              sales: true
            }
          }
        }
      }
    }
  })

  return user?.organization || null
}

// Update organization settings
export async function updateOrganization(data: OrganizationData): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireRole(['admin'])
    
    const user = await db.user.findUnique({
      where: { id: session.id },
      select: { organizationId: true }
    })

    if (!user?.organizationId) {
      return { success: false, error: 'Usuario sin organización' }
    }

    const result = organizationSchema.safeParse(data)
    if (!result.success) {
      return { success: false, error: Object.values(result.error.flatten().fieldErrors).flat()[0] }
    }

    // Sanitize inputs
    const sanitized = {
      name: sanitizeString(result.data.name),
      email: sanitizeEmail(result.data.email),
      phone: result.data.phone ? sanitizePhone(result.data.phone) : null,
      address: result.data.address ? sanitizeString(result.data.address) : null,
      taxId: result.data.taxId ? sanitizeTaxId(result.data.taxId) : null,
    }

    // Check if email is taken by another org
    const existingOrg = await db.organization.findFirst({
      where: {
        email: sanitized.email,
        NOT: { id: user.organizationId }
      }
    })

    if (existingOrg) {
      return { success: false, error: 'El email ya está en uso por otra organización' }
    }

    await db.organization.update({
      where: { id: user.organizationId },
      data: sanitized
    })

    revalidatePath('/organization')
    revalidatePath('/profile')
    
    return { success: true }
  } catch (error) {
    logError('Update organization error:', error)
    return { success: false, error: 'Error al actualizar la organización' }
  }
}

// Update organization theme
export async function updateOrganizationTheme(theme: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireAuth()
    
    const user = await db.user.findUnique({
      where: { id: session.id },
      include: { organization: true }
    })

    if (!user?.organization) {
      return { success: false, error: 'Usuario sin organización' }
    }

    // Check if premium feature
    const isPremium = user.organization.plan === 'premium' || user.organization.planStatus === 'trial'
    if (!isPremium && theme !== 'default') {
      return { success: false, error: 'Los temas personalizados son una función Premium' }
    }

    const validThemes = ['default', 'blue', 'green', 'orange', 'red']
    if (!validThemes.includes(theme)) {
      return { success: false, error: 'Tema inválido' }
    }

    await db.organization.update({
      where: { id: user.organization.id },
      data: { theme }
    })

    revalidatePath('/')
    
    return { success: true }
  } catch (error) {
    logError('Update theme error:', error)
    return { success: false, error: 'Error al actualizar el tema' }
  }
}

// Get organization stats
export async function getOrganizationStats() {
  const session = await requireAuth()
  
  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { organizationId: true }
  })

  if (!user?.organizationId) {
    return null
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    totalProducts,
    totalClients,
    totalUsers,
    salesThisMonth,
    salesLastMonth,
    revenueThisMonth,
    revenueLastMonth
  ] = await Promise.all([
    db.product.count({ where: { organizationId: user.organizationId } }),
    db.client.count({ where: { organizationId: user.organizationId } }),
    db.user.count({ where: { organizationId: user.organizationId, active: true } }),
    db.sale.count({
      where: {
        organizationId: user.organizationId,
        createdAt: { gte: startOfMonth },
        status: 'completed'
      }
    }),
    db.sale.count({
      where: {
        organizationId: user.organizationId,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        status: 'completed'
      }
    }),
    db.sale.aggregate({
      where: {
        organizationId: user.organizationId,
        createdAt: { gte: startOfMonth },
        status: 'completed'
      },
      _sum: { total: true }
    }),
    db.sale.aggregate({
      where: {
        organizationId: user.organizationId,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        status: 'completed'
      },
      _sum: { total: true }
    })
  ])

  return {
    totalProducts,
    totalClients,
    totalUsers,
    salesThisMonth,
    salesLastMonth,
    revenueThisMonth: Number(revenueThisMonth._sum.total || 0),
    revenueLastMonth: Number(revenueLastMonth._sum.total || 0),
    salesGrowth: salesLastMonth > 0 
      ? Math.round(((salesThisMonth - salesLastMonth) / salesLastMonth) * 100)
      : 0,
    revenueGrowth: Number(revenueLastMonth._sum.total || 0) > 0
      ? Math.round(((Number(revenueThisMonth._sum.total || 0) - Number(revenueLastMonth._sum.total || 0)) / Number(revenueLastMonth._sum.total || 1)) * 100)
      : 0
  }
}
