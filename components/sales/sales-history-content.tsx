"use client"

import { useOfflineData } from "@/hooks/use-offline-data"
import { getRecentSales } from "@/actions/dashboard-actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OfflineDataBadge } from "@/components/offline/offline-data-badge"
import { PageHeader } from "@/components/layout/page-header"
import * as motion from "framer-motion/client"
import { Loader2, ShoppingBag } from "lucide-react"

/**
 * Historial de Ventas - Client Component con soporte offline.
 * 
 * SEGURIDAD:
 * - getRecentSales() valida organizationId en el server action.
 * - No se cachean datos sensibles de clientes (solo nombre).
 * - El caché se limpia al cerrar sesión.
 */
export function SalesHistoryContent() {
    const { data: sales, isOfflineData, dataUpdatedAt, isLoading } = useOfflineData(
        ['salesHistory'],
        () => getRecentSales(50),
        { staleTime: 1000 * 60 * 2 } // 2 min fresh, ventas cambian frecuentemente
    )

    if (isLoading && !sales) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                <p className="text-sm text-zinc-500">Cargando historial...</p>
            </div>
        )
    }

    return (
        <div className="pb-10">
            <PageHeader
                title="Historial de Ventas"
                subtitle="Registro de transacciones y movimientos comerciales."
            >
                <OfflineDataBadge isOfflineData={isOfflineData} dataUpdatedAt={dataUpdatedAt} />
            </PageHeader>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Fecha</TableHead>
                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Cliente</TableHead>
                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Total</TableHead>
                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!sales || sales.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-48 text-zinc-500">
                                        <div className="flex flex-col items-center justify-center opacity-40">
                                            <ShoppingBag className="h-12 w-12 mb-4" />
                                            <p className="font-black uppercase tracking-widest text-xs">
                                                No hay ventas registradas
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sales.map((sale: any) => (
                                    <TableRow key={sale.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                                        <TableCell className="font-mono text-xs text-zinc-500">
                                            {new Date(sale.date || sale.createdAt).toLocaleDateString('es-AR')} {new Date(sale.date || sale.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                        </TableCell>
                                        <TableCell className="font-medium text-zinc-700 dark:text-zinc-300">
                                            {sale.client?.name || "Consumidor Final"}
                                        </TableCell>
                                        <TableCell className="font-mono font-black text-zinc-900 dark:text-zinc-100 italic">
                                            ${Number(sale.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell>
                                            <span className="capitalize text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                                                {sale.status || 'completed'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </motion.div>
        </div>
    )
}
