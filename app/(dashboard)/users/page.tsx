import { getUsers, getSession } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Shield, User, Eye, ShoppingCart, Users, UserCheck, Crown, Edit } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ToggleUserButton } from "@/components/users/toggle-user-button"
import { DeleteUserButton } from "@/components/users/delete-user-button"
import { PageHeader } from "@/components/layout/page-header"
import * as motion from "framer-motion/client"

function getRoleBadge(role: string) {
    switch (role) {
        case "admin":
            return <Badge className="bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 border-none font-bold italic"><Shield className="w-3 h-3 mr-1" />Admin</Badge>
        case "cashier":
            return <Badge className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 font-bold"><ShoppingCart className="w-3 h-3 mr-1" />Cajero</Badge>
        case "viewer":
            return <Badge variant="outline" className="text-zinc-500 border-zinc-200 dark:border-zinc-800 font-bold"><Eye className="w-3 h-3 mr-1" />Visor</Badge>
        default:
            return <Badge variant="secondary" className="font-bold uppercase tracking-widest text-[10px]">{role}</Badge>
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
        <div className="pb-10">
            <PageHeader
                title="Usuarios"
                subtitle="Gestión de acceso, roles administrativos y auditoría de personal."
            >
                <Button asChild className="shadow-md shadow-zinc-900/10 dark:shadow-white/5">
                    <Link href="/users/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Usuario
                    </Link>
                </Button>
            </PageHeader>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="grid gap-6 md:grid-cols-3 mb-8"
            >
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">
                            Total Usuarios
                        </CardTitle>
                        <Users className="h-4 w-4 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50 font-mono italic">
                            {users.length.toString().padStart(2, '0')}
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-tighter">Cuentas registradas</p>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">
                            En línea / Activos
                        </CardTitle>
                        <UserCheck className="h-4 w-4 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50 font-mono italic">
                            {users.filter(u => u.active).length.toString().padStart(2, '0')}
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-tighter">Autorizados para operar</p>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">
                            Privilegios Altos
                        </CardTitle>
                        <Crown className="h-4 w-4 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50 font-mono italic">
                            {users.filter(u => u.role === "admin").length.toString().padStart(2, '0')}
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-tighter">Roles administrativos</p>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm"
            >
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                            <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Identidad</TableHead>
                            <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Email institucional</TableHead>
                            <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Rol</TableHead>
                            <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs text-center">Ventas</TableHead>
                            <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Estado</TableHead>
                            <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Alta</TableHead>
                            <TableHead className="text-right font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-xs">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-48 text-zinc-500 font-medium italic">
                                    No hay usuarios registrados en la infraestructura.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className={`${!user.active ? "opacity-40 grayscale" : ""} group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors`}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:bg-zinc-900 group-hover:text-zinc-100 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-colors">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-500 font-medium text-xs">
                                        {user.email}
                                    </TableCell>
                                    <TableCell>
                                        {getRoleBadge(user.role)}
                                    </TableCell>
                                    <TableCell className="text-center font-mono font-bold text-xs">
                                        {user._count.sales.toString().padStart(2, '0')}
                                    </TableCell>
                                    <TableCell>
                                        {user.active ? (
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Activo</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 grayscale">
                                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Suspendido</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 font-bold text-[10px] uppercase">
                                        {format(new Date(user.createdAt), "dd MMM yy", { locale: es })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500" asChild>
                                                <Link href={`/users/${user.id}/edit`}>
                                                    <Edit className="h-4 w-4" />
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
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </motion.div>
        </div>
    )
}
