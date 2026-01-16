import { getSession } from "@/actions/auth-actions"
import { getClientsReport, PeriodType } from "@/actions/report-actions"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
    Download,
    Users,
    UserPlus,
    DollarSign,
    ShoppingCart,
    Crown,
    ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ReportPeriodSelector } from "@/components/reports/period-selector"

export default async function ClientsReportPage({ 
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

    const report = await getClientsReport(period)

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
                        <h1 className="text-3xl font-bold tracking-tight">Análisis de Clientes</h1>
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
                        <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{report.summary.totalClients}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            En base de datos
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{report.summary.activeClients}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Con compras en el período
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clientes Nuevos</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{report.summary.newClients}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Registrados en el período
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos de Clientes</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${report.summary.totalRevenue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total facturado a clientes
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Clients */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        Mejores Clientes
                    </CardTitle>
                    <CardDescription>Clientes con mayor facturación en el período</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-5">
                        {report.topClients.slice(0, 5).map((client, index) => (
                            <Card key={client.id} className="relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-8 h-8 flex items-center justify-center text-white font-bold ${
                                    index === 0 ? "bg-yellow-500" : 
                                    index === 1 ? "bg-gray-400" : 
                                    index === 2 ? "bg-amber-600" : "bg-primary"
                                }`}>
                                    {index + 1}
                                </div>
                                <CardHeader className="pt-10">
                                    <CardTitle className="text-base truncate">
                                        <Link href={`/clients/${client.id}`} className="hover:underline">
                                            {client.name}
                                        </Link>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Compras:</span>
                                            <span className="font-medium">{client.periodSales}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Total:</span>
                                            <span className="font-semibold text-green-600">
                                                ${client.periodRevenue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Ticket Prom.:</span>
                                            <span className="font-medium">
                                                ${client.avgTicket.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Full Clients Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Todos los Clientes</CardTitle>
                    <CardDescription>Actividad de clientes en el período</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border max-h-[600px] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Teléfono</TableHead>
                                    <TableHead className="text-right">Compras (período)</TableHead>
                                    <TableHead className="text-right">Total (período)</TableHead>
                                    <TableHead className="text-right">Ticket Prom.</TableHead>
                                    <TableHead className="text-right">Compras Totales</TableHead>
                                    <TableHead>Última Compra</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {report.allClients.map((client) => (
                                    <TableRow key={client.id} className={client.periodSales === 0 ? "opacity-50" : ""}>
                                        <TableCell>
                                            <Link href={`/clients/${client.id}`} className="font-medium hover:underline">
                                                {client.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{client.email || "-"}</TableCell>
                                        <TableCell className="text-muted-foreground">{client.phone || "-"}</TableCell>
                                        <TableCell className="text-right">
                                            {client.periodSales > 0 ? (
                                                <Badge variant="default">{client.periodSales}</Badge>
                                            ) : (
                                                <Badge variant="secondary">0</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            ${client.periodRevenue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            ${client.avgTicket.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {client.totalSalesAllTime}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {client.lastSale 
                                                ? format(new Date(client.lastSale), "dd MMM yyyy", { locale: es })
                                                : "-"
                                            }
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
