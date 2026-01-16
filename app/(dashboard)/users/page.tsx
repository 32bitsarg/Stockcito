import { getUsers, getSession } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Shield, User, Eye, ShoppingCart, Users, UserCheck, Crown } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ToggleUserButton } from "@/components/users/toggle-user-button"
import { DeleteUserButton } from "@/components/users/delete-user-button"

function getRoleBadge(role: string) {
    switch (role) {
        case "admin":
            return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100"><Shield className="w-3 h-3 mr-1" />Admin</Badge>
        case "cashier":
            return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><ShoppingCart className="w-3 h-3 mr-1" />Cajero</Badge>
        case "viewer":
            return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100"><Eye className="w-3 h-3 mr-1" />Visor</Badge>
        default:
            return <Badge variant="secondary">{role}</Badge>
    }
}

export default async function UsersPage() {
    const session = await getSession()
    
    if (!session) {
        redirect("/login")
    }

    // Only owner and admin can access users management
    if (!['owner', 'admin'].includes(session.role)) {
        redirect("/dashboard")
    }

    const users = await getUsers()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
                    <p className="text-muted-foreground">
                        Gestiona los usuarios del sistema y sus permisos
                    </p>
                </div>
                <Button asChild>
                    <Link href="/users/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Usuario
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Usuarios
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                        <p className="text-xs text-muted-foreground">usuarios registrados</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Usuarios Activos
                        </CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {users.filter(u => u.active).length}
                        </div>
                        <p className="text-xs text-muted-foreground">pueden acceder al sistema</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Administradores
                        </CardTitle>
                        <Crown className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {users.filter(u => u.role === "admin").length}
                        </div>
                        <p className="text-xs text-muted-foreground">acceso total al sistema</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Usuarios</CardTitle>
                    <CardDescription>
                        Usuarios registrados en el sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {users.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No hay usuarios registrados
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Rol</TableHead>
                                        <TableHead>Ventas</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Creado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id} className={!user.active ? "opacity-50" : ""}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <span className="font-medium">{user.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {user.email}
                                            </TableCell>
                                            <TableCell>
                                                {getRoleBadge(user.role)}
                                            </TableCell>
                                            <TableCell>
                                                {user._count.sales}
                                            </TableCell>
                                            <TableCell>
                                                {user.active ? (
                                                    <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                                                        Activo
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        Inactivo
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {format(new Date(user.createdAt), "dd MMM yyyy", { locale: es })}
                                            </TableCell>
                                            <TableCell className="text-right space-x-1">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/users/${user.id}/edit`}>
                                                        Editar
                                                    </Link>
                                                </Button>
                                                {user.id !== session.id && (
                                                    <>
                                                        <ToggleUserButton 
                                                            userId={user.id} 
                                                            isActive={user.active} 
                                                        />
                                                        <DeleteUserButton 
                                                            userId={user.id} 
                                                            userName={user.name} 
                                                        />
                                                    </>
                                                )}
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
