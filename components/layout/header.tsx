"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { CircleUser, Menu, Home, Search, Users, RefreshCw, Lock, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { HelpDialog } from "@/components/help/help-dialog"
import { OfflineStatus } from "@/components/pwa/offline-status"
import { logoutUser } from '@/actions/auth-actions'
import { lockKiosk, getKioskSession } from '@/actions/kiosk-actions'
import { startTransition } from 'react'

// Lazy load UserQuickLogin - only loads when user clicks "Cambiar usuario"
const UserQuickLogin = dynamic(
    () => import("@/components/employees/user-quick-login").then(mod => ({ default: mod.UserQuickLogin })),
    { ssr: false }
)

interface HeaderProps {
    children?: React.ReactNode
}

export function Header({ children }: HeaderProps) {
    const router = useRouter()
    const [showQuickLogin, setShowQuickLogin] = useState(false)
    const [isKioskMode, setIsKioskMode] = useState(false)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    useEffect(() => {
        // Check if we're in kiosk mode
        async function checkKiosk() {
            const session = await getKioskSession()
            setIsKioskMode(!!(session?.kioskMode && session?.activeEmployeeId != null))
        }
        checkKiosk()
    }, [])

    const handleLogout = async () => {
        startTransition(async () => {
            await logoutUser()
            router.push('/login')
            router.refresh()
        })
    }

    const handleLockKiosk = async () => {
        await lockKiosk()
        router.push('/kiosk')
    }

    const handleUserSwitched = () => {
        setShowQuickLogin(false)
        router.refresh()
    }

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Sheet open={isSheetOpen} onOpenChange={(e) => setIsSheetOpen(e.open)}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0 w-72 border-r">
                    <div className="h-full" onClick={() => setIsSheetOpen(false)}>
                        {children}
                    </div>
                </SheetContent>
            </Sheet>
            <div className="w-full flex-1 min-w-0">
                <form>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar productos..."
                            className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                        />
                    </div>
                </form>
            </div>

            {/* Botón para cambio rápido de usuario */}
            <Button
                variant="ghost"
                size="icon"
                title="Cambiar usuario"
                onClick={() => setShowQuickLogin(true)}
            >
                <RefreshCw className="h-5 w-5" />
                <span className="sr-only">Cambiar usuario</span>
            </Button>

            {/* Botón de bloquear kiosko (solo en modo kiosco) */}
            {isKioskMode && (
                <Button
                    variant="ghost"
                    size="icon"
                    title="Bloquear kiosco"
                    onClick={handleLockKiosk}
                >
                    <Lock className="h-5 w-5" />
                    <span className="sr-only">Bloquear kiosco</span>
                </Button>
            )}

            {/* Botón para ir a la landing */}
            <Button variant="ghost" size="icon" asChild title="Ir a la página principal">
                <Link href="/">
                    <Home className="h-5 w-5" />
                    <span className="sr-only">Página principal</span>
                </Link>
            </Button>

            {/* Botón para ver novedades/changelog */}
            <Button variant="ghost" size="icon" asChild title="Ver novedades">
                <Link href="/changelog">
                    <Sparkles className="h-5 w-5" />
                    <span className="sr-only">Novedades</span>
                </Link>
            </Button>

            {/* Dialog de ayuda */}
            <HelpDialog />

            {/* Offline/Sync Status */}
            <OfflineStatus />

            <ThemeToggle />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                        <CircleUser className="h-5 w-5" />
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => router.push('/profile')}>Perfil</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setShowQuickLogin(true)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Cambiar usuario
                    </DropdownMenuItem>
                    {isKioskMode && (
                        <DropdownMenuItem onSelect={handleLockKiosk}>
                            <Lock className="w-4 h-4 mr-2" />
                            Bloquear kiosco
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onSelect={handleLogout}>Cerrar sesión</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick Login Dialog */}
            {showQuickLogin && (
                <UserQuickLogin
                    onClose={() => setShowQuickLogin(false)}
                    onLogin={handleUserSwitched}
                />
            )}
        </header>
    )
}
