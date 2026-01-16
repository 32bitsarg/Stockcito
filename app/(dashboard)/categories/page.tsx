import Link from "next/link"
import { getCategories } from "@/actions/category-actions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function CategoriesPage() {
    const categories = await getCategories()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
                    <p className="text-muted-foreground">
                        Organiza tus productos por categorías
                    </p>
                </div>
                <Link href="/categories/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                    <Card key={category.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                {category.name}
                            </CardTitle>
                            <CardDescription>
                                {category._count.products} producto{category._count.products !== 1 ? 's' : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild className="flex-1">
                                    <Link href={`/categories/${category.id}/edit`}>
                                        Editar
                                    </Link>
                                </Button>
                                <Button variant="ghost" size="sm" asChild className="flex-1">
                                    <Link href={`/inventory?category=${category.id}`}>
                                        Ver Productos
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {categories.length === 0 && (
                    <Card className="col-span-full">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Package className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-semibold mb-2">No hay categorías</p>
                            <p className="text-sm text-muted-foreground mb-4">
                                Crea tu primera categoría para organizar tus productos
                            </p>
                            <Button asChild>
                                <Link href="/categories/new">
                                    <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
