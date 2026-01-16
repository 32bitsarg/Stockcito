"use client"

import { useRouter } from "next/navigation"
import { CircleUser, LogOut, Settings, User, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { logoutUser } from "@/actions/auth-actions"
import { startTransition } from "react"

interface UserMenuProps {
    user: {
        name: string
        email: string
        role: string
    } | null
}

function getRoleBadge(role: string) {
    switch (role) {
        case "admin":
            return <Badge className="bg-purple-100 text-purple-700 text-xs">Admin</Badge>
        case "cashier":
            return <Badge className="bg-blue-100 text-blue-700 text-xs">Cajero</Badge>
        case "viewer":
            return <Badge className="bg-gray-100 text-gray-700 text-xs">Visor</Badge>
        default:
            return null
    }
}

export function UserMenu({ user }: UserMenuProps) {
    const router = useRouter()

    const handleLogout = async () => {
        startTransition(async () => {
            await logoutUser()
            router.push("/login")
            router.refresh()
        })
    }

    if (!user) {
        return (
            <Button variant="outline" onClick={() => router.push("/login")}>
                Iniciar sesión
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                    <CircleUser className="h-5 w-5" />
                    <span className="sr-only">Menú de usuario</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            {getRoleBadge(user.role)}
                        </div>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                </DropdownMenuItem>
                {user.role === "admin" && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push("/users")}>
                            <Shield className="mr-2 h-4 w-4" />
                            Administrar Usuarios
                        </DropdownMenuItem>
                    </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
