import { NextRequest, NextResponse } from 'next/server'
import { 
  getPaymentInfo, 
  parseExternalReference, 
  verifyWebhookSignature 
} from '@/lib/payments/mercadopago'
import { 
  upgradeToPremium, 
  renewSubscription 
} from '@/lib/subscription/subscription-service'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get headers for signature verification
    const xSignature = request.headers.get('x-signature')
    const xRequestId = request.headers.get('x-request-id')

    // MercadoPago webhook types
    // payment: Payment notifications
    // merchant_order: Order notifications
    
    if (body.type === 'payment') {
      const paymentId = body.data?.id?.toString()
      
      if (!paymentId) {
        return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 })
      }

      // Verify signature
      if (!verifyWebhookSignature(xSignature, xRequestId, paymentId)) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }

      // Get payment details from MercadoPago
      const paymentInfo = await getPaymentInfo(paymentId)
      
      if (!paymentInfo) {
        console.error('Could not fetch payment info:', paymentId)
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
      }

      // Only process approved payments
      if (paymentInfo.status !== 'approved') {
        console.log(`Payment ${paymentId} status: ${paymentInfo.status}`)
        return NextResponse.json({ received: true, status: paymentInfo.status })
      }

      // Parse organization from external reference
      const parsed = parseExternalReference(paymentInfo.external_reference)
      
      if (!parsed) {
        console.error('Invalid external reference:', paymentInfo.external_reference)
        return NextResponse.json({ error: 'Invalid reference' }, { status: 400 })
      }

      // Check if already processed
      const existingLog = await db.subscriptionLog.findFirst({
        where: {
          organizationId: parsed.organizationId,
          transactionId: paymentId
        }
      })

      if (existingLog) {
        console.log(`Payment ${paymentId} already processed`)
        return NextResponse.json({ received: true, already_processed: true })
      }

      // Get organization
      const org = await db.organization.findUnique({
        where: { id: parsed.organizationId }
      })

      if (!org) {
        console.error('Organization not found:', parsed.organizationId)
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
      }

      // Process subscription
      const amount = paymentInfo.transaction_amount

      if (org.plan === 'premium' && org.planStatus === 'active') {
        await renewSubscription(parsed.organizationId, paymentId, amount)
        console.log(`Subscription renewed for org ${parsed.organizationId}`)
      } else {
        await upgradeToPremium(parsed.organizationId, paymentId, amount)
        console.log(`Subscription created for org ${parsed.organizationId}`)
      }

      return NextResponse.json({ 
        received: true, 
        processed: true,
        organizationId: parsed.organizationId 
      })
    }

    // Handle other notification types
    if (body.type === 'merchant_order') {
      // Merchant order notifications - usually not needed for simple payments
      return NextResponse.json({ received: true, type: 'merchant_order' })
    }

    // Unknown type
    return NextResponse.json({ received: true, type: body.type || 'unknown' })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Health check for webhook URL
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'mercadopago-webhook',
    timestamp: new Date().toISOString()
  })
}
