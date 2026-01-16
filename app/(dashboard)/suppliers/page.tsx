import Link from "next/link"
import { getSuppliers } from "@/actions/supplier-actions"
import { getSession } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Edit, Building2 } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import { ExportButton } from "@/components/export-button"
import { DeleteSupplierButton } from "@/components/suppliers/delete-supplier-button"
import { Badge } from "@/components/ui/badge"

export default async function SuppliersPage(props: {
    searchParams: Promise<{ query?: string }>
}) {
    const session = await getSession()
    if (!session) return null
    if (session.role !== 'owner' && session.role !== 'admin' && session.role !== 'manager') {
        redirect('/dashboard')
    }

    const searchParams = await props.searchParams
    const suppliers = await getSuppliers(searchParams.query)

    // Preparar datos para exportación
    const exportData = suppliers.map(s => ({
        ID: s.id,
        Nombre: s.name,
        Email: s.email || '',
        Teléfono: s.phone || '',
        Dirección: s.address || '',
        'CUIT': s.taxId || '',
        'Sitio Web': s.website || '',
        Notas: s.notes || '',
        Productos: s._count.products
    }))

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Proveedores</h1>
                    <p className="text-muted-foreground">Gestiona tus proveedores y fabricantes</p>
                </div>
                <Link href="/suppliers/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Proveedor
                    </Button>
                </Link>
            </div>
            <div className="flex items-center gap-2">
                <SearchInput placeholder="Buscar proveedor..." />
                <ExportButton data={exportData} filename="proveedores" label="Exportar" />
            </div>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Proveedor</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>CUIT</TableHead>
                            <TableHead>Productos</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {suppliers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No se encontraron proveedores.
                                </TableCell>
                            </TableRow>
                        ) : (
                            suppliers.map((supplier) => (
                                <TableRow key={supplier.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{supplier.name}</div>
                                                {supplier.website && (
                                                    <a
                                                        href={supplier.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-muted-foreground hover:text-primary"
                                                    >
                                                        {supplier.website.replace(/^https?:\/\//, '')}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {supplier.email && <div>{supplier.email}</div>}
                                            {supplier.phone && <div className="text-muted-foreground">{supplier.phone}</div>}
                                        </div>
                                    </TableCell>
                                    <TableCell>{supplier.taxId || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{supplier._count.products}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/suppliers/${supplier.id}`}>
                                                <Button variant="ghost" size="icon" title="Ver detalles">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/suppliers/${supplier.id}/edit`}>
                                                <Button variant="ghost" size="icon" title="Editar">
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
        </div>
    );
}
