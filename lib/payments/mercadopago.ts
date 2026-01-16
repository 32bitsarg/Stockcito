// MercadoPago integration for Stockcito Premium subscriptions
import { paymentLogger } from '@/lib/logger'
// Documentation: https://www.mercadopago.com.ar/developers/es/docs

import { PLAN_PRICES } from '@/lib/subscription/plans'
import crypto from 'crypto'

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
const MERCADOPAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || ''
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
