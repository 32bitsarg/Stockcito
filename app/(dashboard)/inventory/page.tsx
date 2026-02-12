import Link from "next/link"
import { getProducts } from "@/actions/product-actions"
import { getSession } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Package, ExternalLink } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import { ExportButton } from "@/components/export-button"

import { PageHeader } from "@/components/layout/page-header"
import * as motion from "framer-motion/client"
import { cn } from "@/lib/utils"

export default async function InventoryPage(props: {
    searchParams: Promise<{ query?: string }>
}) {
    const session = await getSession()
    const canEdit = session?.role === 'owner' || session?.role === 'admin' || session?.role === 'manager'
    const canExport = session?.role === 'owner' || session?.role === 'admin'

    const searchParams = await props.searchParams
    const products = await getProducts(searchParams.query)

    const exportData = products.map(p => ({
        ID: p.id,
        Nombre: p.name,
        SKU: p.sku || '',
        Categoría: p.category?.name || 'Sin categoría',
        Precio: Number(p.price),
        Costo: Number(p.cost),
        Stock: p.stock,
        'Stock Mínimo': p.minStock
    }))

    return (
        <div className="pb-10 font-sans">
            <PageHeader
                title="Sistemas de Inventario"
                subtitle="Control de existencias, auditoría de precios y gestión de SKU maestro."
            >
                {canEdit && (
                    <Button asChild className="shadow-2xl shadow-zinc-900/20 dark:shadow-white/5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 transition-all uppercase text-[10px] font-black tracking-widest px-6 h-11 rounded-xl">
                        <Link href="/inventory/new">
                            <Plus className="mr-2 h-4 w-4" /> Registrar SKU
                        </Link>
                    </Button>
                )}
            </PageHeader>

            <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-6"
            >
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-white dark:bg-zinc-950 p-4 md:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all focus-within:shadow-xl focus-within:border-zinc-500">
                    <div className="flex-1">
                        <SearchInput placeholder="BUSCAR POR NOMBRE O IDENTIFICADOR SKU..." className="w-full max-w-none md:max-w-xl border-dashed bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800" />
                    </div>
                    {canExport && (
                        <ExportButton data={exportData} filename="inventario_master" label="Descargar Reporte SKU" />
                    )}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-900 dark:hover:bg-zinc-100 border-none">
                                <TableHead className="font-black text-white dark:text-zinc-900 uppercase tracking-widest text-[10px] h-14 px-8 italic">Referencia SKU</TableHead>
                                <TableHead className="font-black text-white dark:text-zinc-900 uppercase tracking-widest text-[10px] h-14 italic">Denominación del Producto</TableHead>
                                <TableHead className="font-black text-white dark:text-zinc-900 uppercase tracking-widest text-[10px] h-14 italic">Existencias</TableHead>
                                <TableHead className="font-black text-white dark:text-zinc-900 uppercase tracking-widest text-[10px] h-14 italic">Valor Unitario</TableHead>
                                {canEdit && <TableHead className="text-right font-black text-white dark:text-zinc-900 uppercase tracking-widest text-[10px] h-14 pr-8 italic">Gestión</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={canEdit ? 5 : 4} className="text-center h-64 text-zinc-400">
                                        <div className="flex flex-col items-center justify-center opacity-40">
                                            <Package className="h-12 w-12 mb-4" />
                                            <p className="font-black uppercase tracking-widest text-xs">Catálogo no disponible</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product, idx) => (
                                    <TableRow key={product.id} className="group border-zinc-100 dark:border-zinc-900/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all duration-300">
                                        <TableCell className="px-8 font-mono text-[11px] font-black text-zinc-400 uppercase group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                                            {product.sku || '---'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-black text-zinc-900 dark:text-zinc-100 uppercase italic tracking-tighter text-sm">{product.name}</span>
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">{product.category?.name || 'Inventario General'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className={cn(
                                                "inline-flex items-center px-3 py-1 rounded-lg font-mono font-black text-xs transition-all",
                                                product.stock <= product.minStock
                                                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg scale-110"
                                                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                                            )}>
                                                {product.stock.toString().padStart(2, '0')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono font-black text-zinc-900 dark:text-zinc-100 italic tracking-tighter">
                                            ${Number(product.price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        {canEdit && (
                                            <TableCell className="text-right pr-8">
                                                <Button variant="ghost" size="sm" asChild className="rounded-xl font-black uppercase text-[10px] tracking-widest opacity-0 group-hover:opacity-100 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                                    <Link href={`/inventory/${product.id}/edit`} className="flex items-center gap-2">
                                                        Editar <ExternalLink className="h-3 w-3" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile View: Cards */}
                <div className="md:hidden flex flex-col gap-4">
                    {products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 opacity-40">
                            <Package className="h-12 w-12 mb-4" />
                            <p className="font-black uppercase tracking-widest text-xs">Catálogo no disponible</p>
                        </div>
                    ) : (
                        products.map((product) => (
                            <div key={product.id} className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="font-mono text-[10px] font-black text-zinc-400 uppercase">
                                            SKU: {product.sku || '---'}
                                        </div>
                                        <h3 className="font-black text-zinc-900 dark:text-zinc-100 uppercase italic tracking-tighter text-base leading-none">
                                            {product.name}
                                        </h3>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                                            {product.category?.name || 'Inventario General'}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "flex flex-col items-center justify-center px-3 py-2 rounded-xl font-mono font-black transition-all",
                                        product.stock <= product.minStock
                                            ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl"
                                            : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                                    )}>
                                        <span className="text-xs uppercase group-hover:text-zinc-400 opacity-60 leading-none mb-1">Stock</span>
                                        <span className="text-lg leading-none">{product.stock.toString().padStart(2, '0')}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-900">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Precio Unitario</span>
                                        <span className="font-mono font-black text-xl text-zinc-900 dark:text-zinc-100 italic tracking-tighter">
                                            ${Number(product.price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    {canEdit && (
                                        <Button size="sm" asChild className="rounded-xl h-10 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-black uppercase text-[10px] tracking-widest">
                                            <Link href={`/inventory/${product.id}/edit`}>
                                                Gestionar
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    )
}
