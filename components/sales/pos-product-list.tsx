"use client"

import { ProductSearch } from "./product-search"
import { POSProductCard } from "./pos-product-card"
import { useState, useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutGrid, List } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"
// Types matching the POS Interface
// We use a simplified version compatible with the Prisma Product type required by POSProductCard
interface Product {
    id: number
    name: string
    sku: string | null
    price: any // Using any to be compatible with Decimal from Prisma
    stock: number
    taxRate: any
    category?: {
        name: string
    } | null
    // Add optional fields to satisfy Prisma Product type if needed, 
    // or better, we cast to any when passing to POSProductCard if we can't fully match
    [key: string]: any
}

interface POSProductListProps {
    products: Product[]
    onAddToCart: (product: Product) => void
    onEditStock?: (product: Product) => void
}

export function POSProductList({ products, onAddToCart, onEditStock }: POSProductListProps) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [searchQuery, setSearchQuery] = useState("")

    // ... (rest of search/viewMode logic) ...

    return (
        <div className="flex flex-col h-full bg-background rounded-xl border shadow-sm overflow-hidden">
            {/* ... (Header) ... */}
            <div className="p-4 border-b flex flex-col gap-4 bg-muted/10">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <ProductSearch
                            products={products}
                            onSelect={onAddToCart}
                            placeholder="Buscar productos (Ctrl+K)..."
                        />
                    </div>
                    <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as any)}>
                        <ToggleGroupItem value="grid" aria-label="Vista de cuadrícula">
                            <LayoutGrid className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="list" aria-label="Vista de lista">
                            <List className="h-4 w-4" />
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </div>

            {/* Content Area */}
            <ScrollArea className="flex-1 p-4">
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground p-8 text-center border-2 border-dashed rounded-xl m-4">
                        <p>No se encontraron productos.</p>
                        <p className="text-sm">Agrega productos al inventario para comenzar a vender.</p>
                    </div>
                ) : (
                    <>
                        {viewMode === "grid" ? (
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
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
                            <div className="border rounded-md overflow-hidden bg-card">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>Producto</TableHead>
                                            <TableHead className="w-[100px]">SKU</TableHead>
                                            <TableHead className="text-right">Precio</TableHead>
                                            <TableHead className="w-[80px] text-center">Stock</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.map(product => (
                                            <TableRow key={product.id} className={product.stock === 0 ? "opacity-50" : ""}>
                                                <TableCell>
                                                    <div className="font-medium">{product.name}</div>
                                                    {product.category && (
                                                        <div className="text-xs text-muted-foreground">{product.category.name}</div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs font-mono text-muted-foreground">
                                                    {product.sku || '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    ${Number(product.price).toLocaleString('es-AR')}
                                                </TableCell>
                                                <TableCell className="text-center group cursor-pointer relative" onClick={() => onEditStock?.(product)}>
                                                    <span className={cn(
                                                        "text-xs font-bold px-2 py-0.5 rounded-full transition-all group-hover:scale-110",
                                                        product.stock <= 5 && product.stock > 0 ? "bg-yellow-100 text-yellow-700" :
                                                            product.stock === 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                                                    )}>
                                                        {product.stock}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 hover:bg-primary hover:text-primary-foreground"
                                                        disabled={product.stock === 0}
                                                        onClick={() => onAddToCart(product)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </>
                )}
            </ScrollArea>
        </div>
    )
}
