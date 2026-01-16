import { getSession, getAuditLogs } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, LogIn, LogOut, Plus, Edit, Trash2, RefreshCw, ShoppingCart, Activity, UserPlus, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

function getActionIcon(action: string) {
    switch (action) {
        case "login":
            return <LogIn className="w-4 h-4 text-green-600" />
        case "logout":
            return <LogOut className="w-4 h-4 text-gray-600" />
        case "create":
            return <Plus className="w-4 h-4 text-blue-600" />
        case "update":
            return <Edit className="w-4 h-4 text-yellow-600" />
        case "delete":
        case "deactivate":
            return <Trash2 className="w-4 h-4 text-red-600" />
        case "activate":
            return <RefreshCw className="w-4 h-4 text-green-600" />
        case "sale":
            return <ShoppingCart className="w-4 h-4 text-purple-600" />
        case "refund":
            return <RefreshCw className="w-4 h-4 text-orange-600" />
        case "change_password":
            return <Shield className="w-4 h-4 text-blue-600" />
        default:
            return <Shield className="w-4 h-4 text-gray-600" />
    }
}

function getActionBadge(action: string) {
    const colors: Record<string, string> = {
        login: "bg-green-100 text-green-700",
        logout: "bg-gray-100 text-gray-700",
        create: "bg-blue-100 text-blue-700",
        update: "bg-yellow-100 text-yellow-700",
        delete: "bg-red-100 text-red-700",
        deactivate: "bg-orange-100 text-orange-700",
        activate: "bg-green-100 text-green-700",
        sale: "bg-purple-100 text-purple-700",
        refund: "bg-orange-100 text-orange-700",
        change_password: "bg-blue-100 text-blue-700"
    }

    const labels: Record<string, string> = {
        login: "Inicio sesión",
        logout: "Cierre sesión",
        create: "Creación",
        update: "Actualización",
        delete: "Eliminación",
        deactivate: "Desactivación",
        activate: "Activación",
        sale: "Venta",
        refund: "Reembolso",
        change_password: "Cambio contraseña"
    }

    return (
        <Badge className={colors[action] || "bg-gray-100 text-gray-700"}>
            {labels[action] || action}
        </Badge>
    )
}

function getEntityLabel(entity: string) {
    const labels: Record<string, string> = {
        user: "Usuario",
        product: "Producto",
        sale: "Venta",
        client: "Cliente",
        category: "Categoría",
        supplier: "Proveedor",
        discount: "Descuento"
    }
    return labels[entity] || entity
}

export default async function AuditLogsPage() {
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    // Only admins and owners can view audit logs
    if (session.role !== "admin" && session.role !== "owner") {
        redirect("/dashboard")
    }

    const logs = await getAuditLogs({ limit: 200 })

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Registro de Auditoría</h1>
                <p className="text-muted-foreground">
                    Historial de acciones realizadas en el sistema
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Registros
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{logs.length}</div>
                        <p className="text-xs text-muted-foreground">últimas acciones</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Inicios de Sesión
                        </CardTitle>
                        <LogIn className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {logs.filter(l => l.action === "login").length}
                        </div>
                        <p className="text-xs text-muted-foreground">accesos al sistema</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Creaciones
                        </CardTitle>
                        <UserPlus className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {logs.filter(l => l.action === "create").length}
                        </div>
                        <p className="text-xs text-muted-foreground">nuevos registros</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Eliminaciones
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {logs.filter(l => l.action === "delete" || l.action === "deactivate").length}
                        </div>
                        <p className="text-xs text-muted-foreground">acciones destructivas</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                    <CardDescription>
                        Últimas {logs.length} acciones registradas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {logs.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No hay registros de auditoría
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Acción</TableHead>
                                        <TableHead>Entidad</TableHead>
                                        <TableHead>Detalles</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                {getActionIcon(log.action)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground whitespace-nowrap">
                                                {format(new Date(log.createdAt), "dd MMM yyyy HH:mm", { locale: es })}
                                            </TableCell>
                                            <TableCell>
                                                {log.user ? (
                                                    <span className="font-medium">{log.user.name}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">Sistema</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getActionBadge(log.action)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {getEntityLabel(log.entity)}
                                                    {log.entityId && ` #${log.entityId}`}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[300px] truncate text-muted-foreground">
                                                {log.details || "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
