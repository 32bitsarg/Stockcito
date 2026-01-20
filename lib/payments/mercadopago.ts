// MercadoPago integration for Stockcito Premium subscriptions
import { paymentLogger } from '@/lib/logger'
// Documentation: https://www.mercadopago.com.ar/developers/es/docs

import { PLAN_PRICES } from '@/lib/subscription/plans'
import crypto from 'crypto'

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
// Support both naming conventions for public key
const MERCADOPAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || process.env.MERCADOPAGO_PUBLIC_KEY || ''
const MERCADOPAGO_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export interface PaymentPreference {
  id: string
  init_point: string
  sandbox_init_point: string
}

export interface PaymentInfo {
  id: string
  status: 'approved' | 'pending' | 'rejected' | 'cancelled' | 'refunded'
  status_detail: string
  transaction_amount: number
  currency_id: string
  payer_email: string
  external_reference: string
  date_approved: string | null
}

// Create a payment preference for subscription
export async function createPaymentPreference(
  organizationId: number,
  organizationName: string,
  email: string,
  planType: 'monthly' | 'yearly' = 'monthly'
): Promise<PaymentPreference | null> {
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    paymentLogger.warn('MercadoPago access token not configured')
    return null
  }

  const price = planType === 'yearly'
    ? PLAN_PRICES.premium.yearly
    : PLAN_PRICES.premium.monthly

  const description = planType === 'yearly'
    ? 'Stockcito Premium - Suscripción Anual'
    : 'Stockcito Premium - Suscripción Mensual'

  const externalReference = `org_${organizationId}_${Date.now()}`

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            id: `premium_${planType}`,
            title: description,
            description: `Acceso completo a todas las funciones Premium de Stockcito`,
            quantity: 1,
            currency_id: 'ARS',
            unit_price: price,
          }
        ],
        payer: {
          email: email,
        },
        back_urls: {
          success: `${APP_URL}/subscription/success`,
          failure: `${APP_URL}/subscription/cancelled`,
          pending: `${APP_URL}/subscription/pending`,
        },
        auto_return: 'approved',
        external_reference: externalReference,
        notification_url: `${APP_URL}/api/webhooks/mercadopago`,
        statement_descriptor: 'STOCKCITO',
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      paymentLogger.error('MercadoPago error', new Error(errorData))
      return null
    }

    const data = await response.json()
    return {
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point
    }
  } catch (error) {
    paymentLogger.error('MercadoPago preference creation error:', error)
    return null
  }
}

// Create a subscription plan (preapproval_plan) - New MercadoPago flow
export async function createSubscriptionPlan(
  planType: 'monthly' | 'yearly' = 'monthly'
): Promise<{ id: string; init_point: string } | null> {
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    paymentLogger.warn('MercadoPago access token not configured')
    return null
  }

  const price = planType === 'yearly'
    ? PLAN_PRICES.premium.yearly
    : PLAN_PRICES.premium.monthly

  const description = planType === 'yearly'
    ? 'Stockcito Premium - Suscripción Anual'
    : 'Stockcito Premium - Suscripción Mensual'

  try {
    const requestBody = {
      reason: description,
      auto_recurring: {
        frequency: planType === 'yearly' ? 12 : 1,
        frequency_type: 'months',
        billing_day: new Date().getDate(), // Billing on same day of month
        billing_day_proportional: true,
        transaction_amount: price,
        currency_id: 'ARS'
      },
      back_url: `${APP_URL}/subscription/success`,
      payment_methods_allowed: {
        payment_types: [{ id: 'credit_card' }, { id: 'debit_card' }]
      }
    }

    paymentLogger.info('Creating subscription plan with:', requestBody)

    const response = await fetch('https://api.mercadopago.com/preapproval_plan', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    const responseText = await response.text()

    if (!response.ok) {
      paymentLogger.error('MercadoPago preapproval_plan error:', {
        status: response.status,
        body: responseText
      })
      console.error('[MercadoPago Plan Error]', responseText)
      return null
    }

    const data = JSON.parse(responseText)

    if (!data.init_point) {
      paymentLogger.error('MercadoPago plan missing init_point:', data)
      return null
    }

    paymentLogger.info('Subscription plan created:', { id: data.id, init_point: data.init_point })

    return {
      id: data.id,
      init_point: data.init_point
    }
  } catch (error) {
    paymentLogger.error('MercadoPago plan creation error:', error)
    return null
  }
}


// Create a subscription (preapproval)
export async function createSubscription(
  organizationId: number,
  organizationName: string,
  email: string,
  planType: 'monthly' | 'yearly' = 'monthly'
): Promise<{ id: string; init_point: string; error?: string } | null> {
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    paymentLogger.warn('MercadoPago access token not configured')
    return null
  }

  const price = planType === 'yearly'
    ? PLAN_PRICES.premium.yearly
    : PLAN_PRICES.premium.monthly

  const description = planType === 'yearly'
    ? 'Stockcito Premium - Suscripción Anual'
    : 'Stockcito Premium - Suscripción Mensual'

  const externalReference = `org_${organizationId}_${Date.now()}`

  try {
    const requestBody = {
      reason: description,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: price,
        currency_id: 'ARS',
        ...(planType === 'yearly' && { frequency: 12 })
      },
      payer_email: email,
      back_url: `${APP_URL}/subscription/success`,
      external_reference: externalReference,
      status: 'pending'
    }

    paymentLogger.info('Creating subscription with:', {
      organizationId,
      email,
      price,
      planType,
      back_url: `${APP_URL}/subscription/success`
    })

    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    const responseText = await response.text()

    if (!response.ok) {
      paymentLogger.error('MercadoPago subscription error:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      })
      // Try to parse error message for better debugging
      try {
        const errorJson = JSON.parse(responseText)
        console.error('[MercadoPago Error]', JSON.stringify(errorJson, null, 2))
      } catch {
        console.error('[MercadoPago Error]', responseText)
      }
      return null
    }

    const data = JSON.parse(responseText)

    if (!data.init_point) {
      paymentLogger.error('MercadoPago subscription missing init_point:', data)
      return null
    }

    return {
      id: data.id,
      init_point: data.init_point
    }
  } catch (error) {
    paymentLogger.error('MercadoPago subscription creation error:', error)
    return null
  }
}

// Get payment info by ID
export async function getPaymentInfo(paymentId: string): Promise<PaymentInfo | null> {
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    return null
  }

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      }
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return {
      id: data.id.toString(),
      status: data.status,
      status_detail: data.status_detail,
      transaction_amount: data.transaction_amount,
      currency_id: data.currency_id,
      payer_email: data.payer?.email || '',
      external_reference: data.external_reference || '',
      date_approved: data.date_approved
    }
  } catch (error) {
    paymentLogger.error('MercadoPago get payment error:', error)
    return null
  }
}

// Parse external reference to get organization ID
export function parseExternalReference(reference: string): { organizationId: number; timestamp: number } | null {
  // Format: org_123_1703704800000
  const match = reference.match(/^org_(\d+)_(\d+)$/)
  if (!match) return null

  return {
    organizationId: parseInt(match[1], 10),
    timestamp: parseInt(match[2], 10)
  }
}

// Verify webhook signature using HMAC-SHA256
// Documentation: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
export function verifyWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string
): boolean {
  // In development, allow requests without signature for testing
  if (process.env.NODE_ENV !== 'production') {
    return true
  }

  if (!xSignature || !xRequestId) {
    paymentLogger.warn('[MercadoPago] Missing x-signature or x-request-id headers')
    return false
  }

  if (!MERCADOPAGO_WEBHOOK_SECRET) {
    paymentLogger.warn('[MercadoPago] MERCADOPAGO_WEBHOOK_SECRET not configured')
    return false
  }

  try {
    // Parse the x-signature header
    // Format: "ts=timestamp,v1=hash"
    const parts = xSignature.split(',')
    const tsMatch = parts.find(p => p.startsWith('ts='))
    const v1Match = parts.find(p => p.startsWith('v1='))

    if (!tsMatch || !v1Match) {
      paymentLogger.warn('[MercadoPago] Invalid x-signature format')
      return false
    }

    const timestamp = tsMatch.replace('ts=', '')
    const receivedHash = v1Match.replace('v1=', '')

    // Build the manifest string as per MercadoPago documentation
    // Format: "id:[data.id];request-id:[x-request-id];ts:[ts];"
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${timestamp};`

    // Generate HMAC-SHA256 hash
    const expectedHash = crypto
      .createHmac('sha256', MERCADOPAGO_WEBHOOK_SECRET)
      .update(manifest)
      .digest('hex')

    // Constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(receivedHash),
      Buffer.from(expectedHash)
    )

    if (!isValid) {
      paymentLogger.warn('[MercadoPago] Webhook signature verification failed')
    }

    return isValid
  } catch (error) {
    paymentLogger.error('[MercadoPago] Error verifying webhook signature', error)
    return false
  }
}

// Get public key for frontend
export function getMercadoPagoPublicKey(): string {
  return MERCADOPAGO_PUBLIC_KEY
}

// Check if MercadoPago is configured
export function isMercadoPagoConfigured(): boolean {
  return !!(MERCADOPAGO_ACCESS_TOKEN && MERCADOPAGO_PUBLIC_KEY)
}

// Subscription info interface
export interface SubscriptionInfo {
  id: string
  status: 'pending' | 'authorized' | 'paused' | 'cancelled'
  reason: string
  payer_email: string
  next_payment_date: string | null
  transaction_amount: number
  currency_id: string
  payment_method_id: string | null
  card_id: string | null
  date_created: string
  last_modified: string
}

// Get subscription info by ID
export async function getSubscriptionInfo(subscriptionId: string): Promise<SubscriptionInfo | null> {
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    paymentLogger.warn('MercadoPago access token not configured')
    return null
  }

  try {
    const response = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      }
    })

    if (!response.ok) {
      paymentLogger.error('MercadoPago get subscription error', {
        status: response.status,
        subscriptionId
      })
      return null
    }

    const data = await response.json()

    return {
      id: data.id,
      status: data.status,
      reason: data.reason || '',
      payer_email: data.payer_email || '',
      next_payment_date: data.next_payment_date || null,
      transaction_amount: data.auto_recurring?.transaction_amount || 0,
      currency_id: data.auto_recurring?.currency_id || 'ARS',
      payment_method_id: data.payment_method_id || null,
      card_id: data.card_id || null,
      date_created: data.date_created,
      last_modified: data.last_modified
    }
  } catch (error) {
    paymentLogger.error('MercadoPago get subscription error:', error)
    return null
  }
}

// Search subscription by payer email
export async function searchSubscriptionByEmail(email: string): Promise<SubscriptionInfo | null> {
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    paymentLogger.warn('MercadoPago access token not configured')
    return null
  }

  try {
    const response = await fetch(
      `https://api.mercadopago.com/preapproval/search?payer_email=${encodeURIComponent(email)}&status=authorized`,
      {
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        }
      }
    )

    if (!response.ok) {
      paymentLogger.error('MercadoPago search subscription error', {
        status: response.status,
        email
      })
      return null
    }

    const data = await response.json()

    // Return the most recent active subscription
    if (data.results && data.results.length > 0) {
      const subscription = data.results[0]
      return {
        id: subscription.id,
        status: subscription.status,
        reason: subscription.reason || '',
        payer_email: subscription.payer_email || '',
        next_payment_date: subscription.next_payment_date || null,
        transaction_amount: subscription.auto_recurring?.transaction_amount || 0,
        currency_id: subscription.auto_recurring?.currency_id || 'ARS',
        payment_method_id: subscription.payment_method_id || null,
        card_id: subscription.card_id || null,
        date_created: subscription.date_created,
        last_modified: subscription.last_modified
      }
    }

    return null
  } catch (error) {
    paymentLogger.error('MercadoPago search subscription error:', error)
    return null
  }
}

// Get payment method info (card details)
export interface PaymentMethodInfo {
  type: 'credit_card' | 'debit_card' | 'mercadopago' | 'unknown'
  lastFourDigits: string | null
  brand: string | null
  expirationMonth: number | null
  expirationYear: number | null
}

// Card details from a payment
export interface CardDetails {
  lastFourDigits: string | null
  expirationMonth: number | null
  expirationYear: number | null
  cardholderName: string | null
  brand: string | null
  paymentMethodId: string | null
  paymentType: 'credit_card' | 'debit_card' | 'account_money' | 'unknown'
}

// Search for payments by payer email to get card details
export async function getLastPaymentDetails(email: string): Promise<CardDetails | null> {
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    paymentLogger.warn('MercadoPago access token not configured')
    return null
  }

  try {
    // Search for approved payments from this payer
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/search?payer.email=${encodeURIComponent(email)}&status=approved&sort=date_created&criteria=desc&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        }
      }
    )

    if (!response.ok) {
      paymentLogger.error('MercadoPago search payments error', {
        status: response.status,
        email
      })
      return null
    }

    const data = await response.json()

    if (data.results && data.results.length > 0) {
      const payment = data.results[0]
      const card = payment.card || {}

      // Determine payment type
      let paymentType: CardDetails['paymentType'] = 'unknown'
      if (payment.payment_type_id === 'credit_card') {
        paymentType = 'credit_card'
      } else if (payment.payment_type_id === 'debit_card') {
        paymentType = 'debit_card'
      } else if (payment.payment_type_id === 'account_money') {
        paymentType = 'account_money'
      }

      return {
        lastFourDigits: card.last_four_digits || null,
        expirationMonth: card.expiration_month || null,
        expirationYear: card.expiration_year || null,
        cardholderName: card.cardholder?.name || null,
        brand: payment.payment_method_id || null,
        paymentMethodId: payment.payment_method_id || null,
        paymentType
      }
    }

    return null
  } catch (error) {
    paymentLogger.error('MercadoPago get last payment details error:', error)
    return null
  }
}

export async function getPaymentMethodFromSubscription(email: string): Promise<PaymentMethodInfo | null> {
  // First try to get card details from the last payment
  const cardDetails = await getLastPaymentDetails(email)

  if (cardDetails) {
    return {
      type: cardDetails.paymentType === 'account_money' ? 'mercadopago' :
        cardDetails.paymentType === 'unknown' ? 'unknown' : cardDetails.paymentType,
      lastFourDigits: cardDetails.lastFourDigits,
      brand: cardDetails.brand,
      expirationMonth: cardDetails.expirationMonth,
      expirationYear: cardDetails.expirationYear
    }
  }

  // Fallback: try to find an active subscription (less detailed)
  const subscription = await searchSubscriptionByEmail(email)

  if (!subscription) {
    return null
  }

  return {
    type: subscription.payment_method_id?.includes('debit') ? 'debit_card' : 'credit_card',
    lastFourDigits: null,
    brand: subscription.payment_method_id || 'MercadoPago',
    expirationMonth: null,
    expirationYear: null
  }
}
