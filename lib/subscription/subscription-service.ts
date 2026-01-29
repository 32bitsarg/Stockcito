import { db } from '@/lib/db'
import { PlanType, TRIAL_DAYS, PLAN_LIMITS } from './plans'
import { updateLastVerified } from './offline-validator'

export interface SubscriptionStatus {
  plan: PlanType
  planStatus: string
  isTrialing: boolean
  isPremium: boolean
  isEntrepreneur: boolean
  isFree: boolean
  trialDaysRemaining: number | null
  subscriptionDaysRemaining: number | null
  canUpgrade: boolean
  canDowngrade: boolean
}

// Get full subscription status for an organization
export async function getSubscriptionStatus(organizationId: number): Promise<SubscriptionStatus | null> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: {
      plan: true,
      planStatus: true,
      trialStartedAt: true,
      trialEndsAt: true,
      subscriptionStartedAt: true,
      subscriptionEndsAt: true
    }
  })

  if (!org) return null

  const plan = org.plan as PlanType
  const now = new Date()

  let trialDaysRemaining: number | null = null
  let subscriptionDaysRemaining: number | null = null

  if (org.planStatus === 'trial' && org.trialEndsAt) {
    const diff = new Date(org.trialEndsAt).getTime() - now.getTime()
    trialDaysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  if (org.subscriptionEndsAt && org.planStatus === 'active') {
    const diff = new Date(org.subscriptionEndsAt).getTime() - now.getTime()
    subscriptionDaysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const isActive = org.planStatus === 'active' || org.planStatus === 'trial'
  const isPaidPlan = plan === 'premium' || plan === 'entrepreneur'

  return {
    plan,
    planStatus: org.planStatus,
    isTrialing: org.planStatus === 'trial',
    isPremium: plan === 'premium' && isActive,
    isEntrepreneur: plan === 'entrepreneur' && isActive,
    isFree: plan === 'free' || org.planStatus === 'expired' || org.planStatus === 'cancelled',
    trialDaysRemaining,
    subscriptionDaysRemaining,
    canUpgrade: plan === 'free' || plan === 'entrepreneur' || org.planStatus === 'expired' || org.planStatus === 'cancelled',
    canDowngrade: isPaidPlan && org.planStatus === 'active'
  }
}

// Start trial for an organization
export async function startTrial(organizationId: number): Promise<void> {
  const now = new Date()
  const trialEnd = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)

  await db.$transaction([
    db.organization.update({
      where: { id: organizationId },
      data: {
        plan: 'free',
        planStatus: 'trial',
        trialStartedAt: now,
        trialEndsAt: trialEnd,
        lastVerifiedAt: now
      }
    }),
    db.subscriptionLog.create({
      data: {
        organizationId,
        event: 'trial_started',
        toPlan: 'premium',
        details: JSON.stringify({ trialDays: TRIAL_DAYS, endsAt: trialEnd.toISOString() })
      }
    })
  ])
}

// Upgrade to a paid plan (entrepreneur or premium)
export async function upgradeToPremium(
  organizationId: number,
  paymentId: string,
  amount: number,
  targetPlan: 'entrepreneur' | 'premium' = 'premium'
): Promise<void> {
  const now = new Date()
  const subscriptionEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { plan: true }
  })

  await db.$transaction([
    db.organization.update({
      where: { id: organizationId },
      data: {
        plan: targetPlan,
        planStatus: 'active',
        subscriptionStartedAt: now,
        subscriptionEndsAt: subscriptionEnd,
        lastPaymentId: paymentId,
        lastPaymentDate: now,
        lastPaymentAmount: amount,
        lastVerifiedAt: now
      }
    }),
    db.subscriptionLog.create({
      data: {
        organizationId,
        event: 'subscription_created',
        fromPlan: org?.plan || 'free',
        toPlan: targetPlan,
        amount,
        paymentMethod: 'mercadopago',
        transactionId: paymentId,
        details: JSON.stringify({ endsAt: subscriptionEnd.toISOString() })
      }
    })
  ])
}

// Renew subscription
export async function renewSubscription(
  organizationId: number,
  paymentId: string,
  amount: number
): Promise<void> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { subscriptionEndsAt: true }
  })

  const now = new Date()
  // If subscription hasn't expired yet, add 30 days from current end
  // Otherwise, start fresh from now
  const baseDate = org?.subscriptionEndsAt && new Date(org.subscriptionEndsAt) > now
    ? new Date(org.subscriptionEndsAt)
    : now
  const newEndDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000)

  await db.$transaction([
    db.organization.update({
      where: { id: organizationId },
      data: {
        planStatus: 'active',
        subscriptionEndsAt: newEndDate,
        lastPaymentId: paymentId,
        lastPaymentDate: now,
        lastPaymentAmount: amount,
        lastVerifiedAt: now
      }
    }),
    db.subscriptionLog.create({
      data: {
        organizationId,
        event: 'renewed',
        toPlan: 'premium',
        amount,
        paymentMethod: 'mercadopago',
        transactionId: paymentId,
        details: JSON.stringify({ newEndsAt: newEndDate.toISOString() })
      }
    })
  ])
}

// Cancel subscription (will expire at end of period)
export async function cancelSubscription(organizationId: number): Promise<void> {
  await db.$transaction([
    db.organization.update({
      where: { id: organizationId },
      data: { planStatus: 'cancelled' }
    }),
    db.subscriptionLog.create({
      data: {
        organizationId,
        event: 'cancelled',
        details: JSON.stringify({ cancelledAt: new Date().toISOString() })
      }
    })
  ])
}

// Downgrade to free (after expiration)
export async function downgradeToFree(organizationId: number): Promise<void> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { plan: true }
  })

  await db.$transaction([
    db.organization.update({
      where: { id: organizationId },
      data: {
        plan: 'free',
        planStatus: 'active',
        subscriptionEndsAt: null
      }
    }),
    db.subscriptionLog.create({
      data: {
        organizationId,
        event: 'downgraded',
        fromPlan: org?.plan || 'premium',
        toPlan: 'free',
        details: JSON.stringify({ downgradedAt: new Date().toISOString() })
      }
    })
  ])
}

// Expire subscription (called by cron or on check)
export async function expireSubscription(organizationId: number): Promise<void> {
  await db.$transaction([
    db.organization.update({
      where: { id: organizationId },
      data: { planStatus: 'expired' }
    }),
    db.subscriptionLog.create({
      data: {
        organizationId,
        event: 'expired',
        details: JSON.stringify({ expiredAt: new Date().toISOString() })
      }
    })
  ])
}

// Check and update expired subscriptions (cron job)
export async function checkExpiredSubscriptions(): Promise<number> {
  const now = new Date()

  // Find all organizations with expired subscriptions
  const expiredOrgs = await db.organization.findMany({
    where: {
      OR: [
        // Trial expired
        {
          planStatus: 'trial',
          trialEndsAt: { lt: now }
        },
        // Subscription expired
        {
          planStatus: 'active',
          plan: 'premium',
          subscriptionEndsAt: { lt: now }
        }
      ]
    },
    select: { id: true }
  })

  for (const org of expiredOrgs) {
    await expireSubscription(org.id)
  }

  return expiredOrgs.length
}

// Verify subscription online (for Electron)
export async function verifySubscriptionOnline(organizationId: number): Promise<SubscriptionStatus | null> {
  // Update last verified timestamp
  await updateLastVerified(organizationId)

  // Check for expired subscriptions
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: {
      planStatus: true,
      plan: true,
      trialEndsAt: true,
      subscriptionEndsAt: true
    }
  })

  if (org) {
    const now = new Date()

    // Auto-expire if needed
    if (org.planStatus === 'trial' && org.trialEndsAt && new Date(org.trialEndsAt) < now) {
      await expireSubscription(organizationId)
    } else if (org.planStatus === 'active' && org.plan === 'premium' && org.subscriptionEndsAt && new Date(org.subscriptionEndsAt) < now) {
      await expireSubscription(organizationId)
    }
  }

  return getSubscriptionStatus(organizationId)
}
