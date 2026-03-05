"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { APP_VERSION, APP_VERSION_DISPLAY } from "@/lib/changelog"

// Key en localStorage para recordar la última versión vista
const STORAGE_KEY = "stockcito-last-seen-version"

/**
 * Modal de anuncio de nueva versión.
 * 
 * Se muestra UNA sola vez cuando el usuario entra y la versión 
 * actual (APP_VERSION) es distinta a la que tiene guardada 
 * en localStorage. Al cerrar o ir al changelog, guarda la 
 * versión actual para no volver a mostrarlo.
 */
export function VersionAnnouncement() {
    const router = useRouter()
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Leer la última versión que el usuario "vio"
        const lastSeenVersion = localStorage.getItem(STORAGE_KEY)

        // Si nunca vio una versión, o la versión actual es distinta → mostrar
        if (lastSeenVersion !== APP_VERSION) {
            // Pequeño delay para que no aparezca de golpe al cargar
            const timer = setTimeout(() => setIsVisible(true), 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleDismiss = () => {
        // Guardar la versión actual para no volver a mostrar
        localStorage.setItem(STORAGE_KEY, APP_VERSION)
        setIsVisible(false)
    }

    const handleGoToChangelog = () => {
        localStorage.setItem(STORAGE_KEY, APP_VERSION)
        setIsVisible(false)
        router.push("/changelog")
    }

    if (!isVisible) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-300"
                onClick={handleDismiss}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-background border rounded-xl shadow-2xl w-full max-w-sm pointer-events-auto animate-in fade-in zoom-in-95 duration-300">

                    {/* Botón cerrar */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    {/* Contenido */}
                    <div className="p-6 text-center space-y-4">
                        {/* Icono animado */}
                        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <Sparkles className="h-7 w-7 text-primary animate-pulse" />
                        </div>

                        {/* Badge de versión */}
                        <span className="inline-block text-xs font-mono font-medium bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                            {APP_VERSION_DISPLAY}
                        </span>

                        {/* Título */}
                        <h2 className="text-xl font-bold tracking-tight">
                            ¡Llegó una nueva versión!
                        </h2>

                        {/* Descripción */}
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Stockcito se actualizó con mejoras y correcciones.
                            Mirá qué hay de nuevo.
                        </p>

                        {/* Botones */}
                        <div className="flex flex-col gap-2 pt-2">
                            <Button
                                onClick={handleGoToChangelog}
                                className="w-full"
                            >
                                <Sparkles className="h-4 w-4 mr-2" />
                                Ver novedades
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleDismiss}
                                className="w-full text-muted-foreground"
                            >
                                Ahora no
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
