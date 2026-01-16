"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, LayoutGrid, Trash2, List, Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { TableCard } from "./table-card"
import { TableDialog } from "./table-dialog"
import { VisualLayout } from "./visual-layout"
import { deleteTable, type TableData } from "@/actions/table-actions"
import { toast } from "sonner"

interface TablesClientProps {
    tables: TableData[]
    isAdmin: boolean
}

export function TablesClient({ tables, isAdmin }: TablesClientProps) {
    const router = useRouter()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTable, setEditingTable] = useState<TableData | null>(null)
    const [deletingTable, setDeletingTable] = useState<TableData | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleEdit = (table: TableData) => {
        setEditingTable(table)
        setIsDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!deletingTable) return

        setIsDeleting(true)
        try {
            const result = await deleteTable(deletingTable.id)
            if (result.success) {
                toast.success(`Mesa ${deletingTable.number} eliminada`)
                router.refresh()
            } else {
                toast.error(result.error || "Error al eliminar")
            }
        } finally {
            setIsDeleting(false)
            setDeletingTable(null)
        }
    }

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open)
        if (!open) {
            setEditingTable(null)
        }
    }

    return (
        <>
            <Tabs defaultValue="list" className="w-full space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <TabsList>
                        <TabsTrigger value="list" className="flex items-center gap-2">
                            <List className="w-4 h-4" />
                            Lista
                        </TabsTrigger>
                        <TabsTrigger value="layout" className="flex items-center gap-2">
                            <Map className="w-4 h-4" />
                            Plano
                        </TabsTrigger>
                    </TabsList>

                    {isAdmin && (
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Mesa
                        </Button>
                    )}
                </div>

                <TabsContent value="list" className="mt-0">
                    {tables.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4" />
                                <h2 className="text-xl font-semibold mb-2">No hay mesas configuradas</h2>
                                <p className="text-muted-foreground mb-4">
                                    Agrega mesas para comenzar a gestionar tu restaurante
                                </p>
                                {isAdmin && (
                                    <Button onClick={() => setIsDialogOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Agregar Primera Mesa
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                            {tables.map(table => (
                                <TableCard
                                    key={table.id}
                                    table={table}
                                    isAdmin={isAdmin}
                                    onEdit={handleEdit}
                                    onDelete={setDeletingTable}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="layout" className="mt-0">
                    <VisualLayout
                        tables={tables}
                        onEditTable={handleEdit}
                        isAdmin={isAdmin}
                    />
                </TabsContent>
            </Tabs>

            {/* Create/Edit Dialog */}
            <TableDialog
                open={isDialogOpen}
                onOpenChange={handleDialogClose}
                table={editingTable}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingTable} onOpenChange={() => setDeletingTable(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Mesa {deletingTable?.number}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. La mesa será eliminada
                            permanentemente del sistema.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
