import Link from "next/link"
import { getClientsAll } from "@/actions/client-actions"
import { getSession } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Edit, Trash2 } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import { ExportButton } from "@/components/export-button"
import { DeleteClientButton } from "@/components/clients/delete-client-button"

export default async function ClientsPage(props: {
    searchParams: Promise<{ query?: string }>
}) {
    const session = await getSession()
    const canExport = session?.role === 'owner' || session?.role === 'admin'

    const searchParams = await props.searchParams
    const clients = await getClientsAll(searchParams.query)

    // Preparar datos para exportación
    const exportData = clients.map(c => ({
        ID: c.id,
        Nombre: c.name,
        Email: c.email || '',
        Teléfono: c.phone || '',
        Dirección: c.address || '',
        'CUIT/DNI': c.taxId || ''
    }))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Clientes</h1>
                    <p className="text-muted-foreground">Gestiona tu cartera de clientes</p>
                </div>
                <Link href="/clients/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-2">
                <SearchInput placeholder="Buscar cliente..." />
                {canExport && (
                    <ExportButton data={exportData} filename="clientes" label="Exportar" />
                )}
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>CUIT/DNI</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No se encontraron clientes.
                                </TableCell>
                            </TableRow>
                        ) : (
                            clients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell className="font-medium">{client.name}</TableCell>
                                    <TableCell>{client.email || '-'}</TableCell>
                                    <TableCell>{client.phone || '-'}</TableCell>
                                    <TableCell>{client.taxId || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/clients/${client.id}`}>
                                                <Button variant="ghost" size="icon" title="Ver detalles">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/clients/${client.id}/edit`}>
                                                <Button variant="ghost" size="icon" title="Editar">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <DeleteClientButton clientId={client.id} clientName={client.name} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
