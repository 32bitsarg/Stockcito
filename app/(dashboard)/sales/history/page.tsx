import { getSalesHistoryAll } from "@/actions/sales-history-actions"
import { SalesHistoryTable } from "@/components/sales/sales-history-table"
import { SalesFilters } from "@/components/sales/sales-filters"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportButton } from "@/components/export-button"
import { format } from "date-fns"

export default async function SalesHistoryPage({
    searchParams,
}: {
    searchParams: Promise<{
        startDate?: string
        endDate?: string
        clientId?: string
    }>
}) {
    const params = await searchParams
    const filters = {
        startDate: params.startDate ? new Date(params.startDate) : undefined,
        endDate: params.endDate ? new Date(params.endDate) : undefined,
        clientId: params.clientId ? parseInt(params.clientId) : undefined,
    }

    const sales = await getSalesHistoryAll(filters)

    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const totalSales = sales.length

    // Preparar datos para exportación
    const exportData = sales.map(sale => ({
        ID: sale.id,
        Fecha: format(new Date(sale.date), 'dd/MM/yyyy HH:mm'),
        Cliente: sale.client?.name || 'Consumidor Final',
        'Cantidad Items': sale.items.length,
        Subtotal: Number(sale.subtotal || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
        IVA: Number(sale.taxAmount || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
        Total: Number(sale.total).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
        Estado: sale.status
    }))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Historial de Ventas</h1>
                    <p className="text-muted-foreground">
                        Consulta y filtra todas las ventas realizadas
                    </p>
                </div>
                <ExportButton data={exportData} filename="ventas" label="Exportar Ventas" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Total Ventas</CardTitle>
                        <CardDescription>Cantidad de ventas en el período</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalSales}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Ingresos Totales</CardTitle>
                        <CardDescription>Suma de todas las ventas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                            ${totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <SalesFilters />

            <SalesHistoryTable sales={sales} />
        </div>
    )
}
