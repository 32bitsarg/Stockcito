"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
    Loader2,
    Settings2,
    Info
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

export function KioskConfigSection() {
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
            <div className="h-40 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Configura el acceso de empleados por PIN
                </p>
                <Badge variant={settings.enabled ? "default" : "secondary"}>
                    {settings.enabled ? "Configurado" : "Desactivado"}
                </Badge>
            </div>

            {/* Info box */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 p-4 border border-blue-100 dark:border-blue-500/20">
                <div className="flex gap-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-medium mb-2">¿Cómo funciona?</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                            <li>Activa el modo kiosco en un dispositivo</li>
                            <li>Los empleados ingresan solo con su PIN</li>
                            <li>Cada cambio de turno es solo un cambio de PIN</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
                {/* Enable kiosk mode */}
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-md",
                            settings.enabled ? "bg-primary/10" : "bg-muted"
                        )}>
                            <Monitor className={cn(
                                "w-4 h-4",
                                settings.enabled ? "text-primary" : "text-muted-foreground"
                            )} />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Habilitar modo kiosco</p>
                            <p className="text-sm text-muted-foreground">
                                Permite que los empleados accedan con PIN
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={settings.enabled}
                        onCheckedChange={(details) => 
                            setSettings(prev => prev ? { ...prev, enabled: details.checked } : prev)
                        }
                    />
                </div>

                {/* Auto-lock timeout */}
                <div className="p-4 rounded-lg border bg-card space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-muted">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Bloqueo automático</p>
                            <p className="text-sm text-muted-foreground">
                                {settings.autoLockMinutes === 0 
                                    ? "Sin bloqueo automático" 
                                    : `Se bloqueará después de ${settings.autoLockMinutes} min`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pl-11">
                        <Input
                            type="number"
                            min={0}
                            max={60}
                            className="w-20"
                            value={settings.autoLockMinutes}
                            onChange={(e) => 
                                setSettings(prev => prev ? { 
                                    ...prev, 
                                    autoLockMinutes: parseInt(e.target.value) || 0 
                                } : prev)
                            }
                        />
                        <span className="text-sm text-muted-foreground">minutos</span>
                    </div>
                </div>

                {/* Require clock-in */}
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-muted">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Requerir fichaje</p>
                            <p className="text-sm text-muted-foreground">
                                Los empleados deben fichar entrada para operar
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={settings.requireClockIn}
                        onCheckedChange={(details) => 
                            setSettings(prev => prev ? { ...prev, requireClockIn: details.checked } : prev)
                        }
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                    variant="outline" 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Activando...
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4 mr-2" />
                                Activar modo kiosco
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    )
}
