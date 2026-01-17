"use server"

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { requireAuth, requireRole } from './auth-actions'
import {
  createPaymentPreference,
  createSubscriptionPlan,
  isMercadoPagoConfigured,
  parseExternalReference,
  getPaymentInfo
} from '@/lib/payments/mercadopago'
import { upgradeToPremium, renewSubscription } from '@/lib/subscription/subscription-service'
import { PLAN_PRICES } from '@/lib/subscription/plans'
import { paymentLogger } from '@/lib/logger'

export interface CheckoutResult {
  success: boolean
  checkoutUrl?: string
  error?: string
}

// Create checkout session for subscription
export async function createCheckoutSession(
  planType: 'monthly' | 'yearly' = 'monthly',
  useSubscription: boolean = true
): Promise<CheckoutResult> {
  try {
    const session = await requireRole(['admin', 'owner'])

    if (!isMercadoPagoConfigured()) {
      return {
        success: false,
        error: 'El sistema de pagos no está configurado. Contacta al soporte.'
      }
    }

    const user = await db.user.findUnique({
      where: { id: session.id },
      include: { organization: true }
    })

    if (!user?.organization) {
      return { success: false, error: 'Usuario sin organización' }
    }

    const org = user.organization
    let checkoutUrl: string | undefined

    if (useSubscription) {
      // Try subscription plan first (recurring payments)
      paymentLogger.info('Attempting to create subscription plan...')
      const subscriptionPlan = await createSubscriptionPlan(planType)

      if (subscriptionPlan?.init_point) {
        checkoutUrl = subscriptionPlan.init_point
        paymentLogger.info('Subscription plan created successfully')
      } else {
        // Fallback to one-time payment if subscription fails
        paymentLogger.warn('Subscription plan failed, falling back to one-time payment')
        const preference = await createPaymentPreference(
          org.id,
          org.name,
          org.email,
          planType
        )

        if (preference) {
          checkoutUrl = process.env.NODE_ENV === 'production'
            ? preference.init_point
            : preference.sandbox_init_point
        }
      }
    } else {
      // Use one-time payment directly
      const preference = await createPaymentPreference(
        org.id,
        org.name,
        org.email,
        planType
      )

      if (preference) {
        checkoutUrl = process.env.NODE_ENV === 'production'
          ? preference.init_point
          : preference.sandbox_init_point
      }
    }

    if (!checkoutUrl) {
      return {
        success: false,
        error: `Error al crear el pago. Verifica que el email (${org.email}) sea válido.`
      }
    }

    return {
      success: true,
      checkoutUrl
    }


  } catch (error) {
    // Check if it's an authorization error
    if (error instanceof Error) {
      if (error.message === 'No autenticado') {
        return { success: false, error: 'Debes iniciar sesión para continuar' }
      }
      if (error.message === 'No autorizado') {
        return { success: false, error: 'Solo el dueño o administrador pueden realizar esta acción' }
      }
    }
    paymentLogger.error('Create checkout session error', error)
    return { success: false, error: 'Error al iniciar el proceso de pago' }
  }
}

// Process successful payment (called by webhook or return URL verification)
export async function processPaymentSuccess(
  paymentId: string,
  externalReference: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Parse organization ID from reference
    const parsed = parseExternalReference(externalReference)
    if (!parsed) {
      return { success: false, error: 'Referencia de pago inválida' }
    }

    // Verify payment status with MercadoPago
    const paymentInfo = await getPaymentInfo(paymentId)
    if (!paymentInfo || paymentInfo.status !== 'approved') {
      return { success: false, error: 'El pago no fue aprobado' }
    }

    const org = await db.organization.findUnique({
      where: { id: parsed.organizationId }
    })

    if (!org) {
      return { success: false, error: 'Organización no encontrada' }
    }

    // Check if this payment was already processed
    const existingLog = await db.subscriptionLog.findFirst({
      where: {
        organizationId: parsed.organizationId,
        transactionId: paymentId
      }
    })

    if (existingLog) {
      // Payment already processed
      return { success: true }
    }

    // Determine if upgrade or renewal
    const amount = paymentInfo.transaction_amount

    if (org.plan === 'premium' && org.planStatus === 'active') {
      // Renewal
      await renewSubscription(parsed.organizationId, paymentId, amount)
    } else {
      // New subscription or upgrade
      await upgradeToPremium(parsed.organizationId, paymentId, amount)
    }

    revalidatePath('/subscription')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    paymentLogger.error('Process payment success error', error)
    return { success: false, error: 'Error al procesar el pago' }
  }
}

// Get payment history for organization
export async function getPaymentHistory(limit: number = 10) {
  const session = await requireAuth()

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { organizationId: true, role: true }
  })

  if (!user?.organizationId) {
    return []
  }

  // Only admins can see payment history
  if (user.role !== 'admin') {
    return []
  }

  const logs = await db.subscriptionLog.findMany({
    where: {
      organizationId: user.organizationId,
      event: {
        in: ['payment_received', 'subscription_created', 'renewed']
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return logs.map(log => ({
    id: log.id,
    date: log.createdAt,
    amount: log.amount ? Number(log.amount) : 0,
    event: log.event,
    transactionId: log.transactionId,
    details: log.details ? JSON.parse(log.details) : null
  }))
}

// Get current payment status
export async function getPaymentStatus(): Promise<{
  configured: boolean
  lastPayment: Date | null
  nextPaymentDue: Date | null
  amount: number
}> {
  const session = await requireAuth()

  const user = await db.user.findUnique({
    where: { id: session.id },
    include: { organization: true }
  })

  if (!user?.organization) {
    return {
      configured: isMercadoPagoConfigured(),
      lastPayment: null,
      nextPaymentDue: null,
      amount: PLAN_PRICES.premium.monthly
    }
  }

  const org = user.organization

  return {
    configured: isMercadoPagoConfigured(),
    lastPayment: org.lastPaymentDate,
    nextPaymentDue: org.subscriptionEndsAt,
    amount: org.lastPaymentAmount ? Number(org.lastPaymentAmount) : PLAN_PRICES.premium.monthly
  }
}
