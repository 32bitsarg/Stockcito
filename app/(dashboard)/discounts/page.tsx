import Link from "next/link"
import { getDiscounts } from "@/actions/discount-actions"
import { getSession } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Percent, DollarSign, Calendar, Tag } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import { ExportButton } from "@/components/export-button"
import { DeleteDiscountButton } from "@/components/discounts/delete-discount-button"
import { ToggleDiscountButton } from "@/components/discounts/toggle-discount-button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { PageHeader } from "@/components/layout/page-header"
import * as motion from "framer-motion/client"

export default async function DiscountsPage(props: {
    searchParams: Promise<{ query?: string }>
}) {
    const searchParams = await props.searchParams
    const discounts = await getDiscounts(searchParams.query)

    // Auth check
    const session = await getSession()
    const canEdit = session?.role === 'owner' || session?.role === 'admin' || session?.role === 'manager'

    // Preparar datos para exportación
    const exportData = discounts.map(d => ({
        ID: d.id,
        Nombre: d.name,
        Descripción: d.description || '',
        Tipo: d.type === 'percentage' ? 'Porcentaje' : 'Monto Fijo',
        Valor: d.value,
        'Compra Mínima': d.minPurchase || '',
        'Descuento Máximo': d.maxDiscount || '',
        'Fecha Inicio': d.startDate ? format(d.startDate, 'dd/MM/yyyy') : '',
        'Fecha Fin': d.endDate ? format(d.endDate, 'dd/MM/yyyy') : '',
        Categoría: d.category?.name || '',
        Activo: d.isActive ? 'Sí' : 'No'
    }))

    const now = new Date()

    return (
        <div className="pb-10">
            <PageHeader
                title="Promociones"
                subtitle="Configuración de reglas de descuento, cupones y beneficios comerciales."
            >
                {canEdit && (
                    <Button asChild className="shadow-md shadow-zinc-900/10 dark:shadow-white/5">
                        <Link href="/discounts/new">
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Descuento
                        </Link>
                    </Button>
                )}
            </PageHeader>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="space-y-6"
            >
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex-1">
                        <SearchInput placeholder="Buscar regla de descuento por nombre..." className="max-w-md" />
                    </div>
                    {canEdit && <ExportButton data={exportData} filename="descuentos" label="Exportar esquema" />}
                </div>

                <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Beneficio & Alcance</TableHead>
                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Especificación</TableHead>
                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs center">Valor</TableHead>
                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Vigencia Temporal</TableHead>
                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Estado</TableHead>
                                {canEdit && <TableHead className="text-right font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Acciones</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {discounts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={canEdit ? 6 : 5} className="text-center h-48 text-zinc-500 font-medium italic">
                                        No se han configurado reglas de descuento actualmente.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                discounts.map((discount) => {
                                    const isExpired = discount.endDate && new Date(discount.endDate) < now
                                    const isNotStarted = discount.startDate && new Date(discount.startDate) > now

                                    return (
                                        <TableRow key={discount.id} className={`${!discount.isActive ? 'opacity-40 grayscale' : ''} group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors`}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:bg-zinc-900 group-hover:text-zinc-100 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-colors">
                                                        <Tag className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{discount.name}</div>
                                                        {discount.category && (
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-0.5">
                                                                Limitado a: {discount.category.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-bold text-zinc-500">
                                                    {discount.type === 'percentage' ? (
                                                        <><Percent className="h-3 w-3 mr-1" /> Variable (%)</>
                                                    ) : (
                                                        <><DollarSign className="h-3 w-3 mr-1" /> Fijo ($)</>
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono font-black text-zinc-900 dark:text-zinc-100">
                                                    {discount.type === 'percentage'
                                                        ? `${Number(discount.value)}%`
                                                        : `$${Number(discount.value).toLocaleString('es-AR')}`
                                                    }
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                                                    <Calendar className="h-3 w-3" />
                                                    <span className="tabular-nums">
                                                        {discount.startDate
                                                            ? format(discount.startDate, 'dd MMM', { locale: es })
                                                            : 'INICIO'
                                                        }
                                                        {' → '}
                                                        {discount.endDate
                                                            ? format(discount.endDate, 'dd MMM', { locale: es })
                                                            : 'FIN'
                                                        }
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {!discount.isActive ? (
                                                    <div className="flex items-center gap-1.5 opacity-50">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Pausado</span>
                                                    </div>
                                                ) : isExpired ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Vencido</span>
                                                    </div>
                                                ) : isNotStarted ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-pulse" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 font-mono">Próximo</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 animate-pulse" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Vigor</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            {canEdit && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ToggleDiscountButton
                                                            discountId={discount.id}
                                                            isActive={discount.isActive}
                                                        />
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500" asChild>
                                                            <Link href={`/discounts/${discount.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <DeleteDiscountButton
                                                            discountId={discount.id}
                                                            discountName={discount.name}
                                                        />
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </motion.div>
        </div>
    )
}
