"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ChefHat, LayoutGrid, Scan, Wifi, Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { updateOrganizationFeatures, type OrganizationFeaturesData } from "@/actions/notification-actions"
import { toast } from "sonner"

interface FeatureTogglesProps {
    initialFeatures: OrganizationFeaturesData | null
}

interface FeatureConfig {
    key: keyof OrganizationFeaturesData
    label: string
    description: string
    icon: React.ReactNode
    category: 'restaurant' | 'retail' | 'common'
    freemium: boolean
}

const FEATURES: FeatureConfig[] = [
    {
        key: 'kitchenDisplay',
        label: 'Pantalla de Cocina',
        description: 'Muestra pedidos pendientes en tiempo real para cocina',
        icon: <ChefHat className="h-5 w-5" />,
        category: 'restaurant',
        freemium: true
    },
    {
        key: 'tableManagement',
        label: 'Gestión de Mesas',
        description: 'Layout visual de mesas y asignación de pedidos',
        icon: <LayoutGrid className="h-5 w-5" />,
        category: 'restaurant',
        freemium: true
    },
    {
        key: 'barcodeScan',
        label: 'Escaneo de Códigos',
        description: 'Usar cámara o lector para escanear productos',
        icon: <Scan className="h-5 w-5" />,
        category: 'retail',
        freemium: true
    },
    {
        key: 'offlineMode',
        label: 'Modo Offline',
        description: 'Funcionar sin conexión y sincronizar después',
        icon: <Wifi className="h-5 w-5" />,
        category: 'common',
        freemium: true
    },
    {
        key: 'alertsEnabled',
        label: 'Sistema de Alertas',
        description: 'Notificaciones push y email para eventos importantes',
        icon: <Bell className="h-5 w-5" />,
        category: 'common',
        freemium: true
    }
]

export function FeatureToggles({ initialFeatures }: FeatureTogglesProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [features, setFeatures] = useState<OrganizationFeaturesData>(
        initialFeatures || {
            kitchenDisplay: false,
            tableManagement: false,
            barcodeScan: true,
            offlineMode: true,
            alertsEnabled: true
        }
    )

    const handleToggle = async (key: keyof OrganizationFeaturesData) => {
        const newValue = !features[key]
        setFeatures(prev => ({ ...prev, [key]: newValue }))

        setIsLoading(true)
        try {
            const result = await updateOrganizationFeatures({ [key]: newValue })
            if (result.success) {
                toast.success(`${newValue ? 'Activado' : 'Desactivado'} correctamente`)
                router.refresh()
            } else {
                // Revert on error
                setFeatures(prev => ({ ...prev, [key]: !newValue }))
                toast.error(result.error || "Error al guardar")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const restaurantFeatures = FEATURES.filter(f => f.category === 'restaurant')
    const retailFeatures = FEATURES.filter(f => f.category === 'retail')
    const commonFeatures = FEATURES.filter(f => f.category === 'common')

    const FeatureItem = ({ feature }: { feature: FeatureConfig }) => (
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-muted rounded-lg">
                    {feature.icon}
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Label className="font-medium">{feature.label}</Label>
                        {feature.freemium && (
                            <Badge variant="secondary" className="text-xs">Freemium</Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {feature.description}
                    </p>
                </div>
            </div>
            <Switch
                checked={features[feature.key]}
                onCheckedChange={() => handleToggle(feature.key)}
                disabled={isLoading}
            />
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Restaurant Features */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">🍽️ Restaurantes</h3>
                    <Badge variant="outline">Opcional</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                    Activa estas funciones si tu negocio es un restaurante, bar o cafetería
                </p>
                <div className="space-y-3">
                    {restaurantFeatures.map(feature => (
                        <FeatureItem key={feature.key} feature={feature} />
                    ))}
                </div>
            </div>

            {/* Retail Features */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">🛒 Comercio</h3>
                </div>
                <div className="space-y-3">
                    {retailFeatures.map(feature => (
                        <FeatureItem key={feature.key} feature={feature} />
                    ))}
                </div>
            </div>

            {/* Common Features */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">⚙️ General</h3>
                </div>
                <div className="space-y-3">
                    {commonFeatures.map(feature => (
                        <FeatureItem key={feature.key} feature={feature} />
                    ))}
                </div>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            )}
        </div>
    )
}
