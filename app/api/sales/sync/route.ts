import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/actions/auth-actions'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import Decimal from 'decimal.js'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || !session.organizationId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      offlineSaleId,
      items,
      clientId,
      paymentMethod,
      paymentDetails,
      discount,
      notes,
      createdAt,
      isOffline
    } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items requeridos' },
        { status: 400 }
      )
    }

    // Validate products exist and have sufficient stock
    const productIds = items.map((item: any) => item.productId)
    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
        organizationId: session.organizationId
      }
    })

    const productMap = new Map(products.map(p => [p.id, p]))
    const stockIssues: string[] = []

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        stockIssues.push(`Producto ${item.productId} no encontrado`)
        continue
      }
      if (product.stock < item.quantity) {
        stockIssues.push(`${product.name}: stock insuficiente (disponible: ${product.stock}, requerido: ${item.quantity})`)
      }
    }

    // For offline sales, we log stock issues but still process the sale
    // (to avoid losing sales data - stock adjustments can be made later)
    if (stockIssues.length > 0 && !isOffline) {
      return NextResponse.json(
        { error: 'Problemas de stock', details: stockIssues },
        { status: 400 }
      )
    }

    // Calculate totals
    let subtotal = new Decimal(0)
    let totalTax = new Decimal(0)
    let totalDiscount = new Decimal(0)

    const saleItems = items.map((item: any) => {
      const product = productMap.get(item.productId)
      const price = new Decimal(item.price || product?.price || 0)
      const quantity = new Decimal(item.quantity)
      const taxRate = new Decimal(item.taxRate || product?.taxRate || 21)
      const itemDiscount = new Decimal(item.discountAmount || 0)

      const lineTotal = price.times(quantity)
      const lineTax = lineTotal.minus(itemDiscount).times(taxRate).dividedBy(100)
      const lineSubtotal = lineTotal.minus(itemDiscount)
      
      subtotal = subtotal.plus(lineTotal)
      totalTax = totalTax.plus(lineTax)
      totalDiscount = totalDiscount.plus(itemDiscount)

      return {
        productId: item.productId,
        quantity: quantity.toNumber(),
        unitPrice: price,
        taxRate: taxRate,
        taxAmount: lineTax,
        discountAmount: itemDiscount,
        subtotal: lineSubtotal
      }
    })

    // Apply global discount
    if (discount) {
      totalDiscount = totalDiscount.plus(new Decimal(discount))
    }

    const total = subtotal.minus(totalDiscount).plus(totalTax)

    // Create sale in transaction
    const sale = await db.$transaction(async (tx) => {
      // Create the sale
      const newSale = await tx.sale.create({
        data: {
          organizationId: session.organizationId!,
          userId: session.id,
          clientId: clientId || null,
          subtotal: subtotal,
          taxAmount: totalTax,
          discountAmount: totalDiscount,
          total: total,
          paymentMethod: paymentMethod || 'efectivo',
          status: 'completed',
          items: {
            create: saleItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate,
              taxAmount: item.taxAmount,
              discountAmount: item.discountAmount,
              subtotal: item.subtotal
            }))
          }
        }
      })

      // Update stock for each product
      for (const item of items) {
        const product = productMap.get(item.productId)
        if (product) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          })
        }
      }

      // Log audit
      await tx.auditLog.create({
        data: {
          organizationId: session.organizationId,
          userId: session.id,
          action: 'create',
          entity: 'sale',
          entityId: newSale.id,
          details: isOffline 
            ? `Venta offline sincronizada. ID offline: ${offlineSaleId}`
            : null
        }
      })

      return newSale
    })

    // Revalidate relevant paths
    revalidatePath('/dashboard')
    revalidatePath('/sales')
    revalidatePath('/inventory')

    return NextResponse.json({
      success: true,
      saleId: sale.id,
      offlineSaleId: offlineSaleId,
      total: total.toNumber(),
      stockWarnings: stockIssues.length > 0 ? stockIssues : undefined
    })

  } catch (error) {
    console.error('Sync sale error:', error)
    return NextResponse.json(
      { error: 'Error al sincronizar venta' },
      { status: 500 }
    )
  }
}
