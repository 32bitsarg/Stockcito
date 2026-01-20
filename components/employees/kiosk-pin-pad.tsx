"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { kioskLoginWithPin, disableKioskMode } from "@/actions/kiosk-actions"
import { cn } from "@/lib/utils"
import {
    Lock,
    Delete,
    LogOut,
    User,
    Store,
    Shield
} from "lucide-react"
import toast from "react-hot-toast"

interface Employee {
    id: number
    name: string
    role: string
    initials: string
    hasPin: boolean
}

interface KioskPinPadProps {
    employees: Employee[]
    organizationName: string
    autoLockMinutes: number
}

const ROLE_LABELS: Record<string, string> = {
    owner: "Dueño",
    admin: "Administrador",
    manager: "Encargado",
    cashier: "Cajero",
    waiter: "Mozo",
    viewer: "Solo lectura"
}

const ROLE_COLORS: Record<string, string> = {
    owner: "bg-purple-100 text-purple-700",
    admin: "bg-blue-100 text-blue-700",
    manager: "bg-green-100 text-green-700",
    cashier: "bg-orange-100 text-orange-700",
    waiter: "bg-yellow-100 text-yellow-700",
    viewer: "bg-gray-100 text-gray-700"
}

export function KioskPinPad({ employees, organizationName, autoLockMinutes }: KioskPinPadProps) {
    const router = useRouter()
    const [pin, setPin] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
    const [showExitDialog, setShowExitDialog] = useState(false)
    const [exitPin, setExitPin] = useState("")

    const handlePinDigit = useCallback((digit: string) => {
        if (pin.length < 6) {
            setPin(prev => prev + digit)
            setError(null)
        }
    }, [pin])

    const handleDelete = useCallback(() => {
        setPin(prev => prev.slice(0, -1))
        setError(null)
    }, [])

    const handleClear = useCallback(() => {
        setPin("")
        setError(null)
    }, [])

    const handleSubmit = async () => {
        if (pin.length < 4) {
            setError("Ingresá al menos 4 dígitos")
            return
        }

        setIsLoading(true)
        setError(null)

        const result = await kioskLoginWithPin(pin)

        if (result.success && result.employee) {
            toast.success(`¡Bienvenido, ${result.employee.name}!`)
            router.push("/sales")
            router.refresh()
        } else {
            setError(result.error || "PIN incorrecto")
            setPin("")
        }

        setIsLoading(false)
    }

    const handleSelectEmployee = (employee: Employee) => {
        setSelectedEmployee(employee)
        setPin("")
        setError(null)
    }

    const handleExitKiosk = async () => {
        if (exitPin.length < 4) {
            setError("Ingresá el PIN de administrador")
            return
        }

        setIsLoading(true)
        const result = await disableKioskMode(exitPin)

        if (result.success) {
            toast.success("Modo kiosco desactivado")
            router.push("/login")
        } else {
            setError(result.error || "PIN incorrecto")
            setExitPin("")
        }

        setIsLoading(false)
    }

    // PIN pad buttons
    const renderPinPad = (currentPin: string, setCurrentPin: (pin: string) => void, onSubmit: () => void) => (
        <div className="space-y-4">
            {/* PIN display */}
            <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-4 h-4 rounded-full border-2 transition-all",
                            i < currentPin.length
                                ? "bg-primary border-primary"
                                : "border-muted-foreground/30"
                        )}
                    />
                ))}
            </div>

            {/* Error message */}
            {error && (
                <p className="text-center text-sm text-destructive">{error}</p>
            )}

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <Button
                        key={num}
                        variant="outline"
                        size="lg"
                        className="h-16 text-2xl font-semibold"
                        onClick={() => {
                            if (currentPin.length < 6) {
                                setCurrentPin(currentPin + num.toString())
                                setError(null)
                            }
                        }}
                        disabled={isLoading}
                    >
                        {num}
                    </Button>
                ))}
                <Button
                    variant="outline"
                    size="lg"
                    className="h-16"
                    onClick={() => setCurrentPin("")}
                    disabled={isLoading}
                >
                    <Delete className="h-6 w-6" />
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="h-16 text-2xl font-semibold"
                    onClick={() => {
                        if (currentPin.length < 6) {
                            setCurrentPin(currentPin + "0")
                            setError(null)
                        }
                    }}
                    disabled={isLoading}
                >
                    0
                </Button>
                <Button
                    variant="default"
                    size="lg"
                    className="h-16"
                    onClick={onSubmit}
                    disabled={isLoading || currentPin.length < 4}
                >
                    {isLoading ? (
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                        <Lock className="h-6 w-6" />
                    )}
                </Button>
            </div>
        </div>
    )

    // Exit kiosk dialog
    if (showExitDialog) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <Shield className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle>Salir del Modo Kiosco</CardTitle>
                    <CardDescription>
                        Ingresá el PIN de administrador para desactivar el modo kiosco
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {renderPinPad(exitPin, setExitPin, handleExitKiosk)}

                    <Button
                        variant="ghost"
                        className="w-full mt-4"
                        onClick={() => {
                            setShowExitDialog(false)
                            setExitPin("")
                            setError(null)
                        }}
                    >
                        Cancelar
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // If employee selected, show PIN pad
    if (selectedEmployee) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4">
                        <Avatar className="h-20 w-20">
                            <AvatarFallback className="text-2xl bg-primary/10">
                                {selectedEmployee.initials}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <CardTitle>{selectedEmployee.name}</CardTitle>
                    <CardDescription>
                        <Badge className={cn("mt-2", ROLE_COLORS[selectedEmployee.role] || "")}>
                            {ROLE_LABELS[selectedEmployee.role] || selectedEmployee.role}
                        </Badge>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-sm text-muted-foreground mb-6">
                        Ingresá tu PIN para continuar
                    </p>

                    {renderPinPad(pin, setPin, handleSubmit)}

                    <Button
                        variant="ghost"
                        className="w-full mt-4"
                        onClick={() => {
                            setSelectedEmployee(null)
                            setPin("")
                            setError(null)
                        }}
                    >
                        ← Volver a la lista
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // Employee selection grid
    return (
        <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Store className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{organizationName}</CardTitle>
                <CardDescription>
                    Seleccioná tu usuario para comenzar
                </CardDescription>
            </CardHeader>
            <CardContent>
                {employees.length === 0 ? (
                    <div className="text-center py-8">
                        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            No hay empleados con PIN configurado
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            El dueño debe crear usuarios con PIN desde la sección de Usuarios
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {employees.map((employee) => (
                            <Button
                                key={employee.id}
                                variant="outline"
                                className={cn(
                                    "h-auto py-4 flex flex-col items-center gap-2 relative",
                                    !employee.hasPin
                                        ? "opacity-50 cursor-not-allowed bg-muted"
                                        : "hover:bg-primary/5 hover:border-primary"
                                )}
                                onClick={() => employee.hasPin && handleSelectEmployee(employee)}
                                disabled={!employee.hasPin}
                            >
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-primary/10">
                                        {employee.initials}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm">{employee.name}</span>
                                <Badge variant="secondary" className={cn("text-xs", ROLE_COLORS[employee.role] || "")}>
                                    {ROLE_LABELS[employee.role] || employee.role}
                                </Badge>
                                {!employee.hasPin && (
                                    <div className="absolute top-2 right-2 text-muted-foreground" title="Sin PIN configurado">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                )}
                            </Button>
                        ))}
                    </div>
                )}

                {/* Auto-lock info */}
                {autoLockMinutes > 0 && (
                    <p className="text-center text-xs text-muted-foreground mt-6">
                        La sesión se bloqueará automáticamente después de {autoLockMinutes} minutos de inactividad
                    </p>
                )}

                {/* Exit kiosk button */}
                <div className="flex justify-center mt-6 pt-6 border-t">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() => setShowExitDialog(true)}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Salir del modo kiosco
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
