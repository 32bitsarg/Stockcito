"use client"

import type { Sale, Organization, SaleItem } from "@prisma/client"
import { formatCurrency } from "@/lib/utils"

// Extend SaleItem to include productName if not in type definition yet (handled at runtime)
type ExtendedSaleItem = SaleItem & { productName?: string | null; product?: { name: string } }

interface TicketReceiptProps {
    sale: Sale & { items?: ExtendedSaleItem[]; client?: { name: string; taxId?: string } | null; ticketNumber?: string | null }
    organization: Organization | null
}

export function TicketReceipt({ sale, organization }: TicketReceiptProps) {
    if (!sale || !organization) return null

    return (
        <div className="ticket-content text-black">
            {/* Header */}
            <div className="text-center mb-4">
                {organization.logo && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={organization.logo} alt="Logo" className="mx-auto h-12 mb-2 grayscale" />
                )}
                <h1 className="font-bold text-lg uppercase">{organization.name}</h1>
                <p>{organization.address}</p>
                <p>{organization.phone}</p>
                {organization.taxId && <p>CUIT: {organization.taxId}</p>}
            </div>

            <div className="border-b-2 border-dashed border-black my-2" />

            {/* Sale Info */}
            <div className="mb-2">
                <p>
                    <span className="font-bold">Ticket:</span> {sale.ticketNumber || `#${sale.id}`}
                </p>
                <p>Fecha: {new Date(sale.date).toLocaleString('es-AR')}</p>
                {sale.client && (
                    <div className="mt-1">
                        <p>Cliente: {sale.client.name}</p>
                        {sale.client.taxId && <p>DNI/CUIT: {sale.client.taxId}</p>}
                    </div>
                )}
            </div>

            <div className="border-b border-dashed border-black my-2" />

            {/* Items */}
            <table className="w-full text-left">
                <thead>
                    <tr className="uppercase text-[10px]">
                        <th className="w-[50%]">Prod</th>
                        <th className="text-right">Cant</th>
                        <th className="text-right">$$</th>
                    </tr>
                </thead>
                <tbody>
                    {(sale.items ?? []).map((item) => (
                        <tr key={item.id} className="align-top">
                            <td className="pr-1 py-1">
                                {item.productName || item.product?.name || "Item"}
                            </td>
                            <td className="text-right py-1">x{item.quantity}</td>
                            <td className="text-right py-1">
                                {formatCurrency(Number(item.subtotal))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="border-b-2 border-dashed border-black my-2" />

            {/* Totals */}
            <div className="text-right space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(Number(sale.subtotal))}</span>
                </div>

                {Number(sale.discountAmount) > 0 && (
                    <div className="flex justify-between font-bold">
                        <span>Descuento</span>
                        <span>-{formatCurrency(Number(sale.discountAmount))}</span>
                    </div>
                )}

                <div className="flex justify-between text-lg font-bold mt-2">
                    <span>TOTAL</span>
                    <span>{formatCurrency(Number(sale.total))}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-[10px]">
                <p>Forma de pago: {sale.paymentMethod}</p>
                <p className="mt-2 text-[8px] uppercase">
                    Documento no válido como factura
                </p>
                <p className="mt-1">¡Gracias por su compra!</p>
            </div>
        </div>
    )
}
