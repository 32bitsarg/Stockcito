"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getProducts } from '@/actions/product-actions'

interface Product {
    id: number
    name: string
    sku: string | null
    price: any
    stock: number
    taxRate: number | any
    category?: {
        name: string
    } | null
}

interface ProductSearchProps {
    products: Product[]
    onSelect: (product: Product) => void
    placeholder?: string
}

export function ProductSearch({ products, onSelect, placeholder = "Buscar producto (nombre, SKU)..." }: ProductSearchProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [results, setResults] = useState(products || [])
    const [isPending, startTransition] = useTransition()

    // Filtrar productos (server-side)
    useEffect(() => {
        const t = setTimeout(() => {
            startTransition(async () => {
                if (!searchTerm) {
                    setResults(products || [])
                    return
                }
                try {
                    const res = await getProducts(searchTerm, 1, 25)
                    setResults(res as any)
                } catch (e) {
                    setResults([])
                }
            })
        }, 250)

        return () => clearTimeout(t)
    }, [searchTerm, products])

    const filteredProducts = results.slice(0, 10)

    // Manejar selección
    const handleSelect = (product: Product) => {
        onSelect(product)
        setSearchTerm("")
        setIsOpen(false)
        setSelectedIndex(0)
        inputRef.current?.focus()
    }

    // Navegación con teclado
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen && filteredProducts.length > 0 && searchTerm) {
            setIsOpen(true)
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev =>
                    prev < filteredProducts.length - 1 ? prev + 1 : prev
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev => prev > 0 ? prev - 1 : 0)
                break
            case 'Enter':
                e.preventDefault()
                if (filteredProducts[selectedIndex]) {
                    handleSelect(filteredProducts[selectedIndex])
                }
                break
            case 'Escape':
                setIsOpen(false)
                setSearchTerm("")
                break
        }
    }

    // Cerrar al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !inputRef.current?.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Escuchar evento global para enfocar la búsqueda (/, Ctrl+K)
    useEffect(() => {
        const handler = () => {
            setIsOpen(true)
            setTimeout(() => inputRef.current?.focus(), 0)
        }
        window.addEventListener('stockcito:focus-pos-search', handler as EventListener)
        return () => window.removeEventListener('stockcito:focus-pos-search', handler as EventListener)
    }, [])

    // Resetear índice cuando cambia la búsqueda
    useEffect(() => {
        setSelectedIndex(0)
    }, [searchTerm])

    return (
        <div className="relative w-full">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => searchTerm && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 pr-4"
                    autoComplete="off"
                />
            </div>

            {isOpen && filteredProducts.length > 0 && (
                <Card
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-2 max-h-[400px] overflow-auto shadow-lg"
                >
                    <div className="p-2">
                        {filteredProducts.map((product, index) => (
                            <div
                                key={product.id}
                                onClick={() => handleSelect(product)}
                                className={`
                                    p-3 rounded-md cursor-pointer transition-colors
                                    ${index === selectedIndex
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium">{product.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {product.sku && (
                                                <Badge variant="outline" className="text-xs">
                                                    SKU: {product.sku}
                                                </Badge>
                                            )}
                                            {product.category && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {product.category.name}
                                                </Badge>
                                            )}
                                            <Badge
                                                variant={product.stock > 0 ? "default" : "destructive"}
                                                className="text-xs"
                                            >
                                                Stock: {product.stock}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="font-bold text-green-600">
                                            ${Number(product.price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {isOpen && searchTerm && filteredProducts.length === 0 && (
                <Card className="absolute z-50 w-full mt-2 shadow-lg">
                    <div className="p-4 text-center text-muted-foreground">
                        No se encontraron productos
                    </div>
                </Card>
            )}
        </div>
    )
}
