"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getProducts } from "@/actions/product-actions"
import { getClientsAll } from "@/actions/client-actions"
import { createSale } from "@/actions/sale-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { User, Calculator, ArrowRight, CreditCard } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { POSProductList } from "./pos-product-list"
import { POSCart } from "./pos-cart"
import { cn } from "@/lib/utils"

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

export function POSInterface() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Data States
    const [products, setProducts] = useState<Product[]>([])
    const [clients, setClients] = useState<Client[]>([])

    // Cart State
    const [cart, setCart] = useState<CartItem[]>([])
    const [selectedClientId, setSelectedClientId] = useState<string>("")

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

    const calculations = cart.reduce((acc, item) => {
        const lineBase = item.price * item.quantity
        let discount = 0
        if (item.discountAmount && item.discountAmount > 0) discount = item.discountAmount
        else if (item.discountRate && item.discountRate > 0) discount = lineBase * (item.discountRate / 100)

        const taxable = lineBase - discount
        const itemTaxRate = Number(item.taxRate || 0)
        const itemTax = taxable * (itemTaxRate / 100)
        const lineTotal = taxable + itemTax

        return {
            subtotal: acc.subtotal + taxable,
            tax: acc.tax + itemTax,
            total: acc.total + lineTotal
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
                requireOpenDrawer: false
            }

            const result = await createSale(saleData)
            if (result.success) {
                setCart([])
                // Add better feedback or modal here later
                alert("Venta realizada con éxito!")
                router.refresh()
            } else {
                alert("Error al procesar la venta: " + (result.error || "Desconocido"))
            }
        })
    }

    return (
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-50px)] min-h-[600px] pb-0">
            {/* Left: Product Selection (Grid/List) */}
            <div className="flex-1 min-w-0 h-full">
                <POSProductList
                    products={products}
                    onAddToCart={addToCart}
                />
            </div>

            {/* Right: Cart & Checkout (Fixed width on large screens) */}
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
                            className="w-full h-12 text-lg font-bold shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all"
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
        </div>
    )
}
