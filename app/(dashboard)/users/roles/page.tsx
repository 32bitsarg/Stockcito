import { getSession } from "@/actions/auth-actions"
import { getRoles } from "@/actions/employee-actions"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
    Shield, 
    Users,
    ArrowLeft,
    Plus,
    Settings,
    Crown,
    UserCog,
    User,
    Eye
} from "lucide-react"
import Link from "next/link"
import { RolesManager } from "@/components/employees/roles-manager"
import { getUserPermissions, hasPermission, type SystemRole } from "@/lib/permissions"

const iconMap: Record<string, React.ComponentType<any>> = {
    crown: Crown,
    shield: Shield,
    'user-cog': UserCog,
    user: User,
    users: Users,
    eye: Eye,
    settings: Settings
}

export default async function RolesPage() {
    const session = await getSession()
    
    if (!session?.organizationId) {
        redirect("/login")
    }

    // Verificar permisos
    const permissions = getUserPermissions(session.role as SystemRole, null)
    const canEditRoles = hasPermission(permissions, 'users', 'editRoles')

    if (!canEditRoles) {
        redirect("/users?error=Sin permisos para gestionar roles")
    }

    const roles = await getRoles()

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/users">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Roles y Permisos</h1>
                        <p className="text-muted-foreground">
                            Gestiona los roles del sistema y crea roles personalizados
                        </p>
                    </div>
                </div>
            </div>

            {/* Roles del Sistema */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Roles del Sistema
                    </CardTitle>
                    <CardDescription>
                        Estos roles vienen predefinidos y no pueden ser modificados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {roles.filter(r => r.isSystem).map((role) => {
                            const IconComponent = iconMap[role.icon || 'user'] || User
                            return (
                                <div 
                                    key={role.code} 
                                    className="flex items-start gap-3 p-4 rounded-lg border bg-muted/20"
                                >
                                    <div 
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                                        style={{ backgroundColor: role.color || '#6366f1' }}
                                    >
                                        <IconComponent className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{role.name}</h3>
                                            <Badge variant="secondary" className="text-xs">Sistema</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {role.description}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Roles Personalizados */}
            <RolesManager 
                customRoles={roles.filter(r => !r.isSystem)} 
            />
        </div>
    )
}
