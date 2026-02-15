"use client"

import { useOfflineData } from "@/hooks/use-offline-data"
import { getEmployeeReports } from "@/actions/employee-report-actions"
import { OfflineDataBadge } from "@/components/offline/offline-data-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Users,
    DollarSign,
    ArrowLeft,
    Timer,
    Banknote,
    AlertTriangle,
    Award,
    Loader2
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ExportButton } from "@/components/export-button"
import { useMemo } from "react"

const roleLabels: Record<string, string> = {
    owner: 'Dueño',
    admin: 'Administrador',
    manager: 'Gerente',
    cashier: 'Cajero',
    waiter: 'Mesero',
    viewer: 'Visor'
}

const roleColors: Record<string, string> = {
    owner: 'bg-amber-500',
    admin: 'bg-purple-500',
    manager: 'bg-blue-500',
    cashier: 'bg-green-500',
    waiter: 'bg-cyan-500',
    viewer: 'bg-gray-500'
}

export function EmployeeReportsContent() {
    const { data, isOfflineData, dataUpdatedAt, isLoading } = useOfflineData(
        ['employeeReports'],
        getEmployeeReports
    )

    const exportData = useMemo(() => {
        if (!data?.report) return []
        return data.report.map((emp: any) => ({
            Nombre: emp.name,
            Email: emp.email,
            Rol: roleLabels[emp.role] || emp.role,
            'Ventas ($)': emp.totalSales.toFixed(2),
            'Cantidad Ventas': emp.salesCount,
            'Horas Trabajadas': emp.hoursWorked,
            'Días Trabajados': emp.daysWorked,
            'Promedio x Venta': emp.averagePerSale.toFixed(2),
            'Ventas x Hora': emp.salesPerHour.toFixed(1),
            'Diferencia Caja': emp.cashDifference.toFixed(2),
            'Comisión (%)': emp.commissionRate,
            'Comisión ($)': emp.commission.toFixed(2)
        }))
    }, [data?.report])

    if (isLoading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                <p className="text-sm text-zinc-500">Cargando reporte de empleados...</p>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-sm text-zinc-500">No se pudo cargar el reporte. Verifica tu conexión.</p>
                <Link href="/reports">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 w-4 h-4" /> Volver a Reportes
                    </Button>
                </Link>
            </div>
        )
    }

    const { report, totals, period } = data

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/reports">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reporte de Empleados</h1>
                        <p className="text-muted-foreground">
                            {format(new Date(period.start), "dd MMM", { locale: es })} - {format(new Date(period.end), "dd MMM yyyy", { locale: es })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <OfflineDataBadge isOfflineData={isOfflineData} dataUpdatedAt={dataUpdatedAt} />
                    <ExportButton
                        data={exportData}
                        filename={`empleados-${format(new Date(), 'yyyy-MM')}`}
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${totals.totalSales.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {totals.totalCount} transacciones
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Horas Trabajadas</CardTitle>
                        <Timer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totals.totalHours.toFixed(0)} hs
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {report.length} empleados activos
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Comisiones</CardTitle>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${totals.totalCommission.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total a pagar en comisiones
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
                        <Award className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate">
                            {report[0]?.name || '-'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {report[0] ? `$${report[0].totalSales.toLocaleString('es-AR')} en ventas` : 'Sin ventas'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Employees Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Rendimiento por Empleado
                    </CardTitle>
                    <CardDescription>
                        Métricas detalladas de cada empleado en el período
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-8">#</TableHead>
                                <TableHead>Empleado</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead className="text-right">Ventas ($)</TableHead>
                                <TableHead className="text-right">Cant.</TableHead>
                                <TableHead className="text-right">Horas</TableHead>
                                <TableHead className="text-right">$/Hora</TableHead>
                                <TableHead className="text-right">Dif. Caja</TableHead>
                                <TableHead className="text-right">Comisión</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {report.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                        No hay datos de empleados para este período
                                    </TableCell>
                                </TableRow>
                            ) : (
                                report.map((emp: any, index: number) => (
                                    <TableRow key={emp.id}>
                                        <TableCell className="font-medium">
                                            {index === 0 && <Award className="w-4 h-4 text-amber-500" />}
                                            {index !== 0 && index + 1}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{emp.name}</div>
                                                <div className="text-xs text-muted-foreground">{emp.email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={`${roleColors[emp.role] || 'bg-gray-500'} text-white`}>
                                                {roleLabels[emp.role] || emp.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ${emp.totalSales.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-right">{emp.salesCount}</TableCell>
                                        <TableCell className="text-right">
                                            {emp.hoursWorked > 0 ? `${emp.hoursWorked} hs` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {emp.hoursWorked > 0 ? `$${(emp.totalSales / emp.hoursWorked).toFixed(0)}` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {emp.cashDifference !== 0 ? (
                                                <span className={emp.cashDifference < 0 ? 'text-red-500' : 'text-green-500'}>
                                                    {emp.cashDifference > 0 ? '+' : ''}${emp.cashDifference.toFixed(2)}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {emp.commission > 0 ? (
                                                <span className="text-green-600 font-medium">
                                                    ${emp.commission.toFixed(2)}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Cash Alerts */}
            {report.some((emp: any) => emp.cashDifference < -50) && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                            Alertas de Caja
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {report.filter((emp: any) => emp.cashDifference < -50).map((emp: any) => (
                                <li key={emp.id} className="flex items-center gap-2 text-red-700">
                                    <span className="font-medium">{emp.name}</span>
                                    <span>tiene un faltante acumulado de</span>
                                    <span className="font-bold">${Math.abs(emp.cashDifference).toFixed(2)}</span>
                                    <span>en {emp.shiftsWithDifference} turno(s)</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
