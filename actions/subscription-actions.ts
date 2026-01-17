"use server"
import { logError } from '@/lib/logger'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { requireAuth } from './auth-actions'
import {
  getSubscriptionStatus,
  getCurrentUsage,
  checkLimit,
  checkFeatureAccess,
  startTrial,
  cancelSubscription,
  PlanType,
  PlanFeature,
  PLANS,
  formatPrice,
  formatLimit,
  PLAN_LIMITS
} from '@/lib/subscription'

export interface SubscriptionInfo {
  plan: PlanType
  planStatus: string
  isTrialing: boolean
  isPremium: boolean
  isFree: boolean
  trialDaysRemaining: number | null
  subscriptionDaysRemaining: number | null
  canUpgrade: boolean
  usage: {
    products: { current: number; limit: number; percentage: number }
    clients: { current: number; limit: number; percentage: number }
    users: { current: number; limit: number; percentage: number }
    invoices: { current: number; limit: number; percentage: number }
  }
  organization: {
    id: number
    name: string
    email: string
  }
}

// Get current subscription info with usage
export async function getSubscriptionInfo(): Promise<SubscriptionInfo | null> {
  const session = await requireAuth()

  const user = await db.user.findUnique({
    where: { id: session.id },
    include: { organization: true }
  })

  if (!user?.organization) {
    return null
  }

  const org = user.organization
  const status = await getSubscriptionStatus(org.id)
  const usage = await getCurrentUsage(org.id)

  if (!status) return null

  const limits = PLAN_LIMITS[status.plan]

  const getPercentage = (current: number, limit: number) => {
    if (limit === -1) return 0
    return Math.min(100, Math.round((current / limit) * 100))
  }

  return {
    ...status,
    usage: {
      products: {
        current: usage.productsCount,
        limit: limits.maxProducts,
        percentage: getPercentage(usage.productsCount, limits.maxProducts)
      },
      clients: {
        current: usage.clientsCount,
        limit: limits.maxClients,
        percentage: getPercentage(usage.clientsCount, limits.maxClients)
      },
      users: {
        current: usage.usersCount,
        limit: limits.maxUsers,
        percentage: getPercentage(usage.usersCount, limits.maxUsers)
      },
      invoices: {
        current: usage.invoicesThisMonth,
        limit: limits.maxInvoicesPerMonth,
        percentage: getPercentage(usage.invoicesThisMonth, limits.maxInvoicesPerMonth)
      }
    },
    organization: {
      id: org.id,
      name: org.name,
      email: org.email
    }
  }
}

// Get available plans with formatted prices
export async function getAvailablePlans() {
  return PLANS.map(plan => ({
    ...plan,
    formattedPrice: formatPrice(plan.price, plan.currency),
    formattedPriceYearly: formatPrice(plan.priceYearly, plan.currency),
    limits: {
      products: formatLimit(plan.limits.maxProducts),
      clients: formatLimit(plan.limits.maxClients),
      users: formatLimit(plan.limits.maxUsers),
      invoices: formatLimit(plan.limits.maxInvoicesPerMonth),
      reportDays: plan.limits.reportDaysLimit === -1 ? 'Histórico completo' : `Últimos ${plan.limits.reportDaysLimit} días`
    }
  }))
}

// Check if user can perform action (limit check)
export async function canPerformAction(
  limitType: 'products' | 'clients' | 'users' | 'invoices' | 'creditNotes'
): Promise<{ allowed: boolean; message?: string }> {
  const session = await requireAuth()

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { organizationId: true }
  })

  if (!user?.organizationId) {
    return { allowed: false, message: 'Usuario sin organización' }
  }

  const result = await checkLimit(user.organizationId, limitType)
  return { allowed: result.allowed, message: result.message }
}

// Check if user has access to a feature
export async function hasFeatureAccess(feature: PlanFeature): Promise<boolean> {
  const session = await requireAuth()

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { organizationId: true }
  })

  if (!user?.organizationId) {
    return false
  }

  const result = await checkFeatureAccess(user.organizationId, feature)
  return result.allowed
}

// Cancel subscription
export async function cancelUserSubscription(): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireAuth()

    const user = await db.user.findUnique({
      where: { id: session.id },
      include: { organization: true }
    })

    if (!user?.organization) {
      return { success: false, error: 'Usuario sin organización' }
    }

    // Only admin can cancel
    if (session.role !== 'admin') {
      return { success: false, error: 'Solo el administrador puede cancelar la suscripción' }
    }

    await cancelSubscription(user.organization.id)
    revalidatePath('/subscription')

    return { success: true }
  } catch (error) {
    logError('Cancel subscription error:', error)
    return { success: false, error: 'Error al cancelar la suscripción' }
  }
}

// Get subscription logs
export async function getSubscriptionLogs(limit: number = 20) {
  const session = await requireAuth()

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { organizationId: true, role: true }
  })

  if (!user?.organizationId || user.role !== 'admin') {
    return []
  }

  return db.subscriptionLog.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
}

// Start trial (for new organizations)
export async function startFreeTrial(): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireAuth()

    const user = await db.user.findUnique({
      where: { id: session.id },
      include: { organization: true }
    })

    if (!user?.organization) {
      return { success: false, error: 'Usuario sin organización' }
    }

    // Check if already had trial
    if (user.organization.trialStartedAt) {
      return { success: false, error: 'Ya utilizaste el período de prueba' }
    }

    await startTrial(user.organization.id)
    revalidatePath('/subscription')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    logError('Start trial error:', error)
    return { success: false, error: 'Error al iniciar el período de prueba' }
  }
}

// Get trial days remaining (for sidebar display)
export async function getTrialDaysRemaining(): Promise<number | null> {
  try {
    const session = await requireAuth()

    const user = await db.user.findUnique({
      where: { id: session.id },
      include: {
        organization: {
          select: {
            planStatus: true,
            trialEndsAt: true
          }
        }
      }
    })

    if (!user?.organization) {
      return null
    }

    const org = user.organization

    if (org.planStatus !== 'trial' || !org.trialEndsAt) {
      return null
    }

    const now = new Date()
    const diff = new Date(org.trialEndsAt).getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  } catch {
    return null
  }
}
