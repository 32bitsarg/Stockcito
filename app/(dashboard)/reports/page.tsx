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
    XCircle,
    Activity,
    LineChart
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { PageHeader } from "@/components/layout/page-header"
import * as motion from "framer-motion/client"

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

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="pb-10">
            <PageHeader
                title="Centro de Reportes"
                subtitle={`Análisis consolidado del período: ${format(summary.period.startDate, "dd MMM", { locale: es })} — ${format(summary.period.endDate, "dd MMM yyyy", { locale: es })}`}
            />

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-6"
            >
                {/* Reporte de Ventas - Preview */}
                <motion.div variants={item}>
                    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-zinc-100 dark:text-zinc-900 group-hover:scale-110 transition-transform duration-300">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black italic tracking-tighter uppercase">Inteligencia de Ventas</CardTitle>
                                    <CardDescription className="font-medium text-zinc-500">Métricas de rendimiento transaccional y flujo de caja.</CardDescription>
                                </div>
                            </div>
                            <Button variant="outline" className="font-bold border-zinc-200 dark:border-zinc-800 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-all" asChild>
                                <Link href="/reports/sales">
                                    Explorar datos <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Volumen de Ingresos</p>
                                    <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tighter">
                                        ${summary.sales.totalRevenue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Operaciones Base</p>
                                    <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tighter">
                                        {summary.sales.totalSales.toString().padStart(2, '0')}
                                    </p>
                                </div>
                                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Ticket Promedio</p>
                                    <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tighter">
                                        ${summary.sales.totalSales > 0
                                            ? (summary.sales.totalRevenue / summary.sales.totalSales).toLocaleString("es-AR", { minimumFractionDigits: 2 })
                                            : "0.00"
                                        }
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Productos Más Vendidos - Preview */}
                <motion.div variants={item}>
                    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-zinc-100 group-hover:bg-zinc-900 group-hover:text-zinc-100 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-all duration-300">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black italic tracking-tighter uppercase">Ranking de Productos</CardTitle>
                                    <CardDescription className="font-medium text-zinc-500">Los 5 productos con mayor rotación y margen este mes.</CardDescription>
                                </div>
                            </div>
                            <Button variant="ghost" className="font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50" asChild>
                                <Link href="/reports/products">
                                    Análisis completo <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {summary.topProducts.length === 0 ? (
                                    <p className="text-center text-zinc-400 italic py-6">Sin registros de actividad para procesar el ranking.</p>
                                ) : (
                                    summary.topProducts.map((product, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800">
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl font-black text-zinc-200 dark:text-zinc-800 italic w-8">#{index + 1}</span>
                                                <span className="font-bold text-zinc-900 dark:text-zinc-100">{product.name}</span>
                                            </div>
                                            <div className="flex items-center gap-8 tabular-nums">
                                                <span className="text-xs font-black uppercase tracking-tighter text-zinc-400">{product.quantity} Uds.</span>
                                                <span className="font-mono font-black text-zinc-900 dark:text-zinc-100">${product.revenue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Reporte de Inventario - Preview */}
                <motion.div variants={item}>
                    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                                    <Package className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black italic tracking-tighter uppercase">Estatus de Activos</CardTitle>
                                    <CardDescription className="font-medium text-zinc-500">Valorización total de existencias y alertas de reposición.</CardDescription>
                                </div>
                            </div>
                            <Button variant="outline" className="font-bold border-zinc-200 dark:border-zinc-800" asChild>
                                <Link href="/reports/inventory">
                                    Auditar inventario <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">CATÁLOGO TOTAL</p>
                                    <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono tracking-tighter">{summary.inventory.totalProducts}</p>
                                </div>
                                <div className="p-4 rounded-xl border border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-center">
                                    <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">CRÍTICO / BAJO</p>
                                    <p className="text-2xl font-black text-zinc-100 dark:text-zinc-900 font-mono tracking-tighter">{summary.inventory.lowStock}</p>
                                </div>
                                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 text-center flex flex-col items-center justify-center">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">STOCK CERO</p>
                                    <div className="flex items-center gap-1">
                                        <XCircle className="h-3 w-3 text-zinc-400" />
                                        <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono tracking-tighter">{summary.inventory.outOfStock}</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center font-mono font-bold italic">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">VALOR TOTAL USD</p>
                                    <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">${summary.inventory.totalValue.toLocaleString("es-AR", { minimumFractionDigits: 0 })}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Análisis de Clientes - Preview */}
                    <motion.div variants={item}>
                        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-zinc-500" />
                                    </div>
                                    <CardTitle className="text-sm font-black uppercase tracking-widest">Cartera Comercial</CardTitle>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/reports/clients"><ArrowRight className="h-4 w-4" /></Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Base Total</p>
                                        <p className="text-2xl font-black tabular-nums tracking-tighter text-zinc-900 dark:text-zinc-100">{summary.clients.total}</p>
                                    </div>
                                    <div className="bg-zinc-900 dark:bg-zinc-100 p-4 rounded-xl text-zinc-100 dark:text-zinc-900">
                                        <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Activos Mes</p>
                                        <p className="text-2xl font-black tabular-nums tracking-tighter">{summary.clients.active}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">CLIENTES TOP POR RECAUDACIÓN</p>
                                    {summary.clients.topClients.slice(0, 3).map((client, index) => (
                                        <div key={index} className="flex items-center justify-between text-xs p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/30">
                                            <div className="flex items-center gap-2">
                                                <Crown className="h-3 w-3 text-zinc-300" />
                                                <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[120px]">{client.name}</span>
                                            </div>
                                            <span className="font-mono font-black text-zinc-900 dark:text-zinc-100">${client.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Reporte de Empleados - Preview */}
                    <motion.div variants={item}>
                        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                                        <LineChart className="w-5 h-5 text-zinc-500" />
                                    </div>
                                    <CardTitle className="text-sm font-black uppercase tracking-widest">Gestión Humana</CardTitle>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/reports/employees"><ArrowRight className="h-4 w-4" /></Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-dotted border-zinc-200 dark:border-zinc-700">
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Rendimiento Operativo</span>
                                        <Badge variant="outline" className="font-black italic">VINCULADO</Badge>
                                    </div>
                                    <p className="text-xs font-medium text-zinc-400 leading-relaxed italic">
                                        Acceda al módulo completo para auditar comisiones por venta, cumplimiento de objetivos y ranking de desempeño individual.
                                    </p>
                                    <Button className="w-full font-black uppercase italic tracking-widest h-12 shadow-lg shadow-zinc-900/20" asChild>
                                        <Link href="/reports/employees">Auditoría Perfil Personal</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}
