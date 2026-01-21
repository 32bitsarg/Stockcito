"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { getProducts } from "@/actions/product-actions"
import { getClientsAll } from "@/actions/client-actions"
import { createSale } from "@/actions/sale-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { User, Calculator, ArrowRight, CreditCard } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { POSProductList } from "./pos-product-list"
import { searchByBarcode } from "@/actions/barcode-actions"
import { POSCart } from "./pos-cart"
import { QuickStockModal } from "@/components/inventory/quick-stock-modal"
import { TableSelector } from "./table-selector"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { SaleSuccessModal } from "./sale-success-modal"

// Helper type for Cart Item
interface CartItem {
    id: string
    productId: number
    name: string
    price: number
    quantity: number
    taxRate: number
    discountAmount?: number
    discountRate?: number
}

// Minimal type for Product from DB (matching Server Action response)
interface Product {
    id: number
    name: string
    sku: string | null
    price: number | any
    stock: number
    taxRate: number | any
    category?: {
        name: string
    } | null
}

interface Client {
    id: number
    name: string
}

interface Table {
    id: number
    number: number
    name: string | null
    capacity: number
    status: 'available' | 'occupied' | 'reserved' | 'cleaning'
}

interface POSInterfaceProps {
    tableManagementEnabled?: boolean
    tables?: Table[]
    initialSku?: string
}

export function POSInterface({ tableManagementEnabled = false, tables = [], initialSku }: POSInterfaceProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Data States
    const [products, setProducts] = useState<Product[]>([])
    const [clients, setClients] = useState<Client[]>([])

    // Cart State
    const [cart, setCart] = useState<CartItem[]>([])
    const [selectedClientId, setSelectedClientId] = useState<string>("")
    const [selectedTableId, setSelectedTableId] = useState<number | null>(null)

    // Quick Stock Edit State
    const [stockModal, setStockModal] = useState<{ isOpen: boolean, product: any | null }>({
        isOpen: false,
        product: null
    })

    // Flag to prevent double processing of initialSku
    const initialSkuProcessed = useRef(false)

    // Load initial data
    useEffect(() => {
        const load = async () => {
            const c = await getClientsAll()
            setClients(c)
            const p = await getProducts()
            setProducts(p as any)
        }
        load()
    }, [])

    // Process initialSku from scanner
    useEffect(() => {
        const processInitialSku = async () => {
            if (!initialSku || initialSkuProcessed.current) return
            initialSkuProcessed.current = true

            // Try to find in loaded products first
            let product = products.find(p => p.sku === initialSku)

            // Not found locally? Try server search (maybe pagination hid it)
            if (!product) {
                try {
                    const result = await searchByBarcode(initialSku)
                    if (result.found && result.product) {
                        // Adapt server result to Product interface
                        product = {
                            id: result.product.id,
                            name: result.product.name,
                            sku: result.product.sku,
                            price: result.product.price,
                            stock: result.product.stock,
                            taxRate: result.product.taxRate,
                            category: result.product.category ? { name: result.product.category } : null
                        }
                        // Add to local products list to avoid re-fetching
                        setProducts(prev => [...prev, product!])
                    }
                } catch (e) {
                    console.error("Error fetching initial SKU product", e)
                }
            }

            if (product) {
                addToCart(product)
                setTimeout(() => toast.success(`Agregado: ${product!.name}`), 100)

                // Cleanup URL
                const url = new URL(window.location.href)
                url.searchParams.delete('addSku')
                url.searchParams.delete('t')
                window.history.replaceState({}, '', url.toString())
            }
        }

        processInitialSku()
    }, [initialSku, products.length])

    // Listen for internal barcode events (Direct Scan in POS)
    useEffect(() => {
        const handleInternalScan = (e: CustomEvent) => {
            const { product: serverProduct } = e.detail
            if (serverProduct) {
                const product = {
                    id: serverProduct.id,
                    name: serverProduct.name,
                    sku: serverProduct.sku,
                    price: serverProduct.price,
                    stock: serverProduct.stock,
                    taxRate: serverProduct.taxRate,
                    category: serverProduct.category ? { name: serverProduct.category } : null
                }

                // Add to cart directly
                addToCart(product)

                // Also add to local products if not present (for list view consistency)
                setProducts(prev => {
                    if (!prev.find(p => p.id === product.id)) {
                        return [...prev, product]
                    }
                    return prev
                })

                toast.success(`Agregado: ${product.name}`)
            }
        }

        window.addEventListener('barcode-scanned' as any, handleInternalScan)
        return () => window.removeEventListener('barcode-scanned' as any, handleInternalScan)
    }, [])

    // Escuchar eventos de teclado globales
    useEffect(() => {
        const handleFinalize = () => {
            if (cart.length > 0 && !isPending) {
                handleCheckout()
            }
        }
        const handleCancel = () => {
            if (cart.length > 0) {
                if (confirm('¿Cancelar la venta actual?')) {
                    setCart([])
                    setSelectedClientId("")
                }
            }
        }
        window.addEventListener('stockcito:finalize-sale', handleFinalize)
        window.addEventListener('stockcito:cancel-sale', handleCancel)
        return () => {
            window.removeEventListener('stockcito:finalize-sale', handleFinalize)
            window.removeEventListener('stockcito:cancel-sale', handleCancel)
        }
    }, [cart, isPending])

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id)
            if (existing) {
                if (existing.quantity >= product.stock) return prev;
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            } else {
                if (product.stock <= 0) return prev;
                return [...prev, {
                    id: crypto.randomUUID(),
                    productId: product.id,
                    name: product.name,
                    price: Number(product.price),
                    quantity: 1,
                    taxRate: Number(product.taxRate || 21),
                    discountAmount: 0,
                    discountRate: 0
                }]
            }
        })
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

    const removeFromCart = (cartItemId: string) => {
        setCart(prev => prev.filter(item => item.id !== cartItemId))
    }

    const handleDiscountChange = (cartItemId: string, discountRate: number) => {
        setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, discountRate } : item))
    }

    const handleStockUpdate = (productId: number, newStock: number) => {
        setProducts(prev => prev.map(p =>
            p.id === productId ? { ...p, stock: newStock } : p
        ))
    }

    const calculations = cart.reduce((acc, item) => {
        // En Argentina (y retail general), el precio de lista suele ser FINAL (IVA Incluido).
        // Si el usuario cargó $500, quiere cobrar $500.
        // Desglosamos el IVA hacia adentro.

        const lineTotalFinal = item.price * item.quantity

        let discount = 0
        if (item.discountAmount && item.discountAmount > 0) discount = item.discountAmount
        else if (item.discountRate && item.discountRate > 0) discount = lineTotalFinal * (item.discountRate / 100)

        const lineTotalAfterDiscount = lineTotalFinal - discount

        // Calcular base imponible (Neto) e IVA desde el total
        const itemTaxRate = Number(item.taxRate || 0)
        // Fórmula: PrecioFinal = Neto * (1 + Tasa)
        // Neto = PrecioFinal / (1 + Tasa)
        const taxable = lineTotalAfterDiscount / (1 + (itemTaxRate / 100))
        const itemTax = lineTotalAfterDiscount - taxable

        return {
            subtotal: acc.subtotal + taxable,
            tax: acc.tax + itemTax,
            total: acc.total + lineTotalAfterDiscount
        }
    }, { subtotal: 0, tax: 0, total: 0 })

    const handleCheckout = async () => {
        if (cart.length === 0) return

        startTransition(async () => {
            const saleData = {
                clientId: selectedClientId ? parseInt(selectedClientId) : undefined,
                total: calculations.total,
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    subtotal: item.price * item.quantity,
                    discountAmount: item.discountAmount,
                    discountRate: item.discountRate
                })),
                userId: undefined,
                paymentMethod: "efectivo" as const,
                requireOpenDrawer: false,
                tableId: selectedTableId ?? undefined
            }

            const result = await createSale(saleData)
            if (result.success && result.sale) {
                setCart([])
                setSelectedTableId(null)
                // Set success state instead of toast
                setLastSale({
                    sale: result.sale,
                    organization: result.organization
                })

                // Reload products to update stock
                const updatedProducts = await getProducts()
                setProducts(updatedProducts as any)

                router.refresh()
            } else {
                toast.error("Error al procesar la venta", {
                    description: typeof result.error === "string" ? result.error : "Error en la validación de datos.",
                    duration: 5000,
                    position: "top-center"
                })
            }
        })
    }

    // Success Modal State
    const [lastSale, setLastSale] = useState<{ sale: any, organization: any } | null>(null)

    return (
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-50px)] min-h-[600px] pb-0">
            {/* Left: Product Selection (Grid/List) */}
            <div className="flex-1 min-w-0 h-full">
                <POSProductList
                    products={products}
                    onAddToCart={addToCart}
                    onEditStock={(product) => setStockModal({ isOpen: true, product })}
                />
            </div>

            {/* Right: Cart & Checkout */}
            <div className="w-full lg:w-[420px] flex flex-col gap-4 h-full">
                <Card className="flex-1 flex flex-col border-primary/10 shadow-lg overflow-hidden glass-card">
                    {/* Header: Client Selection */}
                    <div className="p-4 bg-muted/40 border-b space-y-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                Venta Actual
                            </CardTitle>
                            <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                #{Math.floor(Date.now() / 1000).toString().slice(-6)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 bg-background p-1 rounded-md border shadow-sm">
                            <div className="h-8 w-8 flex items-center justify-center bg-primary/10 rounded">
                                <User className="h-4 w-4 text-primary" />
                            </div>
                            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                                <SelectTrigger className="border-0 shadow-none h-8 w-full focus:ring-0">
                                    <SelectValue placeholder="Consumidor Final" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map(client => (
                                        <SelectItem key={client.id} value={client.id.toString()}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Table Selector */}
                        {tableManagementEnabled && (
                            <TableSelector
                                tables={tables}
                                selectedTableId={selectedTableId}
                                onSelectTable={setSelectedTableId}
                            />
                        )}
                    </div>

                    {/* Body: Cart List */}
                    <POSCart
                        items={cart}
                        onUpdateQuantity={updateQuantity}
                        onRemoveItem={removeFromCart}
                        onDiscountChange={handleDiscountChange}
                        onClearCart={() => setCart([])}
                    />

                    {/* Footer: Totals & Action */}
                    <div className="border-t bg-muted/30 p-3 space-y-3">
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Subtotal</span>
                                <span>${calculations.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Impuestos</span>
                                <span>${calculations.tax.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-end border-t border-dashed pt-2 mt-2">
                                <span className="text-base font-bold">Total</span>
                                <span className="text-2xl font-bold tracking-tight text-primary">
                                    ${calculations.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className="w-full h-12 text-lg font-bold shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all hover:opacity-90"
                            style={{ backgroundColor: 'var(--primary) !important', color: 'var(--primary-foreground)' }}
                            disabled={cart.length === 0 || isPending}
                            onClick={handleCheckout}
                        >
                            {isPending ? (
                                "Procesando..."
                            ) : (
                                <>
                                    Cobrar
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            </div>

            {stockModal.product && (
                <QuickStockModal
                    isOpen={stockModal.isOpen}
                    onClose={() => setStockModal({ isOpen: false, product: null })}
                    product={stockModal.product}
                    onSuccess={(newStock) => handleStockUpdate(stockModal.product.id, newStock)}
                />
            )}

            <SaleSuccessModal
                isOpen={!!lastSale}
                onClose={() => setLastSale(null)}
                sale={lastSale?.sale}
                organization={lastSale?.organization}
            />
        </div>
    )
}
