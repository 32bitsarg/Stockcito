"use client"

import { Minus, Plus, Trash2, CreditCard, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

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

interface POSCartProps {
    items: CartItem[]
    onUpdateQuantity: (id: string, delta: number) => void
    onRemoveItem: (id: string) => void
    onDiscountChange: (id: string, discountRate: number) => void
    onClearCart: () => void
}

export function POSCart({
    items,
    onUpdateQuantity,
    onRemoveItem,
    onDiscountChange,
    onClearCart
}: POSCartProps) {

    if (items.length === 0) {
        return (
            <div className="flex-1 w-full flex flex-col items-center justify-center p-8 text-center bg-muted/5 border-b border-dashed">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4 shadow-sm">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">Carrito Vacío</h3>
                <p className="text-sm text-muted-foreground max-w-[200px] mt-1">
                    Selecciona productos del menú para comenzar una venta.
                </p>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-card/50">
            <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-b backdrop-blur-sm">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">{items.length}</span>
                    {items.length === 1 ? 'Producto' : 'Productos'}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 px-2"
                    onClick={onClearCart}
                >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Vaciar
                </Button>
            </div>

            <ScrollArea className="flex-1 h-full">
                <div className="p-4 space-y-3">
                    {items.map(item => (
                        <div
                            key={item.id}
                            className="group relative flex flex-col gap-2 p-3 rounded-lg border bg-card shadow-sm hover:border-primary/40 transition-colors"
                        >
                            <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-sm leading-tight line-clamp-2">{item.name}</h4>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        ${item.price.toLocaleString('es-AR')} un.
                                    </div>
                                </div>
                                <div className="font-bold text-sm">
                                    ${(item.price * item.quantity).toLocaleString('es-AR')}
                                </div>
                            </div>

                            <Separator className="bg-border/50" />

                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center rounded-md border bg-background shadow-xs">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded-l-md hover:bg-muted"
                                            onClick={() => onUpdateQuantity(item.id, -1)}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-8 text-center text-sm font-semibold selection:bg-none">
                                            {item.quantity}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded-r-md hover:bg-muted"
                                            onClick={() => onUpdateQuantity(item.id, 1)}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-1.5 ml-2 p-0.5 rounded-md hover:bg-muted/50 transition-colors">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Desc%</span>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={item.discountRate || ''}
                                            placeholder="0"
                                            onChange={(e) => onDiscountChange(item.id, Number(e.target.value))}
                                            className="w-10 bg-transparent text-xs text-center border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => onRemoveItem(item.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

            </ScrollArea >
        </div >
    )
}
