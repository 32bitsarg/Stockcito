import { db } from '@/lib/db'
import { PLAN_LIMITS, PlanType, PlanFeature, hasFeature, isUnlimited } from './plans'

export interface UsageData {
  productsCount: number
  clientsCount: number
  usersCount: number
  invoicesThisMonth: number
  creditNotesThisMonth: number
  salesThisMonth: number
}

export interface LimitCheckResult {
  allowed: boolean
  current: number
  limit: number
  limitReached: boolean
  message?: string
}

// Get current usage for an organization
export async function getCurrentUsage(organizationId: number): Promise<UsageData> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const [productsCount, clientsCount, usersCount, invoicesThisMonth, creditNotesThisMonth, salesThisMonth] = await Promise.all([
    db.product.count({ where: { organizationId } }),
    db.client.count({ where: { organizationId } }),
    db.user.count({ where: { organizationId, active: true } }),
    db.invoice.count({
      where: {
        organizationId,
        issuedAt: { gte: startOfMonth, lte: endOfMonth }
      }
    }),
    db.creditNote.count({
      where: {
        organizationId,
        issuedAt: { gte: startOfMonth, lte: endOfMonth }
      }
    }),
    db.sale.count({
      where: {
        organizationId,
        createdAt: { gte: startOfMonth, lte: endOfMonth },
        status: 'completed'
      }
    })
  ])

  return {
    productsCount,
    clientsCount,
    usersCount,
    invoicesThisMonth,
    creditNotesThisMonth,
    salesThisMonth
  }
}

// Check if a specific limit allows a new item
export async function checkLimit(
  organizationId: number,
  limitType: 'products' | 'clients' | 'users' | 'invoices' | 'creditNotes'
): Promise<LimitCheckResult> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { plan: true, planStatus: true }
  })

  if (!org) {
    return { allowed: false, current: 0, limit: 0, limitReached: true, message: 'Organización no encontrada' }
  }

  const plan = org.plan as PlanType
  const limits = PLAN_LIMITS[plan]
  const usage = await getCurrentUsage(organizationId)

  let current: number
  let limit: number
  let entityName: string

  switch (limitType) {
    case 'products':
      current = usage.productsCount
      limit = limits.maxProducts
      entityName = 'productos'
      break
    case 'clients':
      current = usage.clientsCount
      limit = limits.maxClients
      entityName = 'clientes'
      break
    case 'users':
      current = usage.usersCount
      limit = limits.maxUsers
      entityName = 'usuarios'
      break
    case 'invoices':
      current = usage.invoicesThisMonth
      limit = limits.maxInvoicesPerMonth
      entityName = 'facturas este mes'
      break
    case 'creditNotes':
      current = usage.creditNotesThisMonth
      limit = limits.maxCreditNotesPerMonth
      entityName = 'notas de crédito este mes'
      break
    default:
      return { allowed: true, current: 0, limit: -1, limitReached: false }
  }

  // Unlimited
  if (isUnlimited(limit)) {
    return { allowed: true, current, limit, limitReached: false }
  }

  const limitReached = current >= limit
  const allowed = !limitReached

  return {
    allowed,
    current,
    limit,
    limitReached,
    message: limitReached 
      ? `Has alcanzado el límite de ${limit} ${entityName}. Mejora a Premium para desbloquear más.`
      : undefined
  }
}

// Check if organization has access to a feature
export async function checkFeatureAccess(
  organizationId: number,
  feature: PlanFeature
): Promise<{ allowed: boolean; plan: PlanType }> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { plan: true, planStatus: true }
  })

  if (!org) {
    return { allowed: false, plan: 'free' }
  }

  const plan = org.plan as PlanType
  
  // Trial users get premium features
  if (org.planStatus === 'trial') {
    return { allowed: true, plan: 'premium' }
  }

  // Expired or cancelled don't get premium features
  if (org.planStatus === 'expired' || org.planStatus === 'cancelled') {
    return { allowed: hasFeature('free', feature), plan: 'free' }
  }

  return { allowed: hasFeature(plan, feature), plan }
}

// Get usage percentage for display
export function getUsagePercentage(current: number, limit: number): number {
  if (isUnlimited(limit)) return 0
  if (limit === 0) return 100
  return Math.min(100, Math.round((current / limit) * 100))
}

// Record usage metric snapshot (called daily/weekly by cron)
export async function recordUsageSnapshot(organizationId: number): Promise<void> {
  const usage = await getCurrentUsage(organizationId)
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  await db.usageMetric.create({
    data: {
      organizationId,
      periodStart: startOfMonth,
      periodEnd: endOfMonth,
      productsCount: usage.productsCount,
      clientsCount: usage.clientsCount,
      usersCount: usage.usersCount,
      salesCount: usage.salesThisMonth,
      invoicesCount: usage.invoicesThisMonth,
      creditNotesCount: usage.creditNotesThisMonth
    }
  })
}

// UsageTracker class wrapper for easier usage in actions
export class UsageTracker {
  private organizationId: number

  constructor(organizationId: number) {
    this.organizationId = organizationId
  }

  async getUsage(): Promise<UsageData> {
    return getCurrentUsage(this.organizationId)
  }

  async canCreate(type: 'products' | 'clients' | 'users' | 'invoices' | 'creditNotes'): Promise<boolean> {
    const result = await checkLimit(this.organizationId, type)
    return result.allowed
  }

  async checkLimit(type: 'products' | 'clients' | 'users' | 'invoices' | 'creditNotes'): Promise<LimitCheckResult> {
    return checkLimit(this.organizationId, type)
  }

  async hasFeature(feature: PlanFeature): Promise<boolean> {
    const result = await checkFeatureAccess(this.organizationId, feature)
    return result.allowed
  }

  async getFeatureAccess(feature: PlanFeature): Promise<{ allowed: boolean; plan: PlanType }> {
    return checkFeatureAccess(this.organizationId, feature)
  }
}
