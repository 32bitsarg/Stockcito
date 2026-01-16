import { getSession } from "@/actions/auth-actions"
import { getTopProductsReport, PeriodType } from "@/actions/report-actions"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
    Download,
    Package,
    TrendingUp,
    DollarSign,
    ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ReportPeriodSelector } from "@/components/reports/period-selector"

export default async function ProductsReportPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ period?: string }> 
}) {
    const session = await getSession()
    
    if (!session) {
        redirect("/login")
    }

    const params = await searchParams
    const period = (params.period || "month") as PeriodType

    const report = await getTopProductsReport(period, 50)

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
                        <h1 className="text-3xl font-bold tracking-tight">Productos Más Vendidos</h1>
                        <p className="text-muted-foreground">
                            {format(report.period.startDate, "dd MMM yyyy", { locale: es })} - {format(report.period.endDate, "dd MMM yyyy", { locale: es })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ReportPeriodSelector currentPeriod={period} />
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Productos Vendidos</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{report.summary.totalProducts}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Productos diferentes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unidades Vendidas</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{report.summary.totalItemsSold}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total de items
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos por Productos</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${report.summary.totalRevenue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total facturado
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Top 10 Products Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {report.products.slice(0, 5).map((product, index) => (
                    <Card key={product.id} className="relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-8 h-8 flex items-center justify-center text-white font-bold ${
                            index === 0 ? "bg-yellow-500" : 
                            index === 1 ? "bg-gray-400" : 
                            index === 2 ? "bg-amber-600" : "bg-primary"
                        }`}>
                            {index + 1}
                        </div>
                        <CardHeader className="pt-10">
                            <CardTitle className="text-base truncate">{product.name}</CardTitle>
                            <CardDescription>
                                <Badge variant="outline">{product.category}</Badge>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Vendidos:</span>
                                    <span className="font-medium">{product.totalQuantity}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Ingresos:</span>
                                    <span className="font-semibold text-green-600">
                                        ${product.totalRevenue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Full Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Ranking Completo</CardTitle>
                    <CardDescription>Todos los productos vendidos en el período</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead className="text-right">Cantidad</TableHead>
                                    <TableHead className="text-right">Precio Prom.</TableHead>
                                    <TableHead className="text-right">Ingresos</TableHead>
                                    <TableHead className="text-right">% del Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {report.products.map((product, index) => {
                                    const percentage = report.summary.totalRevenue > 0 
                                        ? (product.totalRevenue / report.summary.totalRevenue) * 100 
                                        : 0
                                    
                                    return (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-bold">{index + 1}</TableCell>
                                            <TableCell>
                                                <Link href={`/inventory/${product.id}/edit`} className="hover:underline font-medium">
                                                    {product.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{product.category}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{product.totalQuantity}</TableCell>
                                            <TableCell className="text-right">
                                                ${product.avgPrice.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-green-600">
                                                ${product.totalRevenue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 bg-muted rounded-full h-2">
                                                        <div 
                                                            className="bg-primary rounded-full h-2" 
                                                            style={{ width: `${Math.min(percentage * 3, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-muted-foreground w-12">
                                                        {percentage.toFixed(1)}%
                                                    </span>
                                                </div>
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
