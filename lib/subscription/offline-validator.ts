import { db } from '@/lib/db'
import { GRACE_PERIOD_DAYS, PlanType } from './plans'

export interface OfflineValidationResult {
  valid: boolean
  plan: PlanType
  daysRemaining: number
  requiresReconnection: boolean
  message?: string
}

// Validate subscription for offline/Electron mode
export async function validateSubscriptionOffline(organizationId: number): Promise<OfflineValidationResult> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: {
      plan: true,
      planStatus: true,
      subscriptionEndsAt: true,
      lastVerifiedAt: true,
      trialEndsAt: true
    }
  })

  if (!org) {
    return {
      valid: false,
      plan: 'free',
      daysRemaining: 0,
      requiresReconnection: true,
      message: 'Organización no encontrada'
    }
  }

  const plan = org.plan as PlanType
  const now = new Date()

  // Free plan always valid
  if (plan === 'free') {
    return {
      valid: true,
      plan: 'free',
      daysRemaining: -1,
      requiresReconnection: false
    }
  }

  // Check trial
  if (org.planStatus === 'trial' && org.trialEndsAt) {
    const trialEnd = new Date(org.trialEndsAt)
    if (now > trialEnd) {
      return {
        valid: false,
        plan: 'free',
        daysRemaining: 0,
        requiresReconnection: true,
        message: 'Tu período de prueba ha terminado'
      }
    }
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return {
      valid: true,
      plan: 'premium',
      daysRemaining,
      requiresReconnection: false
    }
  }

  // Check subscription expiration
  if (org.subscriptionEndsAt) {
    const subEnd = new Date(org.subscriptionEndsAt)
    if (now > subEnd) {
      return {
        valid: false,
        plan: 'free',
        daysRemaining: 0,
        requiresReconnection: true,
        message: 'Tu suscripción ha expirado'
      }
    }
  }

  // Check last verification (grace period for offline)
  if (org.lastVerifiedAt) {
    const lastVerified = new Date(org.lastVerifiedAt)
    const daysSinceVerification = Math.floor((now.getTime() - lastVerified.getTime()) / (1000 * 60 * 60 * 24))
    const daysRemaining = GRACE_PERIOD_DAYS - daysSinceVerification

    if (daysRemaining <= 0) {
      return {
        valid: false,
        plan: plan,
        daysRemaining: 0,
        requiresReconnection: true,
        message: 'Conecta a internet para verificar tu suscripción'
      }
    }

    return {
      valid: true,
      plan: plan,
      daysRemaining,
      requiresReconnection: daysRemaining <= 2,
      message: daysRemaining <= 2 ? `Conecta a internet pronto (${daysRemaining} días restantes)` : undefined
    }
  }

  // No verification date, require reconnection after grace period
  return {
    valid: true,
    plan: plan,
    daysRemaining: GRACE_PERIOD_DAYS,
    requiresReconnection: false
  }
}

// Update last verified timestamp (called when online)
export async function updateLastVerified(organizationId: number): Promise<void> {
  await db.organization.update({
    where: { id: organizationId },
    data: { lastVerifiedAt: new Date() }
  })
}

// Check if subscription is expired
export function isSubscriptionExpired(subscriptionEndsAt: Date | null, planStatus: string): boolean {
  if (planStatus === 'expired' || planStatus === 'cancelled') return true
  if (!subscriptionEndsAt) return false
  return new Date() > new Date(subscriptionEndsAt)
}

// Check if trial is expired
export function isTrialExpired(trialEndsAt: Date | null): boolean {
  if (!trialEndsAt) return true
  return new Date() > new Date(trialEndsAt)
}

// Get days until expiration
export function getDaysUntilExpiration(expirationDate: Date | null): number {
  if (!expirationDate) return 0
  const now = new Date()
  const end = new Date(expirationDate)
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
