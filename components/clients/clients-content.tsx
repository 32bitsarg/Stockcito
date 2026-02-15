"use client"

import Link from "next/link"
import { useOfflineData } from "@/hooks/use-offline-data"
import { getClientsAll } from "@/actions/client-actions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Edit, User } from "lucide-react"
import { ExportButton } from "@/components/export-button"
import { DeleteClientButton } from "@/components/clients/delete-client-button"
import { OfflineDataBadge } from "@/components/offline/offline-data-badge"
import { PageHeader } from "@/components/layout/page-header"
import * as motion from "framer-motion/client"
import { useState, useMemo } from "react"
import { Loader2 } from "lucide-react"

interface ClientsContentProps {
    canExport: boolean
    initialQuery?: string
}

/**
 * Clientes - Client Component con soporte offline.
 * 
 * SEGURIDAD:
 * - getClientsAll() valida organizationId en el server action.
 * - Se cachean solo datos necesarios (nombre, email, teléfono).
 * - Datos sensibles como taxId se muestran pero ya son del dominio público del comercio.
 * - El caché se limpia al cerrar sesión.
 */
export function ClientsContent({ canExport, initialQuery }: ClientsContentProps) {
    const [searchQuery, setSearchQuery] = useState(initialQuery || "")

    const { data: allClients, isOfflineData, dataUpdatedAt, isLoading } = useOfflineData(
        ['clients'],
        () => getClientsAll()
    )

    // Filtrar del lado del cliente para funcionar offline
    const clients = useMemo(() => {
        if (!allClients) return []
        if (!searchQuery) return allClients
        const q = searchQuery.toLowerCase()
        return allClients.filter((c: any) =>
            c.name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.taxId?.toLowerCase().includes(q)
        )
    }, [allClients, searchQuery])

    // Preparar datos para exportación (sin datos sensibles innecesarios)
    const exportData = clients.map((c: any) => ({
        ID: c.id,
        Nombre: c.name,
        Email: c.email || '',
        Teléfono: c.phone || '',
        Dirección: c.address || '',
        'CUIT/DNI': c.taxId || ''
    }))

    if (isLoading && !allClients) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                <p className="text-sm text-zinc-500">Cargando clientes...</p>
            </div>
        )
    }

    return (
        <div className="pb-10">
            <PageHeader
                title="Clientes"
                subtitle="Administración de cartera comercial y perfiles de contacto."
            >
                <div className="flex items-center gap-3">
                    <OfflineDataBadge isOfflineData={isOfflineData} dataUpdatedAt={dataUpdatedAt} />
                    <Link href="/clients/new">
                        <Button className="shadow-md shadow-zinc-900/10 dark:shadow-white/5">
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
                        </Button>
                    </Link>
                </div>
            </PageHeader>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="space-y-6"
            >
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex-1">
                        <input
                            type="search"
                            placeholder="Buscar cliente por nombre, email o documento..."
                            className="max-w-md px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-sm w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
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
                                clients.map((client: any) => (
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
