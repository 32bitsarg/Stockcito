import Link from "next/link"
import { getDiscounts } from "@/actions/discount-actions"
import { getSession } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Percent, DollarSign, Calendar } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import { ExportButton } from "@/components/export-button"
import { DeleteDiscountButton } from "@/components/discounts/delete-discount-button"
import { ToggleDiscountButton } from "@/components/discounts/toggle-discount-button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"

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
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Descuentos y Promociones</h1>
                    <p className="text-muted-foreground">Gestiona descuentos y ofertas especiales</p>
                </div>
                {canEdit && (
                    <Link href="/discounts/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Descuento
                        </Button>
                    </Link>
                )}
            </div>

            <div className="flex items-center gap-2">
                <SearchInput placeholder="Buscar descuento..." />
                {canEdit && <ExportButton data={exportData} filename="descuentos" label="Exportar" />}
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Descuento</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Vigencia</TableHead>
                            <TableHead>Estado</TableHead>
                            {canEdit && <TableHead className="text-right">Acciones</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {discounts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={canEdit ? 6 : 5} className="text-center h-24 text-muted-foreground">
                                    No se encontraron descuentos.
                                </TableCell>
                            </TableRow>
                        ) : (
                            discounts.map((discount) => {
                                const isExpired = discount.endDate && new Date(discount.endDate) < now
                                const isNotStarted = discount.startDate && new Date(discount.startDate) > now

                                return (
                                    <TableRow key={discount.id} className={!discount.isActive ? 'opacity-60' : ''}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{discount.name}</div>
                                                {discount.description && (
                                                    <div className="text-xs text-muted-foreground">{discount.description}</div>
                                                )}
                                                {discount.category && (
                                                    <Badge variant="outline" className="mt-1 text-xs">
                                                        {discount.category.name}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {discount.type === 'percentage' ? (
                                                    <><Percent className="h-3 w-3 mr-1" /> Porcentaje</>
                                                ) : (
                                                    <><DollarSign className="h-3 w-3 mr-1" /> Monto Fijo</>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {discount.type === 'percentage'
                                                ? `${Number(discount.value)}%`
                                                : `$${Number(discount.value).toLocaleString('es-AR')}`
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {discount.startDate || discount.endDate ? (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                                        <span>
                                                            {discount.startDate
                                                                ? format(discount.startDate, 'dd/MM', { locale: es })
                                                                : '∞'
                                                            }
                                                            {' - '}
                                                            {discount.endDate
                                                                ? format(discount.endDate, 'dd/MM', { locale: es })
                                                                : '∞'
                                                            }
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">Sin límite</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {!discount.isActive ? (
                                                <Badge variant="secondary">Inactivo</Badge>
                                            ) : isExpired ? (
                                                <Badge variant="destructive">Expirado</Badge>
                                            ) : isNotStarted ? (
                                                <Badge variant="outline">Programado</Badge>
                                            ) : (
                                                <Badge variant="default" className="bg-green-600">Activo</Badge>
                                            )}
                                        </TableCell>
                                        {canEdit && (
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <ToggleDiscountButton
                                                        discountId={discount.id}
                                                        isActive={discount.isActive}
                                                    />
                                                    <Link href={`/discounts/${discount.id}/edit`}>
                                                        <Button variant="ghost" size="icon" title="Editar">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
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
        </div >
    )
}
