"use client"

import { useOfflineData } from "@/hooks/use-offline-data"
import { getSuppliers } from "@/actions/supplier-actions"
import { OfflineDataBadge } from "@/components/offline/offline-data-badge"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExportButton } from "@/components/export-button"
import { DeleteSupplierButton } from "@/components/suppliers/delete-supplier-button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import * as motion from "framer-motion/client"
import { Plus, Eye, Edit, Building2, Search, Loader2 } from "lucide-react"
import { useState, useMemo } from "react"

export function SuppliersContent() {
    const { data: suppliers, isOfflineData, dataUpdatedAt, isLoading } = useOfflineData(
        ['suppliers'],
        () => getSuppliers()
    )

    const [searchQuery, setSearchQuery] = useState("")

    // Client-side filtering for offline use
    const filteredSuppliers = useMemo(() => {
        if (!suppliers) return []
        if (!searchQuery.trim()) return suppliers
        const q = searchQuery.toLowerCase()
        return suppliers.filter((s: any) =>
            s.name?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q) ||
            s.taxId?.toLowerCase().includes(q) ||
            s.phone?.toLowerCase().includes(q)
        )
    }, [suppliers, searchQuery])

    // Preparar datos para exportación
    const exportData = useMemo(() => {
        return (filteredSuppliers || []).map((s: any) => ({
            ID: s.id,
            Nombre: s.name,
            Email: s.email || '',
            Teléfono: s.phone || '',
            Dirección: s.address || '',
            'CUIT': s.taxId || '',
            'Sitio Web': s.website || '',
            Notas: s.notes || '',
            Productos: s._count?.products ?? 0
        }))
    }, [filteredSuppliers])

    if (isLoading && !suppliers) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                <p className="text-sm text-zinc-500">Cargando proveedores...</p>
            </div>
        )
    }

    return (
        <div className="pb-10">
            <PageHeader
                title="Proveedores"
                subtitle="Gestión de cadena de suministro, fabricantes y socios logísticos."
            >
                <OfflineDataBadge isOfflineData={isOfflineData} dataUpdatedAt={dataUpdatedAt} />
                <Link href="/suppliers/new">
                    <Button className="shadow-md shadow-zinc-900/10 dark:shadow-white/5">
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Proveedor
                    </Button>
                </Link>
            </PageHeader>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="space-y-6"
            >
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex-1 relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Buscar proveedor por nombre, CUIT o contacto..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                        />
                    </div>
                    <ExportButton data={exportData} filename="proveedores" label="Reporte maestros" />
                </div>

                <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Entidad & Digital</TableHead>
                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Contacto Directo</TableHead>
                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Documento</TableHead>
                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Catálogo</TableHead>
                                <TableHead className="text-right font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Gestión</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSuppliers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-48 text-zinc-500 font-medium italic">
                                        No se encontraron proveedores registrados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSuppliers.map((supplier: any) => (
                                    <TableRow key={supplier.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:bg-zinc-900 group-hover:text-zinc-100 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-colors">
                                                    <Building2 className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{supplier.name}</div>
                                                    {supplier.website && (
                                                        <a
                                                            href={supplier.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 mt-0.5"
                                                        >
                                                            {supplier.website.replace(/^https?:\/\//, '')}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{supplier.email || 'No email info'}</span>
                                                <span className="text-xs text-zinc-400 tabular-nums">{supplier.phone || 'No phone info'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                                                {supplier.taxId || '---'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                                <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">{supplier._count?.products ?? 0} SKU</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/suppliers/${supplier.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/suppliers/${supplier.id}/edit`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <DeleteSupplierButton supplierId={supplier.id} supplierName={supplier.name} />
                                            </div>
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
