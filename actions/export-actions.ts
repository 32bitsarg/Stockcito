"use server"

import { getSession } from "@/actions/auth-actions"
import { UsageTracker } from "@/lib/subscription/usage-tracker"
import { db } from "@/lib/db"

export type ExportFormat = "csv" | "excel"

interface ExportColumn {
  key: string
  header: string
  formatter?: (value: any) => string
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function generateCSV(data: any[], columns: ExportColumn[]): string {
  const headers = columns.map(col => escapeCSV(col.header)).join(',')
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col.key]
      const formatted = col.formatter ? col.formatter(value) : String(value ?? '')
      return escapeCSV(formatted)
    }).join(',')
  )
  return [headers, ...rows].join('\n')
}

export async function exportProducts(format: ExportFormat = "csv") {
  const session = await getSession()
  if (!session?.organizationId) {
    throw new Error('No autorizado')
  }
  
  const tracker = new UsageTracker(session.organizationId)
  const hasFeature = await tracker.hasFeature("excelExport")
  if (!hasFeature) {
    throw new Error('La exportación requiere plan Premium')
  }
  
  const products = await db.product.findMany({
    where: { organizationId: session.organizationId },
    include: { category: true },
    orderBy: { name: 'asc' }
  })
  
  const columns: ExportColumn[] = [
    { key: 'id', header: 'ID' },
    { key: 'sku', header: 'SKU' },
    { key: 'name', header: 'Nombre' },
    { key: 'categoryName', header: 'Categoría' },
    { key: 'price', header: 'Precio', formatter: (v) => formatCurrency(Number(v)) },
    { key: 'cost', header: 'Costo', formatter: (v) => formatCurrency(Number(v)) },
    { key: 'stock', header: 'Stock' },
    { key: 'minStock', header: 'Stock Mínimo' },
    { key: 'taxRate', header: 'Alícuota IVA', formatter: (v) => `${Number(v)}%` },
    { key: 'createdAt', header: 'Creado', formatter: (v) => formatDate(new Date(v)) },
  ]
  
  const data = products.map(p => ({
    ...p,
    categoryName: p.category?.name || 'Sin categoría',
    price: Number(p.price),
    cost: Number(p.cost),
    taxRate: Number(p.taxRate || 0)
  }))
  
  const csv = generateCSV(data, columns)
  return { 
    data: csv, 
    filename: `productos_${formatDate(new Date())}.csv`,
    mimeType: 'text/csv'
  }
}

export async function exportClients(format: ExportFormat = "csv") {
  const session = await getSession()
  if (!session?.organizationId) {
    throw new Error('No autorizado')
  }
  
  const tracker = new UsageTracker(session.organizationId)
  const hasFeature = await tracker.hasFeature("excelExport")
  if (!hasFeature) {
    throw new Error('La exportación requiere plan Premium')
  }
  
  const clients = await db.client.findMany({
    where: { organizationId: session.organizationId },
    include: { _count: { select: { sales: true } } },
    orderBy: { name: 'asc' }
  })
  
  const columns: ExportColumn[] = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Teléfono' },
    { key: 'address', header: 'Dirección' },
    { key: 'taxId', header: 'CUIT/DNI' },
    { key: 'salesCount', header: 'Total Compras' },
    { key: 'createdAt', header: 'Cliente desde', formatter: (v) => formatDate(new Date(v)) },
  ]
  
  const data = clients.map(c => ({
    ...c,
    salesCount: c._count.sales
  }))
  
  const csv = generateCSV(data, columns)
  return { 
    data: csv, 
    filename: `clientes_${formatDate(new Date())}.csv`,
    mimeType: 'text/csv'
  }
}

export async function exportSales(
  startDate?: Date, 
  endDate?: Date, 
  format: ExportFormat = "csv"
) {
  const session = await getSession()
  if (!session?.organizationId) {
    throw new Error('No autorizado')
  }
  
  const tracker = new UsageTracker(session.organizationId)
  const hasFeature = await tracker.hasFeature("excelExport")
  if (!hasFeature) {
    throw new Error('La exportación requiere plan Premium')
  }
  
  const where: any = { organizationId: session.organizationId }
  if (startDate || endDate) {
    where.date = {}
    if (startDate) where.date.gte = startDate
    if (endDate) where.date.lte = endDate
  }
  
  const sales = await db.sale.findMany({
    where,
    include: { 
      client: true,
      items: { include: { product: true } }
    },
    orderBy: { date: 'desc' }
  })
  
  const columns: ExportColumn[] = [
    { key: 'id', header: 'ID Venta' },
    { key: 'date', header: 'Fecha', formatter: (v) => formatDate(new Date(v)) },
    { key: 'clientName', header: 'Cliente' },
    { key: 'itemsCount', header: 'Cant. Items' },
    { key: 'subtotal', header: 'Subtotal', formatter: (v) => formatCurrency(Number(v)) },
    { key: 'discountAmount', header: 'Descuento', formatter: (v) => formatCurrency(Number(v || 0)) },
    { key: 'taxAmount', header: 'IVA', formatter: (v) => formatCurrency(Number(v)) },
    { key: 'total', header: 'Total', formatter: (v) => formatCurrency(Number(v)) },
    { key: 'paymentMethod', header: 'Método Pago' },
    { key: 'status', header: 'Estado' },
  ]
  
  const data = sales.map(s => ({
    ...s,
    clientName: s.client?.name || 'Consumidor Final',
    itemsCount: s.items.length,
    subtotal: Number(s.subtotal),
    discountAmount: Number(s.discountAmount || 0),
    taxAmount: Number(s.taxAmount),
    total: Number(s.total)
  }))
  
  const csv = generateCSV(data, columns)
  const dateRange = startDate && endDate 
    ? `${formatDate(startDate)}_${formatDate(endDate)}` 
    : formatDate(new Date())
    
  return { 
    data: csv, 
    filename: `ventas_${dateRange}.csv`,
    mimeType: 'text/csv'
  }
}

export async function exportSalesDetail(
  startDate?: Date, 
  endDate?: Date, 
  format: ExportFormat = "csv"
) {
  const session = await getSession()
  if (!session?.organizationId) {
    throw new Error('No autorizado')
  }
  
  const tracker = new UsageTracker(session.organizationId)
  const hasFeature = await tracker.hasFeature("excelExport")
  if (!hasFeature) {
    throw new Error('La exportación requiere plan Premium')
  }
  
  const where: any = { organizationId: session.organizationId }
  if (startDate || endDate) {
    where.date = {}
    if (startDate) where.date.gte = startDate
    if (endDate) where.date.lte = endDate
  }
  
  const sales = await db.sale.findMany({
    where,
    include: { 
      client: true,
      items: { include: { product: true } }
    },
    orderBy: { date: 'desc' }
  })
  
  const columns: ExportColumn[] = [
    { key: 'saleId', header: 'ID Venta' },
    { key: 'date', header: 'Fecha' },
    { key: 'clientName', header: 'Cliente' },
    { key: 'productSku', header: 'SKU' },
    { key: 'productName', header: 'Producto' },
    { key: 'quantity', header: 'Cantidad' },
    { key: 'unitPrice', header: 'Precio Unit.', formatter: (v) => formatCurrency(Number(v)) },
    { key: 'discountAmount', header: 'Descuento', formatter: (v) => formatCurrency(Number(v || 0)) },
    { key: 'taxAmount', header: 'IVA', formatter: (v) => formatCurrency(Number(v || 0)) },
    { key: 'subtotal', header: 'Subtotal', formatter: (v) => formatCurrency(Number(v)) },
  ]
  
  const data: any[] = []
  for (const sale of sales) {
    for (const item of sale.items) {
      data.push({
        saleId: sale.id,
        date: formatDate(sale.date),
        clientName: sale.client?.name || 'Consumidor Final',
        productSku: item.product.sku || '-',
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        discountAmount: Number(item.discountAmount || 0),
        taxAmount: Number(item.taxAmount || 0),
        subtotal: Number(item.subtotal)
      })
    }
  }
  
  const csv = generateCSV(data, columns)
  const dateRange = startDate && endDate 
    ? `${formatDate(startDate)}_${formatDate(endDate)}` 
    : formatDate(new Date())
    
  return { 
    data: csv, 
    filename: `ventas_detalle_${dateRange}.csv`,
    mimeType: 'text/csv'
  }
}

export async function exportInventoryReport(format: ExportFormat = "csv") {
  const session = await getSession()
  if (!session?.organizationId) {
    throw new Error('No autorizado')
  }
  
  const tracker = new UsageTracker(session.organizationId)
  const hasFeature = await tracker.hasFeature("excelExport")
  if (!hasFeature) {
    throw new Error('La exportación requiere plan Premium')
  }
  
  const products = await db.product.findMany({
    where: { organizationId: session.organizationId },
    include: { category: true },
    orderBy: { stock: 'asc' }
  })
  
  const columns: ExportColumn[] = [
    { key: 'sku', header: 'SKU' },
    { key: 'name', header: 'Producto' },
    { key: 'categoryName', header: 'Categoría' },
    { key: 'stock', header: 'Stock Actual' },
    { key: 'minStock', header: 'Stock Mínimo' },
    { key: 'status', header: 'Estado' },
    { key: 'cost', header: 'Costo', formatter: (v) => formatCurrency(Number(v)) },
    { key: 'price', header: 'Precio', formatter: (v) => formatCurrency(Number(v)) },
    { key: 'inventoryValue', header: 'Valor Inventario', formatter: (v) => formatCurrency(Number(v)) },
  ]
  
  const data = products.map(p => {
    const stock = p.stock
    const minStock = p.minStock
    let status = 'OK'
    if (stock <= 0) status = 'SIN STOCK'
    else if (stock <= minStock) status = 'BAJO'
    
    return {
      sku: p.sku || '-',
      name: p.name,
      categoryName: p.category?.name || 'Sin categoría',
      stock,
      minStock,
      status,
      cost: Number(p.cost),
      price: Number(p.price),
      inventoryValue: Number(p.cost) * stock
    }
  })
  
  const csv = generateCSV(data, columns)
  return { 
    data: csv, 
    filename: `inventario_${formatDate(new Date())}.csv`,
    mimeType: 'text/csv'
  }
}
