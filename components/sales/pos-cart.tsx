"use client"

import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
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
            <div className="flex-1 w-full flex flex-col items-center justify-center p-12 text-center bg-zinc-50 dark:bg-zinc-950/20 border-y border-dashed border-zinc-200 dark:border-zinc-800">
                <div className="h-20 w-20 rounded-full border-2 border-zinc-100 dark:border-zinc-900 flex items-center justify-center mb-6 shadow-sm">
                    <ShoppingCart className="h-8 w-8 text-zinc-200 dark:text-zinc-800" />
                </div>
                <h3 className="font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 text-sm">Esperando Selección</h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2 max-w-[180px]">
                    Escanee productos para iniciar el procesamiento.
                </p>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="bg-white/20 dark:bg-black/10 px-2 py-0.5 rounded-sm font-mono">{items.length.toString().padStart(2, '0')}</span>
                    Líneas de Venta
                </span>
                <button
                    className="text-[10px] font-black uppercase tracking-widest hover:underline transition-all opacity-70 hover:opacity-100"
                    onClick={onClearCart}
                >
                    Anular Todo
                </button>
            </div>

            <ScrollArea className="flex-1 h-full bg-white dark:bg-zinc-950 font-sans">
                <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                    {items.map(item => (
                        <div
                            key={item.id}
                            className="group relative flex flex-col gap-3 p-5 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-black text-sm leading-tight text-zinc-900 dark:text-zinc-100 uppercase italic tracking-tighter line-clamp-2">{item.name}</h4>
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5 font-mono">
                                        UNIDAD: ${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="font-black text-base tabular-nums tracking-tighter text-zinc-900 dark:text-zinc-100 font-mono">
                                    ${(item.price * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-800">
                                        <button
                                            className="h-8 w-8 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-800 rounded-md transition-all active:scale-90"
                                            onClick={() => onUpdateQuantity(item.id, -1)}
                                        >
                                            <Minus className="h-3.5 w-3.5" />
                                        </button>
                                        <span className="w-10 text-center text-xs font-black font-mono selection:bg-none">
                                            {item.quantity.toString().padStart(2, '0')}
                                        </span>
                                        <button
                                            className="h-8 w-8 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-800 rounded-md transition-all active:scale-90"
                                            onClick={() => onUpdateQuantity(item.id, 1)}
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 group/desc">
                                        <span className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Desc.%</span>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={item.discountRate || ''}
                                            placeholder="00"
                                            onChange={(e) => onDiscountChange(item.id, Number(e.target.value))}
                                            className="w-10 bg-transparent text-xs font-black font-mono text-zinc-900 dark:text-zinc-100 text-center border-b border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none transition-all placeholder:text-zinc-200"
                                        />
                                    </div>
                                </div>

                                <button
                                    className="h-9 w-9 flex items-center justify-center text-zinc-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                    onClick={() => onRemoveItem(item.id)}
                                >
                                    <Trash2 className="h-4.5 w-4.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea >
        </div>
    )
}
