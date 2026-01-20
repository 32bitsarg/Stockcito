"use server"

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { requireAuth, requireRole } from './auth-actions'
import {
  createPaymentPreference,
  createSubscriptionPlan,
  isMercadoPagoConfigured,
  parseExternalReference,
  getPaymentInfo,
  searchSubscriptionByEmail,
  getLastPaymentDetails,
  getSubscriptionInfo
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

// Get payment method info from MercadoPago subscription
export interface PaymentMethod {
  type: 'credit_card' | 'debit_card' | 'mercadopago' | 'unknown'
  brand: string | null
  lastFourDigits: string | null
  expirationMonth: number | null
  expirationYear: number | null
  hasActiveSubscription: boolean
  subscriptionStatus: string | null
  nextPaymentDate: Date | null
}

export async function getPaymentMethod(): Promise<PaymentMethod | null> {
  try {
    const session = await requireAuth()

    const user = await db.user.findUnique({
      where: { id: session.id },
      include: { organization: true }
    })

    if (!user?.organization) {
      return null
    }

    const org = user.organization

    // If not premium or no payment history, return null
    if (org.plan !== 'premium' && org.planStatus !== 'trial') {
      return null
    }

    // Try to get card details from recent payments first (has most complete data)
    const cardDetails = await getLastPaymentDetails(org.email)

    // Also try to get subscription info for status
    const subscription = await searchSubscriptionByEmail(org.email)

    if (cardDetails) {
      return {
        type: cardDetails.paymentType === 'account_money' ? 'mercadopago' :
          cardDetails.paymentType === 'unknown' ? 'unknown' : cardDetails.paymentType,
        brand: cardDetails.brand,
        lastFourDigits: cardDetails.lastFourDigits,
        expirationMonth: cardDetails.expirationMonth,
        expirationYear: cardDetails.expirationYear,
        hasActiveSubscription: subscription?.status === 'authorized' || org.planStatus === 'active',
        subscriptionStatus: subscription?.status || org.planStatus,
        nextPaymentDate: subscription?.next_payment_date
          ? new Date(subscription.next_payment_date)
          : org.subscriptionEndsAt
      }
    }

    // Fallback: subscription info without card details
    if (subscription) {
      return {
        type: subscription.payment_method_id?.includes('debit') ? 'debit_card' : 'credit_card',
        brand: subscription.payment_method_id || 'MercadoPago',
        lastFourDigits: null,
        expirationMonth: null,
        expirationYear: null,
        hasActiveSubscription: subscription.status === 'authorized',
        subscriptionStatus: subscription.status,
        nextPaymentDate: subscription.next_payment_date ? new Date(subscription.next_payment_date) : null
      }
    }

    // Fallback: Check if we have local payment data
    if (org.mercadoPagoCustomerId || org.lastPaymentId) {
      return {
        type: 'mercadopago',
        brand: 'MercadoPago',
        lastFourDigits: null,
        expirationMonth: null,
        expirationYear: null,
        hasActiveSubscription: org.planStatus === 'active',
        subscriptionStatus: org.planStatus,
        nextPaymentDate: org.subscriptionEndsAt
      }
    }

    return null
  } catch (error) {
    paymentLogger.error('Get payment method error', error)
    return null
  }
}

// Verify subscription payment - used on success page
export interface VerificationResult {
  success: boolean
  status: 'approved' | 'pending' | 'rejected' | 'error'
  message: string
  planActive: boolean
}

export async function verifySubscriptionPayment(
  paymentId: string | null,
  externalReference: string | null
): Promise<VerificationResult> {
  try {
    const session = await requireAuth()

    const user = await db.user.findUnique({
      where: { id: session.id },
      include: { organization: true }
    })

    if (!user?.organization) {
      return {
        success: false,
        status: 'error',
        message: 'No se encontró la organización',
        planActive: false
      }
    }

    const org = user.organization

    // First check: Is the organization already premium?
    if (org.plan === 'premium' && org.planStatus === 'active') {
      return {
        success: true,
        status: 'approved',
        message: 'Tu suscripción Premium está activa',
        planActive: true
      }
    }

    // If we have a payment ID, verify with MercadoPago
    if (paymentId) {
      const paymentInfo = await getPaymentInfo(paymentId)

      if (paymentInfo) {
        if (paymentInfo.status === 'approved') {
          // Payment approved - check if org needs to be updated
          if (org.plan !== 'premium') {
            // This might happen if webhook hasn't processed yet
            // The webhook should handle the actual upgrade
            return {
              success: true,
              status: 'approved',
              message: 'Pago aprobado. Tu cuenta Premium se activará en breve.',
              planActive: false
            }
          }
          return {
            success: true,
            status: 'approved',
            message: '¡Bienvenido a Premium!',
            planActive: true
          }
        } else if (paymentInfo.status === 'pending') {
          return {
            success: false,
            status: 'pending',
            message: 'Tu pago está pendiente de confirmación',
            planActive: false
          }
        } else {
          return {
            success: false,
            status: 'rejected',
            message: 'El pago no fue aprobado',
            planActive: false
          }
        }
      }
    }

    // Check subscription status via email
    const subscription = await searchSubscriptionByEmail(org.email)

    if (subscription?.status === 'authorized') {
      return {
        success: true,
        status: 'approved',
        message: 'Suscripción activa',
        planActive: org.plan === 'premium'
      }
    }

    // No definitive status found
    return {
      success: false,
      status: 'pending',
      message: 'Verificando estado de la suscripción...',
      planActive: org.plan === 'premium'
    }

  } catch (error) {
    paymentLogger.error('Verify subscription payment error', error)
    return {
      success: false,
      status: 'error',
      message: 'Error al verificar el pago',
      planActive: false
    }
  }
}

