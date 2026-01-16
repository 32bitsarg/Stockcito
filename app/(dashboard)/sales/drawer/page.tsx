import { getSession } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { getCashDrawers, getCurrentDrawerStatus, getShiftHistory } from "@/actions/employee-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CashDrawerPanel } from "@/components/employees/cash-drawer-panel"
import { hasPermission, getUserPermissions, type SystemRole } from "@/lib/permissions"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { 
    Calculator, 
    DollarSign, 
    TrendingUp, 
    TrendingDown,
    Clock,
    Plus
} from "lucide-react"

export default async function CashDrawerPage() {
    const session = await getSession()
    
    if (!session) {
        redirect("/login")
    }

    const [drawers, currentDrawer, shiftHistory] = await Promise.all([
        getCashDrawers(),
        getCurrentDrawerStatus(),
        getShiftHistory(undefined, undefined, 10)
    ])

    const permissions = getUserPermissions(session.role as SystemRole, null)
    const canCreateDrawer = hasPermission(permissions, 'settings', 'editOrganization')
    const canCashOut = hasPermission(permissions, 'cashDrawer', 'cashOut')

    // Stats from recent shifts
    const totalSalesRecent = shiftHistory.reduce((acc, s) => acc + Number(s.totalSales || 0), 0)
    const totalDifference = shiftHistory.reduce((acc, s) => acc + Number(s.difference || 0), 0)

    const formatMoney = (amount: number) => {
        return amount.toLocaleString("es-AR", { 
            style: "currency", 
            currency: "ARS",
            minimumFractionDigits: 2
        })
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return <Badge className="bg-green-100 text-green-700">Abierta</Badge>
            case 'closed':
                return <Badge className="bg-gray-100 text-gray-700">Cerrada</Badge>
            case 'locked':
                return <Badge className="bg-red-100 text-red-700">Bloqueada</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Caja</h1>
                    <p className="text-muted-foreground">
                        Control de efectivo y turnos
                    </p>
                </div>
                {canCreateDrawer && (
                    <Button asChild>
                        <Link href="/sales/drawer/new">
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Caja
                        </Link>
                    </Button>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Current Drawer Panel */}
                <CashDrawerPanel 
                    drawer={currentDrawer ? {
                        id: currentDrawer.id,
                        name: currentDrawer.name,
                        status: 'open',
                        currentAmount: currentDrawer.currentAmount,
                        expectedAmount: currentDrawer.expectedAmount,
                        openingAmount: currentDrawer.openingAmount,
                        openedAt: currentDrawer.openedAt
                    } : null}
                    userCanCashOut={canCashOut}
                />

                {/* Stats */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            Ventas Recientes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatMoney(totalSalesRecent)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            últimos {shiftHistory.length} turnos
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            {totalDifference >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            Diferencia Acumulada
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${
                            totalDifference === 0 
                                ? 'text-gray-600' 
                                : totalDifference > 0 
                                    ? 'text-blue-600' 
                                    : 'text-red-600'
                        }`}>
                            {formatMoney(totalDifference)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {totalDifference === 0 
                                ? 'Cuadrado' 
                                : totalDifference > 0 
                                    ? 'Sobrante' 
                                    : 'Faltante'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* All Drawers */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Cajas Disponibles
                    </CardTitle>
                    <CardDescription>
                        Estado actual de todas las cajas del sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Caja</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Usuario Actual</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Terminal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {drawers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No hay cajas configuradas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                drawers.map((drawer) => (
                                    <TableRow key={drawer.id}>
                                        <TableCell className="font-medium">
                                            {drawer.name}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(drawer.status)}
                                        </TableCell>
                                        <TableCell>
                                            {drawer.currentUser?.name || (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {drawer.status === 'open' && drawer.currentAmount
                                                ? formatMoney(Number(drawer.currentAmount))
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {drawer.terminalId || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Shift History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Historial de Turnos
                    </CardTitle>
                    <CardDescription>
                        Últimos cierres de caja
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Caja</TableHead>
                                <TableHead>Ventas</TableHead>
                                <TableHead>Esperado</TableHead>
                                <TableHead>Contado</TableHead>
                                <TableHead>Diferencia</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shiftHistory.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No hay historial de turnos
                                    </TableCell>
                                </TableRow>
                            ) : (
                                shiftHistory.map((shift) => {
                                    const diff = Number(shift.difference || 0)
                                    return (
                                        <TableRow key={shift.id}>
                                            <TableCell className="font-medium">
                                                {format(new Date(shift.startedAt), "d MMM HH:mm", { locale: es })}
                                            </TableCell>
                                            <TableCell>{shift.drawer?.name || '-'}</TableCell>
                                            <TableCell className="text-green-600">
                                                {formatMoney(Number(shift.totalSales || 0))}
                                            </TableCell>
                                            <TableCell>
                                                {shift.expectedAmount 
                                                    ? formatMoney(Number(shift.expectedAmount))
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {shift.closingAmount 
                                                    ? formatMoney(Number(shift.closingAmount))
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className={
                                                diff === 0 
                                                    ? 'text-gray-600' 
                                                    : diff > 0 
                                                        ? 'text-blue-600' 
                                                        : 'text-red-600'
                                            }>
                                                {shift.difference !== null 
                                                    ? formatMoney(diff)
                                                    : '-'}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
