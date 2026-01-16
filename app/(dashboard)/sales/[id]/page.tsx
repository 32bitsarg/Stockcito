import { getSaleById } from "@/actions/sale-actions"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, User, Calendar, Receipt, FileText, Ban, RotateCcw } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CancelSaleButton } from "@/components/sales/cancel-sale-button"
import { RefundSaleButton } from "@/components/sales/refund-sale-button"

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sale = await getSaleById(parseInt(id))

  if (!sale) {
    notFound()
  }

  const statusColors: Record<string, string> = {
    completed: 'bg-green-600',
    pending: 'bg-yellow-600',
    cancelled: 'bg-red-600',
    refunded: 'bg-orange-600'
  }

  const statusLabels: Record<string, string> = {
    completed: 'Completada',
    pending: 'Pendiente',
    cancelled: 'Cancelada',
    refunded: 'Devuelta'
  }

  // Calculate total refunded
  const totalRefunded = sale.creditNotes.reduce((acc, cn) => acc + Number(cn.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/sales/history">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Venta #{sale.id}</h1>
              <Badge className={statusColors[sale.status]}>
                {statusLabels[sale.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {format(sale.date, "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
            </p>
          </div>
        </div>

        {sale.status === 'completed' && (
          <div className="flex gap-2">
            <RefundSaleButton sale={sale} />
            <CancelSaleButton saleId={sale.id} />
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" /> Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sale.client ? (
              <div>
                <div className="font-medium">{sale.client.name}</div>
                {sale.client.email && <div className="text-sm text-muted-foreground">{sale.client.email}</div>}
                {sale.client.taxId && <div className="text-sm text-muted-foreground">CUIT: {sale.client.taxId}</div>}
              </div>
            ) : (
              <span className="text-muted-foreground">Consumidor final</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Receipt className="h-4 w-4" /> Resumen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${Number(sale.subtotal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>IVA:</span>
              <span>${Number(sale.taxAmount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            {Number(sale.discountAmount) > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuento:</span>
                <span>-${Number(sale.discountAmount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>${Number(sale.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            {totalRefunded > 0 && (
              <div className="flex justify-between text-sm text-orange-600">
                <span>Devuelto:</span>
                <span>-${totalRefunded.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" /> Facturación
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sale.invoice ? (
              <div className="space-y-1">
                <div className="font-medium">Factura {sale.invoice.type}</div>
                {sale.invoice.number && (
                  <div className="text-sm text-muted-foreground">
                    PV {sale.invoice.pointOfSale?.toString().padStart(4, '0')}-{sale.invoice.number.toString().padStart(8, '0')}
                  </div>
                )}
                {sale.invoice.cae && (
                  <div className="text-sm text-muted-foreground">CAE: {sale.invoice.cae}</div>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">Sin factura emitida</span>
            )}
          </CardContent>
        </Card>
      </div>

      {sale.cancelReason && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Ban className="h-4 w-4" /> Motivo de cancelación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{sale.cancelReason}</p>
            {sale.refundedAt && (
              <p className="text-sm text-muted-foreground mt-2">
                Cancelada el {format(sale.refundedAt, "dd/MM/yyyy HH:mm", { locale: es })}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
          <CardDescription>{sale.items.length} producto(s) en esta venta</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Precio Unit. (Final)</TableHead>
                <TableHead className="text-right">Cant.</TableHead>
                <TableHead className="text-right">IVA</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.product.name}</div>
                      {item.product.sku && (
                        <div className="text-xs text-muted-foreground">SKU: {item.product.sku}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    ${Number(item.unitPrice).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {Number(item.taxRate)}% (${Number(item.taxAmount).toLocaleString('es-AR', { minimumFractionDigits: 2 })})
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${Number(item.subtotal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {sale.creditNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" /> Notas de Crédito
            </CardTitle>
            <CardDescription>{sale.creditNotes.length} nota(s) de crédito emitidas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.creditNotes.map((cn) => (
                  <TableRow key={cn.id}>
                    <TableCell>NC-{cn.id}</TableCell>
                    <TableCell>{format(cn.issuedAt, "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                    <TableCell>
                      <Badge variant={cn.type === 'full' ? 'destructive' : 'secondary'}>
                        {cn.type === 'full' ? 'Completa' : 'Parcial'}
                      </Badge>
                    </TableCell>
                    <TableCell>{cn.reason}</TableCell>
                    <TableCell className="text-right font-medium text-orange-600">
                      -${Number(cn.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
