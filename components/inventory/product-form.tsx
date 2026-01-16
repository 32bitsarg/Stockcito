"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema, ProductFormValues } from "@/lib/schemas"
import { createProduct, updateProduct } from "@/actions/product-actions"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface ProductFormProps {
    initialData?: any
    categories?: Array<{ id: number; name: string }>
}

export function ProductForm({ initialData, categories = [] }: ProductFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: initialData?.name || "",
            sku: initialData?.sku || "",
            description: initialData?.description || "",
            price: initialData?.price || 0,
            cost: initialData?.cost || 0,
            stock: initialData?.stock || 0,
            minStock: initialData?.minStock || 0,
            taxRate: initialData?.taxRate || 21,
            categoryId: initialData?.categoryId || undefined,
        }
    })

    function onSubmit(data: ProductFormValues) {
        setError(null)
        startTransition(async () => {
            const result = initialData
                ? await updateProduct(initialData.id, data)
                : await createProduct(data)

            if (result && result.error) {
                if (typeof result.error === 'string') {
                    setError(result.error)
                } else {
                    console.error(result.error)
                }
            }
            // If success, server action redirects, so we don't need to do anything here.
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                        {error}
                    </div>
                )}

                {/* Información básica */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">Información básica</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Coca-Cola 500ml" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sku"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SKU</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: COD-001" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs">Código único opcional</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descripción del producto..."
                                            className="resize-none h-20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoría</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(value && value !== "0" ? parseInt(value) : undefined)}
                                        value={field.value?.toString() || "0"}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sin categoría" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="0">Sin categoría</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Precios */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">Precios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="cost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Costo *</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs">Precio de compra</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Precio Venta *</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs">Sin IVA</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="taxRate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>IVA %</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.5" min="0" placeholder="21" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs">Alícuota</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Stock */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">Inventario</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="stock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stock Actual *</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" placeholder="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="minStock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stock Mínimo</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" placeholder="0" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs">Alerta de bajo stock</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Acciones */}
                <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isPending ? "Guardando..." : (initialData ? "Guardar cambios" : "Crear producto")}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href="/inventory">Cancelar</Link>
                    </Button>
                </div>
            </form>
        </Form>
    )
}
