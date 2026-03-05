"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Html5Qrcode, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from "html5-qrcode"
import { Camera, X, Flashlight, FlashlightOff, ScanBarcode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { searchByBarcode } from "@/actions/barcode-actions"
import { toast } from "sonner"

interface BarcodeScannerModalProps {
    onProductFound: (result: {
        product: any
        weight?: number
    }) => void
}

/**
 * Scanner de código de barras vía cámara del dispositivo.
 * 
 * Usa html5-qrcode (basado en ZXing) para decodificar:
 * - EAN-13 (productos argentinos, etiquetas de balanza)
 * - EAN-8 (productos chicos)
 * - UPC-A/E (importados)
 * - Code 128 (etiquetas internas)
 * - QR codes (bonus)
 * 
 * Se conecta con el mismo pipeline de searchByBarcode()
 * que usa el scanner de pistola (hardware).
 */
export function BarcodeScannerModal({ onProductFound }: BarcodeScannerModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isScanning, setIsScanning] = useState(false)
    const [torchOn, setTorchOn] = useState(false)
    const [hasTorch, setHasTorch] = useState(false)
    const [lastScannedCode, setLastScannedCode] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const cooldownRef = useRef(false)

    // Formatos que necesitamos para retail argentino
    const supportedFormats = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.QR_CODE,
    ]

    const handleCodeScanned = useCallback(async (decodedText: string) => {
        // Cooldown: evitar scans repetidos del mismo código
        if (cooldownRef.current || isProcessing) return
        cooldownRef.current = true
        setIsProcessing(true)
        setLastScannedCode(decodedText)

        // Vibración de feedback (si el dispositivo la soporta)
        if (navigator.vibrate) {
            navigator.vibrate(100)
        }

        try {
            const result = await searchByBarcode(decodedText)

            if (result.found && result.product) {
                onProductFound({
                    product: result.product,
                    weight: result.weightFromScale
                        ? result.weightFromScale / 1000 // gramos → kg
                        : undefined
                })
                toast.success(`${result.product.name}`, {
                    description: result.weightFromScale
                        ? `${(result.weightFromScale / 1000).toFixed(3)} kg`
                        : `$${result.product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                })
                closeScanner()
            } else {
                toast.error("Producto no encontrado", {
                    description: `Código: ${decodedText}`
                })
                // Permitir re-escanear después de un error
                setTimeout(() => {
                    cooldownRef.current = false
                    setIsProcessing(false)
                }, 2000)
            }
        } catch (error) {
            toast.error("Error al buscar producto")
            setTimeout(() => {
                cooldownRef.current = false
                setIsProcessing(false)
            }, 2000)
        }
    }, [onProductFound, isProcessing])

    const startScanner = useCallback(async () => {
        const scannerId = "barcode-scanner-viewport"

        // Verificar que el contenedor exista en el DOM
        const container = document.getElementById(scannerId)
        if (!container) return

        try {
            const scanner = new Html5Qrcode(scannerId, {
                formatsToSupport: supportedFormats,
                verbose: false,
            })
            scannerRef.current = scanner

            await scanner.start(
                { facingMode: "environment" }, // Cámara trasera
                {
                    fps: 10,
                    qrbox: { width: 280, height: 160 },
                    aspectRatio: 1.0,
                    disableFlip: false,
                },
                (decodedText) => {
                    handleCodeScanned(decodedText)
                },
                () => {
                    // Error silencioso mientras escanea (frames sin código)
                }
            )

            setIsScanning(true)

            // Verificar si el dispositivo tiene linterna
            try {
                const capabilities = scanner.getRunningTrackCameraCapabilities()
                if (capabilities.torchFeature().isSupported()) {
                    setHasTorch(true)
                }
            } catch {
                // No pasa nada si no se puede verificar
            }
        } catch (error: any) {
            if (error?.name === "NotAllowedError") {
                toast.error("Permiso de cámara denegado", {
                    description: "Habilitá el acceso a la cámara en los ajustes del navegador para escanear códigos de barras."
                })
            } else {
                toast.error("No se pudo abrir la cámara", {
                    description: "Verificá que no esté siendo usada por otra app."
                })
            }
            setIsOpen(false)
        }
    }, [handleCodeScanned, supportedFormats])

    const closeScanner = useCallback(async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop()
                }
                scannerRef.current.clear()
            } catch {
                // Ignorar errores al cerrar
            }
            scannerRef.current = null
        }
        setIsOpen(false)
        setIsScanning(false)
        setTorchOn(false)
        setHasTorch(false)
        setLastScannedCode(null)
        setIsProcessing(false)
        cooldownRef.current = false
    }, [])

    const toggleTorch = useCallback(async () => {
        if (!scannerRef.current) return
        try {
            const capabilities = scannerRef.current.getRunningTrackCameraCapabilities()
            const torch = capabilities.torchFeature()
            if (torch.isSupported()) {
                await torch.apply(!torchOn)
                setTorchOn(!torchOn)
            }
        } catch {
            // Ignorar errores de linterna
        }
    }, [torchOn])

    // Iniciar el scanner cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            // Pequeño delay para que el DOM renderice el contenedor
            const timer = setTimeout(startScanner, 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen, startScanner])

    // Limpiar al desmontar
    useEffect(() => {
        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(() => { })
            }
        }
    }, [])

    return (
        <>
            {/* Botón de apertura — solo visible en mobile */}
            <Button
                variant="outline"
                size="icon"
                className="md:hidden h-10 w-10 rounded-xl border-zinc-200 dark:border-zinc-800"
                onClick={() => setIsOpen(true)}
            >
                <ScanBarcode className="h-5 w-5" />
            </Button>

            {/* Modal fullscreen del scanner */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm z-10">
                        <div className="flex items-center gap-3">
                            <Camera className="h-5 w-5 text-white" />
                            <div>
                                <h3 className="text-white text-sm font-black uppercase tracking-wider">
                                    Escáner
                                </h3>
                                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
                                    {isProcessing ? "Procesando..." : "Apuntá al código de barras"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {hasTorch && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/10 h-10 w-10 rounded-xl"
                                    onClick={toggleTorch}
                                >
                                    {torchOn
                                        ? <FlashlightOff className="h-5 w-5" />
                                        : <Flashlight className="h-5 w-5" />
                                    }
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/10 h-10 w-10 rounded-xl"
                                onClick={closeScanner}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Viewport de la cámara */}
                    <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                        <div
                            id="barcode-scanner-viewport"
                            className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
                        />

                        {/* Overlay con guía de escaneo */}
                        {isScanning && !isProcessing && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="relative w-72 h-44">
                                    {/* Esquinas animadas */}
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg" />
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg" />
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg" />
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg" />
                                    {/* Línea de escaneo animada */}
                                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-red-500/80 animate-pulse" />
                                </div>
                            </div>
                        )}

                        {/* Indicador de procesamiento */}
                        {isProcessing && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4">
                                <div className="h-12 w-12 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                <p className="text-white text-sm font-black uppercase tracking-wider">
                                    Buscando producto...
                                </p>
                                {lastScannedCode && (
                                    <p className="text-white/50 text-xs font-mono">
                                        {lastScannedCode}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer con último código */}
                    <div className="p-4 bg-black/80 backdrop-blur-sm">
                        {lastScannedCode ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                                    Último código:
                                </span>
                                <span className="text-white font-mono text-sm font-bold">
                                    {lastScannedCode}
                                </span>
                            </div>
                        ) : (
                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest text-center">
                                EAN-13 · EAN-8 · UPC · Code 128 · QR
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
