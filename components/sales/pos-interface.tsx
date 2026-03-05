"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User, ArrowRight, CreditCard, ChevronRight, Banknote, Smartphone } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { POSProductList } from "./pos-product-list"
import { searchByBarcode } from "@/actions/barcode-actions"
import { POSCart } from "./pos-cart"
import { QuickStockModal } from "@/components/inventory/quick-stock-modal"
import { toast } from "sonner"
import { SaleSuccessModal } from "./sale-success-modal"
import { usePOSOffline } from "@/hooks/use-pos-offline"
import { ScaleModal } from "./scale-modal"
import { TableSelector } from "./table-selector"
import { BarcodeScannerModal } from "./barcode-scanner-modal"
import { cn } from "@/lib/utils"
import type { CartItem, POSProduct, POSTable, PaymentMethod } from "@/lib/types/pos"

interface POSInterfaceProps {
    tableManagementEnabled?: boolean
    tables?: POSTable[]
    initialSku?: string
    userRole?: string
}

export function POSInterface({ tableManagementEnabled = false, tables = [], initialSku, userRole = 'cashier' }: POSInterfaceProps) {
    const canEditStock = userRole === 'admin' || userRole === 'owner'
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const { products, clients, createSale, isOnline, refetchProducts } = usePOSOffline()

    const [cart, setCart] = useState<CartItem[]>([])
    const [selectedClientId, setSelectedClientId] = useState<string>("")
    const [selectedTableId, setSelectedTableId] = useState<number | null>(null)
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo')
    const [stockModal, setStockModal] = useState<{ isOpen: boolean, product: any | null }>({
        isOpen: false,
        product: null
    })
    const [scaleModal, setScaleModal] = useState<{ isOpen: boolean, product: any | null }>({
        isOpen: false,
        product: null
    })

    // UID estable de sesión — se genera 1 vez al montar el componente
    const sessionUID = useRef(crypto.randomUUID().slice(0, 8).toUpperCase())
    const initialSkuProcessed = useRef(false)

    // Listener para scanner hardware vía CustomEvent
    useEffect(() => {
        const handleBarcodeScanned = (e: any) => {
            const { code, product, weight } = e.detail
            if (product) {
                // Find complete product from local cache to make sure offline states are fine,
                // But fallback to the scanned one.
                const localProd = products.find(p => p.id === product.id) || product as POSProduct

                if (localProd.stock <= 0) {
                    toast.error(`Sin stock: ${localProd.name}`)
                    return
                }

                if (localProd.isWeighable && weight) {
                    addToCart(localProd, weight)
                } else if (localProd.isWeighable && !weight) {
                    // scanned a weighable product but without weight -> Open manual scale
                    setScaleModal({ isOpen: true, product: localProd })
                } else {
                    addToCart(localProd, 1)
                }
            }
        }
        window.addEventListener('barcode-scanned', handleBarcodeScanned)
        return () => window.removeEventListener('barcode-scanned', handleBarcodeScanned)
    }, [products])

    // Initial SKU processing (via URL param during redirect)
    useEffect(() => {
        const processInitialSku = async () => {
            const url = new URL(window.location.href)
            const addSku = url.searchParams.get('addSku')
            const weightParam = url.searchParams.get('weight')

            if (!addSku || initialSkuProcessed.current || products.length === 0) return
            initialSkuProcessed.current = true

            let product = products.find(p => p.sku === addSku)
            if (!product && isOnline) {
                try {
                    const result = await searchByBarcode(addSku)
                    if (result.found && result.product) {
                        // Optimistically add to local list if found online but not in cache
                        // Note: In a real scenario we might want to update the cache
                        product = result.product as any
                    }
                } catch (e) {
                    console.error("Error fetching initial SKU product", e)
                }
            }

            if (product) {
                if (product.stock <= 0) {
                    toast.error(`Sin stock: ${product.name}`, {
                        description: canEditStock ? '¿Actualizar stock?' : 'No hay unidades disponibles',
                        action: canEditStock ? {
                            label: 'Editar',
                            onClick: () => setStockModal({ isOpen: true, product: product! })
                        } : undefined
                    })
                } else {
                    if (product.isWeighable && weightParam) {
                        addToCart(product, parseInt(weightParam))
                    } else if (product.isWeighable && !weightParam) {
                        setScaleModal({ isOpen: true, product })
                    } else {
                        addToCart(product, 1)
                    }
                }
                const newUrl = new URL(window.location.href)
                newUrl.searchParams.delete('addSku')
                newUrl.searchParams.delete('weight')
                window.history.replaceState({}, '', newUrl.toString())
            }
        }
        processInitialSku()
    }, [products, canEditStock, isOnline])

    const addToCart = (product: POSProduct, qtyOrWeight: number = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id)
            if (existing) {
                if (existing.quantity + qtyOrWeight > product.stock) {
                    toast.warning("Stock máximo alcanzado")
                }
                // Si es pesable, los gramos se suman
                return prev.map(item => item.productId === product.id ? { ...item, quantity: Math.min(item.quantity + qtyOrWeight, product.stock) } : item)
            } else {
                if (product.stock <= 0) return prev
                return [...prev, {
                    id: crypto.randomUUID(),
                    productId: product.id,
                    name: product.name,
                    price: Number(product.price),
                    quantity: Math.min(qtyOrWeight, product.stock),
                    taxRate: Number(product.taxRate || 21),
                    discountAmount: 0,
                    discountRate: 0,
                    unitMeasure: product.unitMeasure,
                    isWeighable: product.isWeighable
                }]
            }
        })
    }

    const handleProductClick = (product: POSProduct) => {
        if (product.stock <= 0) {
            toast.error("Sin stock", {
                action: canEditStock ? { label: "Cargar", onClick: () => setStockModal({ isOpen: true, product }) } : undefined
            })
            return
        }
        if (product.isWeighable) {
            setScaleModal({ isOpen: true, product })
        } else {
            addToCart(product, 1)
        }
    }

    const updateQuantity = (cartItemId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === cartItemId) {
                const newQty = item.quantity + delta
                if (newQty <= 0) return item
                const product = products.find(p => p.id === item.productId)
                if (product && newQty > product.stock) return item
                return { ...item, quantity: newQty }
            }
            return item
        }))
    }

    const calculations = cart.reduce((acc, item) => {
        const lineTotalFinal = item.price * item.quantity
        let discount = item.discountAmount || (item.discountRate ? lineTotalFinal * (item.discountRate / 100) : 0)
        const totalAfterDiscount = lineTotalFinal - discount
        const taxRate = Number(item.taxRate || 0)
        const taxable = totalAfterDiscount / (1 + (taxRate / 100))
        return {
            subtotal: acc.subtotal + taxable,
            tax: acc.tax + (totalAfterDiscount - taxable),
            total: acc.total + totalAfterDiscount
        }
    }, { subtotal: 0, tax: 0, total: 0 })

    const handleCheckout = async () => {
        if (cart.length === 0) return
        startTransition(async () => {
            const result = await createSale({
                clientId: selectedClientId ? parseInt(selectedClientId) : undefined,
                total: calculations.total,
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    subtotal: item.price * item.quantity,
                    discountRate: item.discountRate
                })),
                paymentMethod,
                userId: undefined,
                requireOpenDrawer: false,
                tableId: selectedTableId ?? undefined
            })

            if (result.success) {
                setCart([]); setSelectedTableId(null)
                // If offline, we construct a temp sale object for the modal
                const saleData = result.data?.sale || {
                    id: 'OFFLINE-' + Date.now(),
                    total: calculations.total,
                    date: new Date(),
                    status: 'pending-sync'
                }
                setLastSale({ sale: saleData, organization: {} })
                await refetchProducts()
                router.refresh()
            } else {
                toast.error("Error en la venta", { description: result.error as string })
            }
        })
    }

    const [lastSale, setLastSale] = useState<{ sale: any, organization: any } | null>(null)

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] md:h-full bg-white dark:bg-zinc-950 font-sans overflow-hidden">
            {/* Left: Product Selection */}
            <div className="flex-1 flex flex-col border-r border-zinc-200 dark:border-zinc-800 h-full overflow-hidden">
                {/* Botón de scanner cámara — solo mobile */}
                <div className="md:hidden flex items-center gap-2 px-4 pt-3">
                    <BarcodeScannerModal
                        onProductFound={({ product, weight }) => {
                            const localProd = products.find(p => p.id === product.id) || {
                                ...product,
                                category: product.category ? { name: product.category } : null
                            } as POSProduct

                            if (localProd.stock <= 0) {
                                toast.error(`Sin stock: ${localProd.name}`)
                                return
                            }

                            if (localProd.isWeighable && weight) {
                                addToCart(localProd, weight)
                            } else if (localProd.isWeighable && !weight) {
                                setScaleModal({ isOpen: true, product: localProd })
                            } else {
                                addToCart(localProd, 1)
                            }
                        }}
                    />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Escanear con cámara</span>
                </div>
                <POSProductList
                    products={products}
                    onAddToCart={handleProductClick}
                    onEditStock={(p) => setStockModal({ isOpen: true, product: p })}
                />
            </div>

            {/* Right: Cart & Checkout */}
            <div className="w-full md:w-[380px] flex flex-col bg-zinc-50/30 dark:bg-zinc-900/10 border-t md:border-t-0 h-[60vh] md:h-full shrink-0">
                <div className="p-4 md:p-5 border-b border-zinc-200 dark:border-zinc-800 space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                            <h2 className="text-[10px] md:text-xs font-black uppercase tracking-widest italic">Terminal / Facturación</h2>
                        </div>
                        <span className="text-[9px] font-mono font-black border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded uppercase">
                            UID: {sessionUID.current}
                        </span>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">Asignación de Cliente</label>
                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="h-8 w-8 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                <User className="h-3.5 w-3.5 text-zinc-400" />
                            </div>
                            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                                <SelectTrigger className="border-0 shadow-none h-8 w-full focus:ring-0 font-bold uppercase text-[10px] tracking-tighter">
                                    <SelectValue placeholder="CONSUMIDOR FINAL" />
                                </SelectTrigger>
                                <SelectContent className="font-sans">
                                    <SelectItem value="" className="font-bold uppercase text-[10px] tracking-widest">CONSUMIDOR FINAL</SelectItem>
                                    {clients.map(client => (
                                        <SelectItem key={client.id} value={client.id.toString()} className="font-bold uppercase text-[10px] tracking-widest">
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Selector de mesa (solo si está habilitado) */}
                {tableManagementEnabled && tables.length > 0 && (
                    <div className="px-4 md:px-5 pb-3">
                        <label className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-400 italic mb-1 block">Asignación de Mesa</label>
                        <TableSelector
                            tables={tables}
                            selectedTableId={selectedTableId}
                            onSelectTable={setSelectedTableId}
                        />
                    </div>
                )}

                <POSCart
                    items={cart}
                    onUpdateQuantity={updateQuantity}
                    onRemoveItem={(id) => setCart(prev => prev.filter(i => i.id !== id))}
                    onDiscountChange={(id, rate) => setCart(prev => prev.map(i => i.id === id ? { ...i, discountRate: rate } : i))}
                    onClearCart={() => setCart([])}
                />

                {/* Footer: Totals */}
                <div className="p-4 md:p-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-t-[24px] md:rounded-t-[32px] shadow-2xl space-y-3 md:space-y-5">
                    {/* Selector de método de pago */}
                    <div className="space-y-1.5">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Método de Pago</span>
                        <div className="flex gap-1.5">
                            {[
                                { value: 'efectivo' as PaymentMethod, label: 'Efectivo', icon: Banknote },
                                { value: 'tarjeta' as PaymentMethod, label: 'Tarjeta', icon: CreditCard },
                                { value: 'transferencia' as PaymentMethod, label: 'Transfer', icon: Smartphone },
                            ].map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => setPaymentMethod(value)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                                        paymentMethod === value
                                            ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white shadow-md"
                                            : "bg-white/10 dark:bg-zinc-200/10 opacity-60 hover:opacity-100"
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-60 tabular-nums">
                            <span>Base Imponible</span>
                            <span>${calculations.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-end pt-2 border-t border-white/10 dark:border-zinc-200">
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-0.5">Total a Liquidar</p>
                                <div className="text-2xl md:text-3xl font-black font-mono tracking-tighter tabular-nums italic leading-none">
                                    ${calculations.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-white/10 dark:bg-zinc-100 flex items-center justify-center">
                                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                            </div>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        className="w-full h-12 md:h-14 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all bg-white text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 rounded-xl md:rounded-2xl group active:scale-95"
                        disabled={cart.length === 0 || isPending}
                        onClick={handleCheckout}
                    >
                        {isPending ? "PROCESANDO..." : (
                            <div className="flex items-center gap-2">
                                FINALIZAR OPERACIÓN
                                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        )}
                    </Button>
                </div>
            </div>

            {stockModal.product && (
                <QuickStockModal
                    isOpen={stockModal.isOpen}
                    onClose={() => setStockModal({ isOpen: false, product: null })}
                    product={stockModal.product}
                    onSuccess={(newStock) => refetchProducts()}
                />
            )}

            <SaleSuccessModal
                isOpen={!!lastSale}
                onClose={() => setLastSale(null)}
                sale={lastSale?.sale}
                organization={lastSale?.organization}
            />

            <ScaleModal
                isOpen={scaleModal.isOpen}
                onClose={() => setScaleModal({ isOpen: false, product: null })}
                product={scaleModal.product}
                onConfirm={(weight) => {
                    addToCart(scaleModal.product, weight)
                }}
            />
        </div>
    )
}
