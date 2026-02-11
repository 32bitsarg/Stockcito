import { getSalesHistoryAll } from "@/actions/sales-history-actions"
import { SalesHistoryTable } from "@/components/sales/sales-history-table"
import { SalesFilters } from "@/components/sales/sales-filters"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportButton } from "@/components/export-button"
import { format } from "date-fns"

import { PageHeader } from "@/components/layout/page-header"
import * as motion from "framer-motion/client"
import { DollarSign, Hash } from "lucide-react"

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
        <div className="pb-10">
            <PageHeader
                title="Historial de Ventas"
                subtitle="Consulta y filtra todas las operaciones históricas realizadas."
            >
                <ExportButton data={exportData} filename="ventas" label="Descargar reporte" />
            </PageHeader>

            <div className="grid gap-6 md:grid-cols-2 mb-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden group">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500">Transacciones</CardTitle>
                                <Hash className="h-4 w-4 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors" />
                            </div>
                            <CardDescription className="text-xs font-medium">Volumen total de operaciones</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tighter">
                                {totalSales.toString().padStart(2, '0')}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden group">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500">Recaudación</CardTitle>
                                <DollarSign className="h-4 w-4 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors" />
                            </div>
                            <CardDescription className="text-xs font-medium">Ingresos brutos acumulados</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tighter">
                                ${totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="space-y-6"
            >
                <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <SalesFilters />
                </div>

                <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                    <SalesHistoryTable sales={sales} />
                </div>
            </motion.div>
        </div>
    )
}
