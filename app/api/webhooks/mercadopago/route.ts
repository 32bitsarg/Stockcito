import { NextRequest, NextResponse } from 'next/server'
import {
  getPaymentInfo,
  parseExternalReference,
  verifyWebhookSignature,
  getSubscriptionInfo
} from '@/lib/payments/mercadopago'
import {
  upgradeToPremium,
  renewSubscription,
  cancelSubscription,
  expireSubscription
} from '@/lib/subscription/subscription-service'
import { db } from '@/lib/db'
import { paymentLogger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get headers for signature verification
    const xSignature = request.headers.get('x-signature')
    const xRequestId = request.headers.get('x-request-id')

    // MercadoPago webhook types:
    // - payment: Payment notifications
    // - subscription_preapproval: Subscription lifecycle events (authorized, paused, cancelled)
    // - merchant_order: Order notifications

    if (body.type === 'payment') {
      return handlePaymentWebhook(body, xSignature, xRequestId)
    }

    if (body.type === 'subscription_preapproval') {
      return handleSubscriptionWebhook(body, xSignature, xRequestId)
    }

    // Handle other notification types
    if (body.type === 'merchant_order') {
      // Merchant order notifications - usually not needed for simple payments
      return NextResponse.json({ received: true, type: 'merchant_order' })
    }

    // Unknown type - acknowledge receipt
    paymentLogger.info(`Webhook received unknown type: ${body.type || 'unknown'}`)
    return NextResponse.json({ received: true, type: body.type || 'unknown' })

  } catch (error) {
    paymentLogger.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ─── Payment Webhook Handler ────────────────────────────────────────────────

async function handlePaymentWebhook(
  body: Record<string, unknown>,
  xSignature: string | null,
  xRequestId: string | null
) {
  const paymentId = (body.data as Record<string, unknown>)?.id?.toString()

  if (!paymentId) {
    return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 })
  }

  // Verify signature
  if (!verifyWebhookSignature(xSignature, xRequestId, paymentId)) {
    paymentLogger.error('Invalid webhook signature for payment:', paymentId)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Get payment details from MercadoPago
  const paymentInfo = await getPaymentInfo(paymentId)

  if (!paymentInfo) {
    paymentLogger.error('Could not fetch payment info:', paymentId)
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  // Only process approved payments
  if (paymentInfo.status !== 'approved') {
    paymentLogger.info(`Payment ${paymentId} status: ${paymentInfo.status}`)
    return NextResponse.json({ received: true, status: paymentInfo.status })
  }

  // Parse organization and plan info from external reference
  const parsed = parseExternalReference(paymentInfo.external_reference)

  if (!parsed) {
    paymentLogger.error('Invalid external reference:', paymentInfo.external_reference)
    return NextResponse.json({ error: 'Invalid reference' }, { status: 400 })
  }

  // Check if already processed (idempotency)
  const existingLog = await db.subscriptionLog.findFirst({
    where: {
      organizationId: parsed.organizationId,
      transactionId: paymentId
    }
  })

  if (existingLog) {
    paymentLogger.info(`Payment ${paymentId} already processed`)
    return NextResponse.json({ received: true, already_processed: true })
  }

  // Get organization
  const org = await db.organization.findUnique({
    where: { id: parsed.organizationId }
  })

  if (!org) {
    paymentLogger.error('Organization not found:', parsed.organizationId)
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  // Process subscription using plan info from external_reference
  const amount = paymentInfo.transaction_amount
  const targetPlan = parsed.targetPlan

  const isPaidPlan = org.plan === 'premium' || org.plan === 'entrepreneur'
  if (isPaidPlan && org.planStatus === 'active') {
    await renewSubscription(parsed.organizationId, paymentId, amount, targetPlan)
    paymentLogger.info(`Subscription renewed for org ${parsed.organizationId} (${targetPlan})`)
  } else {
    await upgradeToPremium(parsed.organizationId, paymentId, amount, targetPlan)
    paymentLogger.info(`Subscription created for org ${parsed.organizationId} (${targetPlan})`)
  }

  return NextResponse.json({
    received: true,
    processed: true,
    organizationId: parsed.organizationId
  })
}

// ─── Subscription Preapproval Webhook Handler ───────────────────────────────

async function handleSubscriptionWebhook(
  body: Record<string, unknown>,
  xSignature: string | null,
  xRequestId: string | null
) {
  const subscriptionId = (body.data as Record<string, unknown>)?.id?.toString()

  if (!subscriptionId) {
    return NextResponse.json({ error: 'Missing subscription ID' }, { status: 400 })
  }

  // Verify signature
  if (!verifyWebhookSignature(xSignature, xRequestId, subscriptionId)) {
    paymentLogger.error('Invalid webhook signature for subscription:', subscriptionId)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Get subscription details from MercadoPago
  const subscriptionInfo = await getSubscriptionInfo(subscriptionId)

  if (!subscriptionInfo) {
    paymentLogger.error('Could not fetch subscription info:', subscriptionId)
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
  }

  paymentLogger.info(`Subscription ${subscriptionId} status: ${subscriptionInfo.status}`)

  // Find organization using external_reference (most reliable)
  let org = null
  let parsed = null

  if (subscriptionInfo.external_reference) {
    parsed = parseExternalReference(subscriptionInfo.external_reference)
    if (parsed) {
      org = await db.organization.findUnique({ where: { id: parsed.organizationId } })
    }
  }

  // Fallback: Find organization by payer email
  if (!org && subscriptionInfo.payer_email) {
    org = await db.organization.findUnique({ where: { email: subscriptionInfo.payer_email } })
  }

  if (!org) {
    paymentLogger.warn(`No organization found for subscription ${subscriptionId} (reference: ${subscriptionInfo.external_reference}, email: ${subscriptionInfo.payer_email})`)
    return NextResponse.json({ received: true, no_org: true })
  }

  // Handle subscription status changes
  switch (subscriptionInfo.status) {
    case 'cancelled':
      if (org.planStatus === 'active' || org.planStatus === 'trial') {
        await cancelSubscription(org.id)
        paymentLogger.info(`Subscription cancelled via MP for org ${org.id}`)
      }
      break

    case 'paused':
      // Paused subscriptions: mark as cancelled (will expire at period end)
      if (org.planStatus === 'active') {
        await cancelSubscription(org.id)
        paymentLogger.info(`Subscription paused via MP for org ${org.id}`)
      }
      break

    case 'authorized':
      // Subscription activated - ensure org is upgraded
      if (parsed) {
        const isCorrectPlan = org.plan === parsed.targetPlan && org.planStatus === 'active'
        if (!isCorrectPlan) {
          await upgradeToPremium(org.id, subscriptionId, subscriptionInfo.transaction_amount, parsed.targetPlan)
          paymentLogger.info(`Subscription activated via webhook for org ${org.id} (${parsed.targetPlan})`)
        }
      } else {
        paymentLogger.info(`Subscription authorized for org ${org.id}, but no target plan info in reference`)
      }
      break

    default:
      paymentLogger.info(`Unhandled subscription status: ${subscriptionInfo.status}`)
  }

  return NextResponse.json({
    received: true,
    processed: true,
    status: subscriptionInfo.status
  })
}

// Health check for webhook URL
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'mercadopago-webhook',
    timestamp: new Date().toISOString()
  })
}
