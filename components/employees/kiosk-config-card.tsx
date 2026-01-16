"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
    getKioskSettings, 
    updateKioskSettings, 
    enableKioskMode,
    type KioskSettings 
} from "@/actions/kiosk-actions"
import { 
    Monitor, 
    Clock, 
    Shield, 
    Play,
    AlertTriangle,
    CheckCircle2,
    Settings2
} from "lucide-react"
import toast from "react-hot-toast"

interface KioskConfigCardProps {
    canManage: boolean
}

export function KioskConfigCard({ canManage }: KioskConfigCardProps) {
    const router = useRouter()
    const [settings, setSettings] = useState<KioskSettings | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isActivating, setIsActivating] = useState(false)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        setIsLoading(true)
        const data = await getKioskSettings()
        setSettings(data)
        setIsLoading(false)
    }

    const handleSave = async () => {
        if (!settings) return

        setIsSaving(true)
        const result = await updateKioskSettings(settings)

        if (result.success) {
            toast.success("Configuración guardada")
        } else {
            toast.error(result.error || "Error al guardar")
        }

        setIsSaving(false)
    }

    const handleActivateKiosk = async () => {
        setIsActivating(true)
        const result = await enableKioskMode()

        if (result.success) {
            toast.success("Modo kiosco activado")
            router.push("/kiosk")
        } else {
            toast.error(result.error || "Error al activar")
        }

        setIsActivating(false)
    }

    if (isLoading || !settings) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Monitor className="h-5 w-5" />
                        Modo Kiosco
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-40 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            <Monitor className="h-5 w-5" />
                            Modo Kiosco
                        </CardTitle>
                        <CardDescription>
                            Configura el acceso de empleados por PIN
                        </CardDescription>
                    </div>
                    <Badge variant={settings.enabled ? "default" : "secondary"}>
                        {settings.enabled ? "Configurado" : "Desactivado"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Info box */}
                <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                    <div className="flex gap-3">
                        <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">¿Cómo funciona el Modo Kiosco?</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                                <li>El dueño activa el modo kiosco en un dispositivo (tablet, PC)</li>
                                <li>Los empleados ingresan solo con su PIN</li>
                                <li>Cada cambio de turno es solo un cambio de PIN</li>
                                <li>El dispositivo permanece logueado a la organización</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {canManage ? (
                    <>
                        {/* Enable kiosk mode */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="kiosk-enabled" className="text-base">Habilitar modo kiosco</Label>
                                <p className="text-sm text-muted-foreground">
                                    Permite que los empleados accedan con PIN
                                </p>
                            </div>
                            <Switch
                                id="kiosk-enabled"
                                checked={settings.enabled}
                                onCheckedChange={(details) => 
                                    setSettings(prev => prev ? { ...prev, enabled: details.checked } : prev)
                                }
                            />
                        </div>

                        {/* Auto-lock timeout */}
                        <div className="space-y-2">
                            <Label htmlFor="auto-lock" className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Bloqueo automático (minutos)
                            </Label>
                            <div className="flex items-center gap-4">
                                <Input
                                    id="auto-lock"
                                    type="number"
                                    min={0}
                                    max={60}
                                    className="w-24"
                                    value={settings.autoLockMinutes}
                                    onChange={(e) => 
                                        setSettings(prev => prev ? { 
                                            ...prev, 
                                            autoLockMinutes: parseInt(e.target.value) || 0 
                                        } : prev)
                                    }
                                />
                                <span className="text-sm text-muted-foreground">
                                    {settings.autoLockMinutes === 0 
                                        ? "Sin bloqueo automático" 
                                        : `Se bloqueará después de ${settings.autoLockMinutes} min de inactividad`}
                                </span>
                            </div>
                        </div>

                        {/* Require clock-in */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="require-clockin" className="text-base">
                                    Requerir fichaje al ingresar
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Los empleados deben fichar entrada para poder operar
                                </p>
                            </div>
                            <Switch
                                id="require-clockin"
                                checked={settings.requireClockIn}
                                onCheckedChange={(details) => 
                                    setSettings(prev => prev ? { ...prev, requireClockIn: details.checked } : prev)
                                }
                            />
                        </div>
                    </>
                ) : (
                    <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
                        <div className="flex gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
                            <p className="text-sm text-yellow-800">
                                Solo el dueño o administrador puede configurar el modo kiosco
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
            {canManage && (
                <CardFooter className="flex flex-col sm:flex-row gap-3 border-t pt-6">
                    <Button 
                        variant="outline" 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full sm:w-auto"
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Settings2 className="h-4 w-4 mr-2" />
                                Guardar configuración
                            </>
                        )}
                    </Button>
                    
                    {settings.enabled && (
                        <Button 
                            onClick={handleActivateKiosk}
                            disabled={isActivating}
                            className="w-full sm:w-auto"
                        >
                            {isActivating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                    Activando...
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 mr-2" />
                                    Activar modo kiosco ahora
                                </>
                            )}
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    )
}
