"use server"

import { db } from '@/lib/db'
import { z } from 'zod'
import JsPDF from 'jspdf'
import autotable from 'jspdf-autotable'
import { getSession } from "@/actions/auth-actions"
import { UsageTracker } from "@/lib/subscription/usage-tracker"
import { PLAN_LIMITS } from "@/lib/subscription/plans"
import { APP_VERSION_DISPLAY } from '@/lib/changelog'

export async function checkInvoiceLimit(): Promise<{ canCreate: boolean; remaining: number; limit: number }> {
  const session = await getSession()
  if (!session?.organizationId) {
    return { canCreate: false, remaining: 0, limit: 0 }
  }

  const tracker = new UsageTracker(session.organizationId)
  const usage = await tracker.getUsage()
  const plan = session.plan || 'free'
  const planLimits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]
  const limit = planLimits?.maxInvoicesPerMonth || 50
  const remaining = limit === -1 ? -1 : Math.max(0, limit - usage.invoicesThisMonth)

  return {
    canCreate: limit === -1 || usage.invoicesThisMonth < limit,
    remaining,
    limit
  }
}

export async function generateInvoicePdf(saleId: number) {
  const session = await getSession()
  if (!session?.organizationId) {
    throw new Error('No autorizado')
  }

  // Check if user has premium plan for PDF export
  const tracker = new UsageTracker(session.organizationId)
  const hasFeature = await tracker.hasFeature("pdfExport")
  if (!hasFeature) {
    throw new Error('La exportación a PDF requiere plan Premium')
  }

  const sale = await db.sale.findFirst({
    where: {
      id: saleId,
      organizationId: session.organizationId
    },
    include: { items: { include: { product: true } }, client: true }
  })
  if (!sale) throw new Error('Venta no encontrada')

  // Get organization info for invoice header
  const organization = await db.organization.findUnique({
    where: { id: session.organizationId }
  })

  const doc = new JsPDF()

  // Header with organization info
  doc.setFontSize(16)
  doc.text(organization?.name || 'Stockcito POS', 14, 20)
  doc.setFontSize(10)
  if (organization?.taxId) {
    doc.text(`CUIT: ${organization.taxId}`, 14, 27)
  }

  doc.setFontSize(14)
  doc.text(`Factura - Venta #${sale.id}`, 14, 40)
  doc.setFontSize(10)
  doc.text(`Fecha: ${sale.date.toISOString().split('T')[0]}`, 14, 48)

  if (sale.client) {
    doc.text(`Cliente: ${sale.client.name}`, 14, 55)
    if (sale.client.taxId) {
      doc.text(`CUIT/DNI: ${sale.client.taxId}`, 14, 62)
    }
  }

  const rows = sale.items.map(item => ([
    item.product.name,
    item.quantity.toString(),
    `$${Number(item.unitPrice).toFixed(2)}`,
    item.discountAmount ? `$${Number(item.discountAmount).toFixed(2)}` : '-',
    item.taxAmount ? `$${Number(item.taxAmount).toFixed(2)}` : '-',
    `$${Number(item.subtotal).toFixed(2)}`
  ]))

  // @ts-ignore - plugin augmentation
  autotable(doc as any, {
    startY: sale.client ? 70 : 60,
    head: [['Producto', 'Cant', 'Precio', 'Desc', 'IVA', 'Total']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 9 }
  })

  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable?.finalY || (sale.client ? 70 : 60) + rows.length * 10

  doc.setFontSize(11)
  doc.text(`Subtotal: $${Number(sale.subtotal).toFixed(2)}`, 140, finalY + 10)
  if (sale.discountAmount && Number(sale.discountAmount) > 0) {
    doc.text(`Descuento: -$${Number(sale.discountAmount).toFixed(2)}`, 140, finalY + 17)
  }
  doc.text(`IVA: $${Number(sale.taxAmount).toFixed(2)}`, 140, finalY + 24)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`TOTAL: $${Number(sale.total).toFixed(2)}`, 140, finalY + 33)

  // Footer
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(`Método de pago: ${sale.paymentMethod}`, 14, finalY + 45)
  doc.text(`Documento no válido como factura fiscal - Generado por Stockcito ${APP_VERSION_DISPLAY}`, 14, 285)

  const pdfBase64 = doc.output('datauristring')
  return { pdf: pdfBase64 }
}
