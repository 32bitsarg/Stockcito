import Link from "next/link"
import { getProducts } from "@/actions/product-actions"
import { getSession } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import { ExportButton } from "@/components/export-button"

export default async function InventoryPage(props: {
    searchParams: Promise<{ query?: string }>
}) {
    const session = await getSession()
    const canEdit = session?.role === 'owner' || session?.role === 'admin' || session?.role === 'manager'
    const canExport = session?.role === 'owner' || session?.role === 'admin'

    const searchParams = await props.searchParams
    const products = await getProducts(searchParams.query)

    // Preparar datos para exportación
    const exportData = products.map(p => ({
        ID: p.id,
        Nombre: p.name,
        SKU: p.sku || '',
        Categoría: p.category?.name || 'Sin categoría',
        Precio: Number(p.price),
        Costo: Number(p.cost),
        Stock: p.stock,
        'Stock Mínimo': p.minStock,
        Descripción: p.description || ''
    }))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Inventario</h1>
                {canEdit && (
                    <Link href="/inventory/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
                        </Button>
                    </Link>
                )}
            </div>

            <div className="flex items-center gap-2">
                <SearchInput placeholder="Buscar por nombre o SKU..." />
                {canExport && (
                    <ExportButton data={exportData} filename="inventario" label="Exportar" />
                )}
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>SKU</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Precio</TableHead>
                            {canEdit && <TableHead className="text-right">Acciones</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={canEdit ? 5 : 4} className="text-center h-24 text-muted-foreground">
                                    No se encontraron productos.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>{product.sku}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>
                                        <div className={product.stock <= product.minStock ? "text-red-500 font-bold" : ""}>
                                            {product.stock}
                                        </div>
                                    </TableCell>
                                    <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                                    {canEdit && (
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/inventory/${product.id}/edit`}>Editar</Link>
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
