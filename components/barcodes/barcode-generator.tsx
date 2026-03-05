"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Printer, Trash2, RefreshCw, Check, Tag, Package, Plus, X, Barcode as BarcodeIcon, FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import JsBarcode from "jsbarcode"
import {
    getProductsForBarcode,
    generateAndSaveSku,
    clearProductSku,
    type BarcodeProduct
} from "@/actions/barcode-generation-actions"

// ─────────────────────────────────────────────────────────────
// Utilidades EAN-13
// ─────────────────────────────────────────────────────────────

function calculateEAN13CheckDigit(first12: string): number {
    let sum = 0
    for (let i = 0; i < 12; i++) {
        sum += parseInt(first12[i], 10) * (i % 2 === 0 ? 1 : 3)
    }
    return (10 - (sum % 10)) % 10
}

function generateRandomEAN13(): string {
    // Prefijo "20" (uso interno) + 10 dígitos aleatorios + check
    let digits = "20"
    for (let i = 0; i < 10; i++) {
        digits += Math.floor(Math.random() * 10).toString()
    }
    digits += calculateEAN13CheckDigit(digits)
    return digits
}

// ─────────────────────────────────────────────────────────────
// Componente: Etiqueta de barcode individual
// ─────────────────────────────────────────────────────────────

function BarcodeLabel({ name, sku, onRemove }: { name: string; sku: string; onRemove?: () => void }) {
    const svgRef = useRef<SVGSVGElement>(null)

    useEffect(() => {
        if (svgRef.current && sku) {
            try {
                JsBarcode(svgRef.current, sku, {
                    format: "EAN13",
                    width: 2,
                    height: 50,
                    displayValue: true,
                    fontSize: 14,
                    font: "monospace",
                    textMargin: 4,
                    margin: 8,
                    background: "#ffffff",
                    lineColor: "#000000",
                })
            } catch {
                try {
                    JsBarcode(svgRef.current, sku, {
                        format: "CODE128",
                        width: 1.5,
                        height: 50,
                        displayValue: true,
                        fontSize: 12,
                        font: "monospace",
                        textMargin: 4,
                        margin: 8,
                        background: "#ffffff",
                        lineColor: "#000000",
                    })
                } catch {
                    // Fallback
                }
            }
        }
    }, [sku])

    return (
        <div className="barcode-label relative flex flex-col items-center bg-white p-3 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm group">
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
            <p className="text-[10px] font-bold text-black dark:text-zinc-200 uppercase tracking-wider text-center truncate w-full mb-1">
                {name}
            </p>
            <svg ref={svgRef} className="max-w-full" />
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// Tipo para label de impresión
// ─────────────────────────────────────────────────────────────

interface PrintLabel {
    id: string
    name: string
    sku: string
    quantity: number
    source: "product" | "standalone"
}

// ─────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────

export function BarcodeGenerator() {
    const [products, setProducts] = useState<BarcodeProduct[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState<number | null>(null)

    // Cola de impresión — productos + standalone
    const [printQueue, setPrintQueue] = useState<PrintLabel[]>([])

    // Modal para crear barcode suelto
    const [standaloneOpen, setStandaloneOpen] = useState(false)
    const [standaloneName, setStandaloneName] = useState("")
    const [standaloneCode, setStandaloneCode] = useState("")

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        const data = await getProductsForBarcode(searchQuery || undefined)
        setProducts(data)
        setLoading(false)
    }, [searchQuery])

    useEffect(() => {
        const timer = setTimeout(fetchProducts, 300)
        return () => clearTimeout(timer)
    }, [fetchProducts])

    // ── Acciones de productos ──

    const handleGenerateSku = async (productId: number) => {
        setGenerating(productId)
        const result = await generateAndSaveSku(productId)
        if (result.success) {
            toast.success("Código generado", { description: result.sku })
            fetchProducts()
        } else {
            toast.error(result.error)
        }
        setGenerating(null)
    }

    const handleClearSku = async (productId: number) => {
        const result = await clearProductSku(productId)
        if (result.success) {
            toast.success("SKU eliminado")
            // Remover de la cola si estaba
            setPrintQueue(prev => prev.filter(l => l.id !== `prod-${productId}`))
            fetchProducts()
        } else {
            toast.error(result.error)
        }
    }

    // ── Cola de impresión ──

    const addToQueue = (product: BarcodeProduct) => {
        if (!product.sku) return
        const existing = printQueue.find(l => l.id === `prod-${product.id}`)
        if (existing) {
            setPrintQueue(prev => prev.map(l =>
                l.id === `prod-${product.id}` ? { ...l, quantity: l.quantity + 1 } : l
            ))
        } else {
            setPrintQueue(prev => [...prev, {
                id: `prod-${product.id}`,
                name: product.name,
                sku: product.sku!,
                quantity: 1,
                source: "product"
            }])
        }
    }

    const removeFromQueue = (id: string) => {
        setPrintQueue(prev => prev.filter(l => l.id !== id))
    }

    const updateQuantity = (id: string, qty: number) => {
        setPrintQueue(prev => prev.map(l =>
            l.id === id ? { ...l, quantity: Math.max(1, Math.min(100, qty)) } : l
        ))
    }

    // ── Standalone barcode ──

    const handleCreateStandalone = () => {
        const code = standaloneCode || generateRandomEAN13()
        const name = standaloneName || `Etiqueta ${code.slice(-4)}`

        setPrintQueue(prev => [...prev, {
            id: `standalone-${Date.now()}`,
            name,
            sku: code,
            quantity: 1,
            source: "standalone"
        }])

        toast.success("Etiqueta agregada a la cola de impresión", { description: code })
        setStandaloneName("")
        setStandaloneCode("")
        setStandaloneOpen(false)
    }

    const handleGenerateRandomCode = () => {
        setStandaloneCode(generateRandomEAN13())
    }

    // ── Impresión ──

    const totalLabels = printQueue.reduce((acc, l) => acc + l.quantity, 0)

    const expandedLabels: Array<{ name: string; sku: string }> = []
    printQueue.forEach(label => {
        for (let i = 0; i < label.quantity; i++) {
            expandedLabels.push({ name: label.name, sku: label.sku })
        }
    })

    const handlePrint = () => {
        if (printQueue.length === 0) {
            toast.error("Agregá al menos una etiqueta a la cola")
            return
        }

        // Renderizamos los barcodes como SVG en el documento actual
        // (donde JsBarcode ya está cargado) y después pasamos el HTML
        // listo a la ventana de impresión. Así no dependemos de CDN.
        const labelsHtml = expandedLabels.map((label) => {
            // Crear un SVG temporal en el DOM actual para que JsBarcode lo renderice
            const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
            try {
                JsBarcode(tempSvg, label.sku, {
                    format: "EAN13", width: 2, height: 50, displayValue: true,
                    fontSize: 14, font: "monospace", textMargin: 4, margin: 8,
                    background: "#ffffff", lineColor: "#000000"
                })
            } catch {
                try {
                    JsBarcode(tempSvg, label.sku, {
                        format: "CODE128", width: 1.5, height: 50, displayValue: true,
                        fontSize: 12, font: "monospace", textMargin: 4, margin: 8,
                        background: "#ffffff", lineColor: "#000000"
                    })
                } catch {
                    // fallback
                }
            }

            // Serializar el SVG renderizado a string HTML
            const svgHtml = new XMLSerializer().serializeToString(tempSvg)

            return `
                <div class="label">
                    <p class="name">${label.name}</p>
                    ${svgHtml}
                </div>
            `
        }).join('')

        const printWindow = window.open('', '_blank', 'width=800,height=600')
        if (!printWindow) {
            toast.error("Tu navegador bloqueó la ventana de impresión. Habilitá popups para este sitio.")
            return
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Etiquetas - Stockcito</title>
                <style>
                    @page { size: A4; margin: 10mm; }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; }
                    .grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 6px;
                        padding: 4px;
                    }
                    .label {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        border: 1px solid #e4e4e7;
                        border-radius: 8px;
                        padding: 8px 4px;
                        background: #fff;
                        page-break-inside: avoid;
                    }
                    .name {
                        font-size: 9px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        text-align: center;
                        margin-bottom: 2px;
                        max-width: 100%;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    svg { max-width: 100%; }
                </style>
            </head>
            <body>
                <div class="grid">${labelsHtml}</div>
                <script>setTimeout(function() { window.print(); }, 100);<\/script>
            </body>
            </html>
        `)
        printWindow.document.close()
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1.5 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
                        <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 uppercase italic">
                            Códigos de Barras
                        </h1>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-[9px] md:text-[10px] ml-[23px]">
                        Generá etiquetas EAN-13 para tus productos e imprimí
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={standaloneOpen} onOpenChange={(e) => setStandaloneOpen(e.open)}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2 text-xs">
                                <Plus className="h-4 w-4" />
                                Crear Etiqueta Suelta
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <BarcodeIcon className="h-5 w-5" />
                                    Crear Etiqueta sin Producto
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                                <p className="text-sm text-zinc-500">
                                    Generá una etiqueta con código de barras sin vincularla a ningún producto.
                                    Cuando crees un producto con este SKU, se va a vincular automáticamente.
                                </p>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                        Nombre de la etiqueta (opcional)
                                    </label>
                                    <Input
                                        placeholder="Ej: Pan integral, Queso cremoso..."
                                        value={standaloneName}
                                        onChange={(e) => setStandaloneName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                        Código (dejá vacío para generar uno automático)
                                    </label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Se genera automáticamente..."
                                            value={standaloneCode}
                                            onChange={(e) => setStandaloneCode(e.target.value)}
                                            className="font-mono"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={handleGenerateRandomCode}
                                            title="Generar código aleatorio"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                {standaloneCode && (
                                    <div className="flex justify-center p-4 bg-white rounded-xl border">
                                        <BarcodeLabel name={standaloneName || "Etiqueta"} sku={standaloneCode} />
                                    </div>
                                )}
                                <Button
                                    className="w-full gap-2"
                                    onClick={handleCreateStandalone}
                                >
                                    <Plus className="h-4 w-4" />
                                    Agregar a Cola de Impresión
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Banner de fase beta */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/80 dark:bg-amber-950/20">
                <FlaskConical className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    <span className="font-bold">Función en fase de pruebas.</span>{' '}
                    Estamos perfeccionando esta herramienta. Si encontrás algún problema o tenés sugerencias, avisanos.
                </p>
            </div>

            {/* Layout de dos columnas: productos + cola */}
            <div className="grid gap-6 lg:grid-cols-5">

                {/* ── Columna izquierda: Productos ── */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Buscar producto por nombre o SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <RefreshCw className="h-6 w-6 animate-spin text-zinc-400" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                                <Package className="h-10 w-10 mb-3 opacity-30" />
                                <p className="font-bold text-sm">Sin resultados</p>
                            </div>
                        ) : (
                            products.map(product => {
                                const hasSku = !!product.sku
                                const inQueue = printQueue.some(l => l.id === `prod-${product.id}`)

                                return (
                                    <div
                                        key={product.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${inQueue
                                            ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20"
                                            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700"
                                            }`}
                                    >
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-sm truncate">{product.name}</h3>
                                                {product.category && (
                                                    <Badge variant="outline" className="text-[8px] shrink-0 py-0">
                                                        {product.category}
                                                    </Badge>
                                                )}
                                            </div>
                                            {hasSku ? (
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <BarcodeIcon className="h-3 w-3 text-zinc-400" />
                                                    <span className="font-mono text-[11px] text-zinc-500">{product.sku}</span>
                                                    {product.hasValidEAN && (
                                                        <Badge className="text-[7px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none px-1 py-0">
                                                            EAN-13
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-[11px] text-zinc-400 mt-0.5 italic">Sin código</p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {hasSku ? (
                                                <>
                                                    <Button
                                                        variant={inQueue ? "default" : "outline"}
                                                        size="sm"
                                                        className="gap-1 text-[11px] h-7"
                                                        onClick={() => addToQueue(product)}
                                                    >
                                                        {inQueue ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                                                        {inQueue ? "Agregado" : "Agregar"}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-zinc-400 hover:text-red-500"
                                                        onClick={() => handleClearSku(product.id)}
                                                        title="Eliminar SKU"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-1 text-[11px] h-7"
                                                    onClick={() => handleGenerateSku(product.id)}
                                                    disabled={generating === product.id}
                                                >
                                                    {generating === product.id ? (
                                                        <RefreshCw className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <Tag className="h-3 w-3" />
                                                    )}
                                                    Generar Código
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* ── Columna derecha: Cola de impresión ── */}
                <div className="lg:col-span-2">
                    <div className="sticky top-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <Printer className="h-4 w-4" />
                                Cola de Impresión
                            </h2>
                            {printQueue.length > 0 && (
                                <Badge variant="secondary" className="text-[10px]">
                                    {totalLabels} etiqueta{totalLabels !== 1 ? "s" : ""}
                                </Badge>
                            )}
                        </div>

                        {printQueue.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                                <BarcodeIcon className="h-8 w-8 mb-2 opacity-30" />
                                <p className="text-xs font-bold">Cola vacía</p>
                                <p className="text-[10px] mt-1 text-center px-4">
                                    Generá códigos y agregalos acá para imprimir
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {printQueue.map(label => (
                                    <div
                                        key={label.id}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold truncate">{label.name}</p>
                                            <p className="font-mono text-[10px] text-zinc-400">{label.sku}</p>
                                            {label.source === "standalone" && (
                                                <Badge variant="outline" className="text-[7px] mt-1 py-0">
                                                    Sin producto
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button
                                                variant="outline" size="icon" className="h-6 w-6 text-xs"
                                                onClick={() => updateQuantity(label.id, label.quantity - 1)}
                                            >-</Button>
                                            <span className="w-6 text-center text-xs font-bold">{label.quantity}</span>
                                            <Button
                                                variant="outline" size="icon" className="h-6 w-6 text-xs"
                                                onClick={() => updateQuantity(label.id, label.quantity + 1)}
                                            >+</Button>
                                        </div>
                                        <Button
                                            variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-red-500"
                                            onClick={() => removeFromQueue(label.id)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}

                                <Button
                                    className="w-full gap-2 mt-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-black uppercase tracking-wider text-xs"
                                    onClick={handlePrint}
                                >
                                    <Printer className="h-4 w-4" />
                                    Imprimir {totalLabels} Etiqueta{totalLabels !== 1 ? "s" : ""}
                                </Button>

                                <Button
                                    variant="ghost"
                                    className="w-full text-xs text-zinc-400"
                                    onClick={() => setPrintQueue([])}
                                >
                                    Vaciar cola
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
