import { getSession } from "@/actions/auth-actions"
import { getReportsSummary } from "@/actions/report-actions"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    TrendingUp,
    Package,
    Users,
    DollarSign,
    ShoppingCart,
    AlertTriangle,
    Crown,
    ArrowRight,
    BarChart3,
    XCircle
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default async function ReportsPage() {
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    // Restrict access to reports
    const allowedRoles = ['owner', 'admin', 'manager']
    if (!allowedRoles.includes(session.role)) {
        redirect("/dashboard")
    }

    const summary = await getReportsSummary()

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
                <p className="text-muted-foreground">
                    Resumen del período: {format(summary.period.startDate, "dd MMM", { locale: es })} - {format(summary.period.endDate, "dd MMM yyyy", { locale: es })}
                </p>
            </div>

            {/* Reporte de Ventas - Preview */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <CardTitle>Reporte de Ventas</CardTitle>
                            <CardDescription>Ingresos y transacciones del mes</CardDescription>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href="/reports/sales">
                            Ver completo <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3 mt-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                            <DollarSign className="h-8 w-8 text-green-600" />
                            <div>
                                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                                <p className="text-2xl font-bold">${summary.sales.totalRevenue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                            <ShoppingCart className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total Ventas</p>
                                <p className="text-2xl font-bold">{summary.sales.totalSales}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                            <BarChart3 className="h-8 w-8 text-purple-600" />
                            <div>
                                <p className="text-sm text-muted-foreground">Ticket Promedio</p>
                                <p className="text-2xl font-bold">
                                    ${summary.sales.totalSales > 0
                                        ? (summary.sales.totalRevenue / summary.sales.totalSales).toLocaleString("es-AR", { minimumFractionDigits: 2 })
                                        : "0.00"
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Productos Más Vendidos - Preview */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/80 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <CardTitle>Productos Más Vendidos</CardTitle>
                            <CardDescription>Top 5 productos del mes</CardDescription>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href="/reports/products">
                            Ver completo <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="mt-4 space-y-3">
                        {summary.topProducts.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">No hay datos de ventas este mes</p>
                        ) : (
                            summary.topProducts.map((product, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <Badge variant={index === 0 ? "default" : "secondary"} className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                                            {index + 1}
                                        </Badge>
                                        <span className="font-medium">{product.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-muted-foreground">{product.quantity} vendidos</span>
                                        <span className="font-semibold">${product.revenue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Reporte de Inventario - Preview */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <CardTitle>Reporte de Inventario</CardTitle>
                            <CardDescription>Estado actual del stock</CardDescription>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href="/reports/inventory">
                            Ver completo <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4 mt-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                            <Package className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total Productos</p>
                                <p className="text-2xl font-bold">{summary.inventory.totalProducts}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                            <AlertTriangle className="h-8 w-8 text-yellow-600" />
                            <div>
                                <p className="text-sm text-yellow-700">Stock Bajo</p>
                                <p className="text-2xl font-bold text-yellow-700">{summary.inventory.lowStock}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                            <XCircle className="h-8 w-8 text-red-600" />
                            <div>
                                <p className="text-sm text-red-700">Sin Stock</p>
                                <p className="text-2xl font-bold text-red-700">{summary.inventory.outOfStock}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                            <DollarSign className="h-8 w-8 text-green-600" />
                            <div>
                                <p className="text-sm text-muted-foreground">Valor Total</p>
                                <p className="text-2xl font-bold">${summary.inventory.totalValue.toLocaleString("es-AR", { minimumFractionDigits: 0 })}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Análisis de Clientes - Preview */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/60 flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <CardTitle>Análisis de Clientes</CardTitle>
                            <CardDescription>Clientes y comportamiento de compra</CardDescription>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href="/reports/clients">
                            Ver completo <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                                <Users className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Clientes</p>
                                    <p className="text-2xl font-bold">{summary.clients.total}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                                <ShoppingCart className="h-8 w-8 text-green-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Activos este mes</p>
                                    <p className="text-2xl font-bold">{summary.clients.active}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium flex items-center gap-2">
                                <Crown className="h-4 w-4 text-yellow-500" />
                                Top Clientes del Mes
                            </p>
                            {summary.clients.topClients.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay datos este mes</p>
                            ) : (
                                summary.clients.topClients.slice(0, 3).map((client, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                                        <span>{client.name}</span>
                                        <span className="font-medium">${client.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reporte de Empleados - Preview */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/40 flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <CardTitle>Reporte de Empleados</CardTitle>
                            <CardDescription>Rendimiento, horas y comisiones</CardDescription>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href="/reports/employees">
                            Ver completo <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3 mt-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                            <Users className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Empleados</p>
                                <p className="text-2xl font-bold">Activos</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                            <DollarSign className="h-8 w-8 text-green-600" />
                            <div>
                                <p className="text-sm text-muted-foreground">Ventas por empleado</p>
                                <p className="text-2xl font-bold">Ver detalles</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                            <Crown className="h-8 w-8 text-amber-600" />
                            <div>
                                <p className="text-sm text-muted-foreground">Top Performers</p>
                                <p className="text-2xl font-bold">Ranking</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
