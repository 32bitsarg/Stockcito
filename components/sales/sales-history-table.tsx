"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, ExternalLink, FileText } from "lucide-react"
import { generateInvoicePdf } from '@/actions/invoice-actions'
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useState } from "react"
import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface SalesHistoryTableProps {
    sales: Array<{
        id: number
        date: Date
        total: any
        subtotal: any
        taxAmount: any
        status?: string
        client: {
            name: string
        } | null
        items: Array<{
            quantity: number
            unitPrice?: any
            price?: any
            subtotal: any
            product: {
                name: string
            }
        }>
        user?: {
            name: string
        } | null
    }>
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'CANCELLED':
            return <Badge variant="destructive">Anulada</Badge>
        case 'REFUNDED':
            return <Badge variant="outline" className="text-orange-500 border-orange-500">Reembolsada</Badge>
        case 'PARTIAL_REFUND':
            return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Reemb. Parcial</Badge>
        case 'COMPLETED':
        default:
            return <Badge variant="secondary" className="text-green-600 border-green-600">Completada</Badge>
    }
}

export function SalesHistoryTable({ sales }: SalesHistoryTableProps) {
    const [selectedSale, setSelectedSale] = useState<typeof sales[0] | null>(null)

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Ventas Registradas</CardTitle>
                </CardHeader>
                <CardContent>
                    {sales.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No se encontraron ventas con los filtros aplicados
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Vendedor</TableHead>
                                        <TableHead>Productos</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sales.map((sale) => (
                                        <TableRow key={sale.id}>
                                            <TableCell className="font-medium">#{sale.id}</TableCell>
                                            <TableCell>
                                                {format(new Date(sale.date), "dd MMM yyyy HH:mm", { locale: es })}
                                            </TableCell>
                                            <TableCell>
                                                {sale.client ? (
                                                    sale.client.name
                                                ) : (
                                                    <Badge variant="secondary">Consumidor Final</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {sale.user?.name || <span className="text-muted-foreground text-xs">Sistema</span>}
                                            </TableCell>
                                            <TableCell>{sale.items.length} items</TableCell>
                                            <TableCell>
                                                {getStatusBadge(sale.status || 'COMPLETED')}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-green-600">
                                                ${Number(sale.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="text-right space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedSale(sale)}
                                                    title="Vista rápida"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                    title="Ver detalle completo"
                                                >
                                                    <Link href={`/sales/${sale.id}`}>
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalle de Venta #{selectedSale?.id}</DialogTitle>
                        <DialogDescription>
                            {selectedSale && format(new Date(selectedSale.date), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSale && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                                    <p className="text-base font-semibold">
                                        {selectedSale.client?.name || "Consumidor Final"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Vendedor</p>
                                    <p className="text-base font-semibold">
                                        {selectedSale.user?.name || "Sistema"}
                                    </p>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal:</span>
                                        <span>${Number(selectedSale.subtotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">IVA:</span>
                                        <span>${Number(selectedSale.taxAmount || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-1 border-t">
                                        <span>Total:</span>
                                        <span className="text-green-600">${Number(selectedSale.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="pt-2">
                                        <Button variant="default" size="sm" onClick={async () => {
                                            try {
                                                const res = await generateInvoicePdf(selectedSale.id as number)
                                                if (res?.pdf) {
                                                    // Open PDF in new tab
                                                    window.open(res.pdf, '_blank')
                                                }
                                            } catch (e) {
                                                alert('Error generando PDF')
                                            }
                                        }}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Generar comprobante (PDF)
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Productos</p>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Producto</TableHead>
                                                <TableHead className="text-right">Cant.</TableHead>
                                                <TableHead className="text-right">Precio</TableHead>
                                                <TableHead className="text-right">Subtotal</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedSale.items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.product.name}</TableCell>
                                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                                    <TableCell className="text-right">
                                                        ${Number(item.unitPrice ?? item.price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold">
                                                        ${Number(item.subtotal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
