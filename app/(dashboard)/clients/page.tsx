import Link from "next/link"
import { getClientsAll } from "@/actions/client-actions"
import { getSession } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Edit, Trash2 } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import { ExportButton } from "@/components/export-button"
import { DeleteClientButton } from "@/components/clients/delete-client-button"

import { PageHeader } from "@/components/layout/page-header"
import * as motion from "framer-motion/client"
import { User } from "lucide-react"

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
        <div className="pb-10">
            <PageHeader
                title="Clientes"
                subtitle="Administración de cartera comercial y perfiles de contacto."
            >
                <Link href="/clients/new">
                    <Button className="shadow-md shadow-zinc-900/10 dark:shadow-white/5">
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
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
                    <div className="flex-1">
                        <SearchInput placeholder="Buscar cliente por nombre, email o documento..." className="max-w-md" />
                    </div>
                    {canExport && (
                        <ExportButton data={exportData} filename="clientes" label="Exportar contactos" />
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Nombre & Perfil</TableHead>
                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Contacto</TableHead>
                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Documento</TableHead>
                                <TableHead className="text-right font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Gestión</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-48 text-zinc-500 font-medium italic">
                                        No hay clientes registrados en la base de datos.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                clients.map((client) => (
                                    <TableRow key={client.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:bg-zinc-900 group-hover:text-zinc-100 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-colors">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div className="font-bold text-zinc-900 dark:text-zinc-100">{client.name}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-0.5">
                                                <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{client.email || 'Sin email'}</div>
                                                <div className="text-xs text-zinc-400">{client.phone || 'Sin teléfono'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 font-bold text-zinc-700 dark:text-zinc-300">
                                                {client.taxId || '---'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/clients/${client.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/clients/${client.id}/edit`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
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
            </motion.div>
        </div>
    )
}
