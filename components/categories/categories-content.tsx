"use client"

import Link from "next/link"
import { useOfflineData } from "@/hooks/use-offline-data"
import { getCategories } from "@/actions/category-actions"
import { Button } from "@/components/ui/button"
import { Plus, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OfflineDataBadge } from "@/components/offline/offline-data-badge"
import { PageHeader } from "@/components/layout/page-header"
import * as motion from "framer-motion/client"
import { Loader2 } from "lucide-react"

/**
 * Categorías - Client Component con soporte offline.
 * 
 * SEGURIDAD:
 * - getCategories() valida organizationId en el server action.
 * - Solo categorías de la organización del usuario se cachean.
 * - El caché se limpia al cerrar sesión.
 */
export function CategoriesContent() {
    const { data: categories, isOfflineData, dataUpdatedAt, isLoading } = useOfflineData(
        ['categories'],
        getCategories
    )

    if (isLoading && !categories) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                <p className="text-sm text-zinc-500">Cargando categorías...</p>
            </div>
        )
    }

    const categoryList = categories || []

    return (
        <div className="pb-10">
            <PageHeader
                title="Categorías"
                subtitle="Organiza tu catálogo de productos para una mejor gestión y reportes."
            >
                <div className="flex items-center gap-3">
                    <OfflineDataBadge isOfflineData={isOfflineData} dataUpdatedAt={dataUpdatedAt} />
                    <Button asChild className="shadow-md shadow-zinc-900/10 dark:shadow-white/5">
                        <Link href="/categories/new">
                            <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
                        </Link>
                    </Button>
                </div>
            </PageHeader>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
                {categoryList.map((category: any, index: number) => (
                    <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-900 dark:hover:border-zinc-100 transition-all duration-300">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-bold tracking-tight">
                                            {category.name}
                                        </CardTitle>
                                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                                            {category._count?.products ?? 0} producto{(category._count?.products ?? 0) !== 1 ? 's' : ''} vinculados
                                        </CardDescription>
                                    </div>
                                    <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                                        <Package className="h-6 w-6" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-3 mt-2">
                                    <Button variant="outline" size="sm" asChild className="flex-1 font-bold border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                        <Link href={`/categories/${category.id}/edit`}>
                                            Configurar
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" size="sm" asChild className="flex-1 font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                                        <Link href={`/inventory?category=${category.id}`}>
                                            Ver stock
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}

                {categoryList.length === 0 && (
                    <Card className="col-span-full border-dashed border-2 py-12 flex flex-col items-center justify-center text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                        <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-400 mb-4">
                            <Package className="h-10 w-10" />
                        </div>
                        <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">Sin categorías configuradas</p>
                        <p className="text-sm text-zinc-500 mb-6 italic max-w-xs">
                            Comienza creando categorías para organizar mejor tu inventario y facilitar las ventas.
                        </p>
                        <Button asChild>
                            <Link href="/categories/new">
                                <Plus className="mr-2 h-4 w-4" /> Crear primera categoría
                            </Link>
                        </Button>
                    </Card>
                )}
            </motion.div>
        </div>
    )
}
