import { getSession } from "@/actions/auth-actions"
import { getSalesReport, getComparisonReport, PeriodType } from "@/actions/report-actions"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    ShoppingCart, 
    Receipt,
    Download,
    ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ReportPeriodSelector } from "@/components/reports/period-selector"
import { SalesChart } from "@/components/reports/sales-chart"

export default async function SalesReportPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ period?: string; start?: string; end?: string }> 
}) {
    const session = await getSession()
    
    if (!session) {
        redirect("/login")
    }

    const params = await searchParams
    const period = (params.period || "month") as PeriodType
    const customStart = params.start ? new Date(params.start) : undefined
    const customEnd = params.end ? new Date(params.end) : undefined

    const report = await getSalesReport(period, customStart, customEnd)
    const comparison = await getComparisonReport(period)

    const revenueChangePositive = comparison.changes.revenueChange >= 0
    const salesChangePositive = comparison.changes.salesChange >= 0

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
                        <h1 className="text-3xl font-bold tracking-tight">Reporte de Ventas</h1>
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
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${report.summary.totalRevenue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            {revenueChangePositive ? (
                                <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                            ) : (
                                <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
                            )}
                            <span className={revenueChangePositive ? "text-green-600" : "text-red-600"}>
                                {revenueChangePositive ? "+" : ""}{comparison.changes.revenueChange.toFixed(1)}%
                            </span>
                            <span className="ml-1">vs período anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{report.summary.totalSales}</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            {salesChangePositive ? (
                                <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                            ) : (
                                <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
                            )}
                            <span className={salesChangePositive ? "text-green-600" : "text-red-600"}>
                                {salesChangePositive ? "+" : ""}{comparison.changes.salesChange.toFixed(1)}%
                            </span>
                            <span className="ml-1">vs período anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${report.summary.averageTicket.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Promedio por venta
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">IVA Recaudado</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${report.summary.totalTax.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total impuestos
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Ventas por Día</CardTitle>
                        <CardDescription>Evolución de ventas en el período</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <SalesChart data={report.salesByDay} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ventas por Vendedor</CardTitle>
                        <CardDescription>Rendimiento del equipo</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {report.salesByUser.slice(0, 5).map((user, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-sm text-muted-foreground">{user.count} ventas</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">${user.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            ))}
                            {report.salesByUser.length === 0 && (
                                <p className="text-center text-muted-foreground py-4">No hay datos</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Sales Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Últimas Ventas</CardTitle>
                    <CardDescription>Detalle de ventas del período</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Vendedor</TableHead>
                                    <TableHead>Productos</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {report.sales.slice(0, 10).map((sale) => (
                                    <TableRow key={sale.id}>
                                        <TableCell>
                                            <Link href={`/sales/${sale.id}`} className="font-medium hover:underline">
                                                #{sale.id}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(sale.date), "dd MMM HH:mm", { locale: es })}
                                        </TableCell>
                                        <TableCell>{sale.client?.name || "Consumidor Final"}</TableCell>
                                        <TableCell>{sale.user?.name || "-"}</TableCell>
                                        <TableCell>{sale.items.length} items</TableCell>
                                        <TableCell className="text-right font-semibold">
                                            ${Number(sale.total).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
