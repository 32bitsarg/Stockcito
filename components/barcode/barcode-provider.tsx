"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { useBarcodeScanner } from "./use-barcode-scanner"
import { searchByBarcode, BarcodeSearchResult } from "@/actions/barcode-actions"
import { BarcodeResultModal } from "./barcode-result-modal"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface BarcodeContextType {
    isScanning: boolean
    lastScannedCode: string | null
}

const BarcodeContext = createContext<BarcodeContextType>({
    isScanning: false,
    lastScannedCode: null
})

export function useBarcode() {
    return useContext(BarcodeContext)
}

export function BarcodeProvider({ children }: { children: ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [isScanning, setIsScanning] = useState(false)
    const [lastScannedCode, setLastScannedCode] = useState<string | null>(null)
    const [modalState, setModalState] = useState<{
        isOpen: boolean
        code: string
        canCreate: boolean
    }>({ isOpen: false, code: "", canCreate: false })

    // Manejar el escaneo
    const handleScan = async (code: string) => {
        // Evitar escaneos múltiples simultáneos
        if (isScanning) return

        // Si ya estamos en el modal de creación de producto con este SKU, ignorar
        if (pathname.includes('/inventory/products/new') && window.location.search.includes(code)) {
            return
        }

        setIsScanning(true)
        setLastScannedCode(code)

        const toastId = toast.loading(`Buscando producto: ${code}...`)

        try {
            const result = await searchByBarcode(code)

            toast.dismiss(toastId)

            if (result.found && result.product) {
                // Producto encontrado
                toast.success(`Producto encontrado: ${result.product.name}`)

                // Si ya estamos en el POS, el POS debería manejarlo (si implementamos un listener local también)
                // Pero si queremos un comportamiento unificado:
                if (pathname === '/sales/new') {
                    // Si estamos en POS, disparamos un evento custom o modificamos la URL sin recargar
                    // Una forma simple es usar un evento de window que el POS escuche, o query params
                    // Vamos a inyectar el SKU en la URL para que el POS reaccione
                    const url = new URL(window.location.href)
                    url.searchParams.set('addSku', code)
                    url.searchParams.set('t', Date.now().toString()) // Timestamp para forzar efecto
                    router.replace(url.toString())
                } else {
                    // Redirigir al POS
                    router.push(`/sales/new?addSku=${encodeURIComponent(code)}`)
                }
            } else {
                // Producto no encontrado
                if (result.canCreateProduct) {
                    setModalState({
                        isOpen: true,
                        code: code,
                        canCreate: true
                    })
                } else {
                    toast.error(`Producto no encontrado (${code})`, {
                        description: "No tienes permisos para crear nuevos productos."
                    })
                }
            }
        } catch (error) {
            console.error("Error searching barcode:", error)
            toast.dismiss(toastId)
            toast.error("Error al buscar producto")
        } finally {
            setIsScanning(false)
        }
    }

    // Inicializar el scanner hook globalmente
    useBarcodeScanner({
        onScan: handleScan,
        minLength: 3
    })

    return (
        <BarcodeContext.Provider value={{ isScanning, lastScannedCode }}>
            {children}

            {/* Indicador visual flotante cuando se procesa un escaneo (opcional) */}
            {isScanning && (
                <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Buscando {lastScannedCode}...</span>
                </div>
            )}

            <BarcodeResultModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                scannedCode={modalState.code}
                canCreate={modalState.canCreate}
            />
        </BarcodeContext.Provider>
    )
}
