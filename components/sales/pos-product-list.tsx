"use client"

import { ProductSearch } from "./product-search"
import { POSProductCard } from "./pos-product-card"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutGrid, List, Search, Plus } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"

interface Product {
    id: number
    name: string
    sku: string | null
    price: any
    stock: number
    taxRate: any
    category?: {
        name: string
    } | null
    [key: string]: any
}

interface POSProductListProps {
    products: Product[]
    onAddToCart: (product: Product) => void
    onEditStock?: (product: Product) => void
}

export function POSProductList({ products, onAddToCart, onEditStock }: POSProductListProps) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden">
            {/* Header: Fixed */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-6 bg-zinc-50/50 dark:bg-zinc-950">
                <div className="flex-1 max-w-xl">
                    <div className="relative group">
                        <ProductSearch
                            products={products}
                            onSelect={onAddToCart}
                            placeholder="ESCANEAR O BUSCAR PRODUCTO..."
                        />
                    </div>
                </div>

                <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as any)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-0.5 rounded-lg">
                    <ToggleGroupItem value="grid" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-zinc-100 dark:data-[state=active]:text-zinc-900 rounded-md h-8 w-8 transition-all">
                        <LayoutGrid className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="list" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-zinc-100 dark:data-[state=active]:text-zinc-900 rounded-md h-8 w-8 transition-all">
                        <List className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            {/* Content Area */}
            <ScrollArea className="flex-1 h-full font-sans">
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-400 p-12 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl m-6">
                        <Search className="h-12 w-12 mb-4 opacity-20" />
                        <h3 className="font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 mb-1">Catálogo Vacío</h3>
                        <p className="text-[11px] font-bold uppercase tracking-widest opacity-60">Sincronice el inventario para comenzar</p>
                    </div>
                ) : (
                    <div className="p-6">
                        {viewMode === "grid" ? (
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
                                {products.map(product => (
                                    <POSProductCard
                                        key={product.id}
                                        product={product as any}
                                        onAddToCart={onAddToCart}
                                        onEditStock={onEditStock}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-zinc-50 dark:bg-zinc-950/50 hover:bg-zinc-50 dark:hover:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800">
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest px-6 h-12">Producto</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest h-12">SKU</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-right h-12">Precio</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center h-12">Stock</TableHead>
                                            <TableHead className="w-[80px] h-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.map(product => (
                                            <TableRow key={product.id} className={cn(
                                                "group border-zinc-100 dark:border-zinc-900/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors",
                                                product.stock === 0 && "opacity-40"
                                            )}>
                                                <TableCell className="px-6 py-4">
                                                    <div className="font-black text-sm uppercase tracking-tighter text-zinc-900 dark:text-zinc-100">{product.name}</div>
                                                    {product.category && (
                                                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">{product.category.name}</div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-mono text-[11px] font-medium text-zinc-500 uppercase">
                                                    {product.sku || '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-black font-mono text-zinc-900 dark:text-zinc-100">
                                                    ${Number(product.price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <button
                                                        onClick={() => onEditStock?.(product)}
                                                        className={cn(
                                                            "font-mono font-black text-[11px] px-2 py-0.5 rounded-full transition-all hover:scale-110",
                                                            product.stock <= 5 && product.stock > 0 ? "bg-zinc-900 text-white" :
                                                                product.stock === 0 ? "bg-zinc-200 text-zinc-500" : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-300"
                                                        )}
                                                    >
                                                        {product.stock.toString().padStart(2, '0')}
                                                    </button>
                                                </TableCell>
                                                <TableCell className="pr-6">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-9 w-9 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 rounded-xl transition-all"
                                                        disabled={product.stock === 0}
                                                        onClick={() => onAddToCart(product)}
                                                    >
                                                        <Plus className="h-5 w-5" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}
