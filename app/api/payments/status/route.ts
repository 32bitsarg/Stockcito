import { NextRequest, NextResponse } from 'next/server'
import { getPaymentInfo, parseExternalReference } from '@/lib/payments/mercadopago'
import { getSession } from '@/actions/auth-actions'

export async function GET(request: NextRequest) {
  // Require authentication to prevent unauthorized payment status lookups
  const session = await getSession()
  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const paymentId = searchParams.get('payment_id')

  if (!paymentId) {
    return NextResponse.json(
      { error: 'payment_id is required' },
      { status: 400 }
    )
  }

  try {
    // Get payment info from MercadoPago
    const paymentInfo = await getPaymentInfo(paymentId)

    if (!paymentInfo) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Parse external reference to get organization ID
    const parsedRef = parseExternalReference(paymentInfo.external_reference)

    // Return status info
    return NextResponse.json({
      status: paymentInfo.status,
      statusDetail: paymentInfo.status_detail,
      amount: paymentInfo.transaction_amount,
      dateApproved: paymentInfo.date_approved,
      organizationId: parsedRef?.organizationId || null
    })
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    )
  }
}
