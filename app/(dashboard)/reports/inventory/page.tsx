import { getSession } from "@/actions/auth-actions"
import { getInventoryReport } from "@/actions/report-actions"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { 
    Download,
    Package,
    AlertTriangle,
    XCircle,
    CheckCircle,
    DollarSign,
    TrendingUp,
    ArrowLeft
} from "lucide-react"
import Link from "next/link"

export default async function InventoryReportPage() {
    const session = await getSession()
    
    if (!session) {
        redirect("/login")
    }

    const report = await getInventoryReport()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/reports">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reporte de Inventario</h1>
                        <p className="text-muted-foreground">
                            Estado actual del stock y valorización
                        </p>
                    </div>
                </div>
                <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                </Button>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{report.summary.totalProducts}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            En catálogo
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor del Inventario</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${report.summary.totalValue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            A precio de costo
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor de Venta</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ${report.summary.totalRetailValue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Potencial de venta
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ganancia Potencial</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            ${report.summary.potentialProfit.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Margen total
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Stock Status */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-green-200 bg-green-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Stock Saludable</CardTitle>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-700">{report.summary.healthyStockCount}</div>
                        <p className="text-sm text-green-600 mt-1">
                            Productos con stock adecuado
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-700">Stock Bajo</CardTitle>
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-700">{report.summary.lowStockCount}</div>
                        <p className="text-sm text-yellow-600 mt-1">
                            Requieren reposición
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-700">Sin Stock</CardTitle>
                        <XCircle className="h-5 w-5 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-700">{report.summary.outOfStockCount}</div>
                        <p className="text-sm text-red-600 mt-1">
                            Productos agotados
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* By Category */}
                <Card>
                    <CardHeader>
                        <CardTitle>Inventario por Categoría</CardTitle>
                        <CardDescription>Distribución del valor del stock</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {report.byCategory.map((category) => {
                                const percentage = report.summary.totalValue > 0 
                                    ? (category.totalValue / report.summary.totalValue) * 100 
                                    : 0
                                
                                return (
                                    <div key={category.name} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">{category.name}</span>
                                            <span className="text-muted-foreground">
                                                {category.count} productos · ${category.totalValue.toLocaleString("es-AR", { minimumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                        <Progress value={percentage} className="h-2" />
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Low Stock Alert */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                            Productos con Stock Bajo
                        </CardTitle>
                        <CardDescription>Requieren atención inmediata</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {report.lowStock.slice(0, 10).map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-3 rounded-lg border bg-yellow-50/50">
                                    <div>
                                        <Link href={`/inventory/${product.id}/edit`} className="font-medium hover:underline">
                                            {product.name}
                                        </Link>
                                        <p className="text-sm text-muted-foreground">
                                            {product.category?.name || "Sin categoría"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={product.stock === 0 ? "destructive" : "outline"} className="text-lg">
                                            {product.stock} / {product.minStock}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                            {report.lowStock.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">
                                    🎉 ¡Excelente! No hay productos con stock bajo
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Full Inventory Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Inventario Completo</CardTitle>
                    <CardDescription>Todos los productos ordenados por stock</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border max-h-[600px] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>Proveedor</TableHead>
                                    <TableHead className="text-right">Stock</TableHead>
                                    <TableHead className="text-right">Mínimo</TableHead>
                                    <TableHead className="text-right">Costo</TableHead>
                                    <TableHead className="text-right">Precio</TableHead>
                                    <TableHead className="text-right">Valor Stock</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {report.allProducts.map((product) => {
                                    const stockValue = Number(product.cost) * product.stock
                                    const status = product.stock === 0 ? "out" : product.stock <= product.minStock ? "low" : "ok"
                                    
                                    return (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <Link href={`/inventory/${product.id}/edit`} className="font-medium hover:underline">
                                                    {product.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{product.category?.name || "-"}</TableCell>
                                            <TableCell>{product.supplier?.name || "-"}</TableCell>
                                            <TableCell className="text-right font-medium">{product.stock}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">{product.minStock}</TableCell>
                                            <TableCell className="text-right">
                                                ${Number(product.cost).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                ${Number(product.price).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                ${stockValue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell>
                                                {status === "out" && <Badge variant="destructive">Agotado</Badge>}
                                                {status === "low" && <Badge variant="outline" className="text-yellow-600 border-yellow-600">Bajo</Badge>}
                                                {status === "ok" && <Badge variant="outline" className="text-green-600 border-green-600">OK</Badge>}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
