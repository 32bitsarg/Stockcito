"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, RefreshCw } from "lucide-react"

export function RegisterSW() {
    const [showInstallPrompt, setShowInstallPrompt] = useState(false)
    const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

    useEffect(() => {
        // Register service worker
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js")
                .then((registration) => {
                    console.log("SW registered:", registration.scope)

                    // Check for updates
                    registration.addEventListener("updatefound", () => {
                        const newWorker = registration.installing
                        if (newWorker) {
                            newWorker.addEventListener("statechange", () => {
                                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                                    // New version available
                                    setShowUpdatePrompt(true)
                                }
                            })
                        }
                    })
                })
                .catch((error) => {
                    console.log("SW registration failed:", error)
                })
        }

        // Handle install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e)
            
            // Check if not already installed and hasn't dismissed recently
            const dismissed = localStorage.getItem("pwa-install-dismissed")
            if (!dismissed) {
                setTimeout(() => setShowInstallPrompt(true), 2000)
            }
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

        // Handle app installed
        window.addEventListener("appinstalled", () => {
            setShowInstallPrompt(false)
            setDeferredPrompt(null)
            console.log("PWA installed")
        })

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        console.log("Install prompt outcome:", outcome)
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
    }

    const handleDismiss = () => {
        setShowInstallPrompt(false)
        localStorage.setItem("pwa-install-dismissed", Date.now().toString())
    }

    const handleUpdate = () => {
        window.location.reload()
    }

    if (showUpdatePrompt) {
        return (
            <div className="fixed bottom-4 right-4 z-50 bg-background border rounded-lg shadow-lg p-4 max-w-sm animate-in slide-in-from-bottom-5">
                <div className="flex items-start gap-3">
                    <RefreshCw className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-medium">Nueva versión disponible</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Hay una actualización disponible. Recarga para ver los cambios.
                        </p>
                        <div className="flex gap-2 mt-3">
                            <Button size="sm" onClick={handleUpdate}>
                                Actualizar
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setShowUpdatePrompt(false)}>
                                Después
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (showInstallPrompt && deferredPrompt) {
        return (
            <div className="fixed bottom-4 right-4 z-50 bg-background border rounded-lg shadow-lg p-4 max-w-sm animate-in slide-in-from-bottom-5">
                <button 
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                >
                    <X className="w-4 h-4" />
                </button>
                <div className="flex items-start gap-3">
                    <Download className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                        <p className="font-medium">Instalar Stockcito</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Instalá la app para acceso rápido y uso offline.
                        </p>
                        <div className="flex gap-2 mt-3">
                            <Button size="sm" onClick={handleInstall}>
                                Instalar
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleDismiss}>
                                Ahora no
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return null
}
