"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw, Volume2, VolumeX, Maximize, ChefHat, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface KitchenHeaderProps {
    stats: {
        pendingCount: number
        preparingCount: number
        readyCount: number
        averagePrepTime: number
    }
}

export function KitchenHeader({ stats }: KitchenHeaderProps) {
    const router = useRouter()
    const [currentTime, setCurrentTime] = useState(new Date())
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    // Auto-refresh every 10 seconds
    useEffect(() => {
        const refreshTimer = setInterval(() => {
            router.refresh()
        }, 10000)
        return () => clearInterval(refreshTimer)
    }, [router])

    const handleRefresh = () => {
        setIsRefreshing(true)
        router.refresh()
        setTimeout(() => setIsRefreshing(false), 500)
    }

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
        } else {
            document.exitFullscreen()
        }
    }

    const totalActive = stats.pendingCount + stats.preparingCount

    return (
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 lg:px-6">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <ChefHat className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-xl font-bold">Cocina</h1>
                        <p className="text-sm text-muted-foreground">
                            Kitchen Display System
                        </p>
                    </div>
                </div>

                {totalActive > 0 && (
                    <div className="ml-4 px-3 py-1 rounded-full bg-primary text-primary-foreground font-medium animate-pulse">
                        {totalActive} pedidos activos
                    </div>
                )}
            </div>

            <div className="flex items-center gap-6">
                {/* Current Time */}
                <div className="text-right">
                    <div className="flex items-center gap-2 text-2xl font-mono font-bold">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        {format(currentTime, "HH:mm:ss")}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {format(currentTime, "EEEE d 'de' MMMM", { locale: es })}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        title="Actualizar"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        title={soundEnabled ? "Silenciar" : "Activar sonido"}
                    >
                        {soundEnabled ? (
                            <Volume2 className="h-4 w-4" />
                        ) : (
                            <VolumeX className="h-4 w-4" />
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleFullscreen}
                        title="Pantalla completa"
                    >
                        <Maximize className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </header>
    )
}
