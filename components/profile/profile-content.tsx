"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { 
    User, 
    Mail, 
    Calendar, 
    ShoppingCart, 
    Lock, 
    KeyRound, 
    Monitor,
    Shield,
    Crown,
    Briefcase,
    UtensilsCrossed,
    Eye,
    ChevronRight,
    Check
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChangePasswordForm } from "./change-password-form"
import { PinSetupSection } from "./pin-setup-section"
import { KioskConfigSection } from "./kiosk-config-section"
import { BusinessCodeSection } from "./business-code-section"
import { SYSTEM_ROLES, type SystemRole } from "@/lib/permissions"

interface ProfileContentProps {
    user: {
        id: number
        name: string
        email: string
        role: string
        hasPin: boolean
        createdAt: string
        salesCount: number
    }
    organization?: {
        name: string
        businessCode: string
    }
    emailVerified: boolean
    isAdmin: boolean
    isOwner: boolean
}

const roleIcons: Record<string, typeof Shield> = {
    owner: Crown,
    admin: Shield,
    manager: Briefcase,
    cashier: ShoppingCart,
    waiter: UtensilsCrossed,
    viewer: Eye
}

const roleColors: Record<string, string> = {
    owner: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    admin: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    manager: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    cashier: "bg-green-500/10 text-green-600 border-green-500/20",
    waiter: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    viewer: "bg-gray-500/10 text-gray-600 border-gray-500/20"
}

export function ProfileContent({ user, organization, emailVerified, isAdmin, isOwner }: ProfileContentProps) {
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    
    const roleInfo = SYSTEM_ROLES[user.role as SystemRole]
    const RoleIcon = roleIcons[user.role] || User
    const roleColor = roleColors[user.role] || "bg-gray-500/10 text-gray-600"

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
                <p className="text-muted-foreground">
                    Gestiona tu cuenta y configuración
                </p>
            </div>

            {/* User Card */}
            <div className="rounded-lg border bg-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-background shadow-lg">
                            <span className="text-3xl font-semibold text-primary">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className={cn(
                            "absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-background",
                            roleColor
                        )}>
                            <RoleIcon className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-4">
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight">
                                {user.name}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {user.email}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className={cn("text-xs", roleColor)}>
                                    <RoleIcon className="w-3 h-3 mr-1" />
                                    {roleInfo?.name || user.role}
                                </Badge>
                                {user.hasPin && (
                                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                                        <KeyRound className="w-3 h-3 mr-1" />
                                        PIN activo
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-md bg-muted">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Miembro desde</p>
                                    <p className="text-sm font-medium">
                                        {format(new Date(user.createdAt), "MMM yyyy", { locale: es })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-md bg-muted">
                                    <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Ventas realizadas</p>
                                    <p className="text-sm font-medium">{user.salesCount}</p>
                                </div>
                            </div>
                            {roleInfo && (
                                <div className="col-span-2 sm:col-span-1 flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-muted">
                                        <Shield className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Rol</p>
                                        <p className="text-sm font-medium">{roleInfo.name}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Role description */}
                        {roleInfo && (
                            <p className="text-sm text-muted-foreground border-t pt-4">
                                {roleInfo.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Security Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Seguridad
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Password Card */}
                    <div className="rounded-lg border bg-card overflow-hidden">
                        <button
                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-md bg-muted">
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium">Contraseña</p>
                                    <p className="text-sm text-muted-foreground">
                                        Cambia tu contraseña de acceso
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className={cn(
                                "w-4 h-4 text-muted-foreground transition-transform",
                                showPasswordForm && "rotate-90"
                            )} />
                        </button>
                        
                        {showPasswordForm && (
                            <div className="px-4 pb-4 border-t">
                                <div className="pt-4">
                                    <ChangePasswordForm />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* PIN Card */}
                    <PinSetupSection hasPin={user.hasPin} />
                </div>
            </div>

            {/* Kiosk Section - Only for admins */}
            {isAdmin && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Monitor className="w-5 h-5" />
                        Modo Kiosco
                    </h3>
                    <div className="rounded-lg border bg-card p-6">
                        <KioskConfigSection />
                    </div>
                </div>
            )}

            {/* Business Code Section - Only for owners */}
            {isOwner && organization && (
                <BusinessCodeSection 
                    businessCode={organization.businessCode}
                    businessName={organization.name}
                    emailVerified={emailVerified}
                    userEmail={user.email}
                />
            )}
        </div>
    )
}
