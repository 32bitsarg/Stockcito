"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { discountSchema, DiscountFormValues } from "@/lib/schemas"
import { createDiscount, updateDiscount } from "@/actions/discount-actions"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save, Percent } from "lucide-react"
import { format } from "date-fns"

interface Category {
    id: number
    name: string
}

interface DiscountFormProps {
    discount?: {
        id: number
        name: string
        description: string | null
        type: string
        value: any
        minPurchase: any | null
        maxDiscount: any | null
        startDate: Date | null
        endDate: Date | null
        categoryId: number | null
        isActive: boolean
    }
    categories: Category[]
}

export function DiscountForm({ discount, categories }: DiscountFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const isEditing = !!discount

    const form = useForm<DiscountFormValues>({
        resolver: zodResolver(discountSchema) as any,
        defaultValues: {
            name: discount?.name || "",
            description: discount?.description || "",
            type: (discount?.type as "percentage" | "fixed") || "percentage",
            value: discount?.value ? Number(discount.value) : 0,
            minPurchase: discount?.minPurchase ? Number(discount.minPurchase) : undefined,
            maxDiscount: discount?.maxDiscount ? Number(discount.maxDiscount) : undefined,
            startDate: discount?.startDate ? discount.startDate : undefined,
            endDate: discount?.endDate ? discount.endDate : undefined,
            categoryId: discount?.categoryId || undefined,
            isActive: discount?.isActive ?? true
        }
    })

    const discountType = form.watch("type")

    function onSubmit(data: DiscountFormValues) {
        setError(null)
        startTransition(async () => {
            const result = isEditing 
                ? await updateDiscount(discount.id, data)
                : await createDiscount(data)

            if (result.error) {
                if (typeof result.error === 'string') {
                    setError(result.error)
                } else {
                    setError("Error al guardar el descuento")
                }
            } else {
                router.push("/discounts")
                router.refresh()
            }
        })
    }

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>{isEditing ? "Editar Descuento" : "Nuevo Descuento"}</CardTitle>
                <CardDescription>
                    {isEditing 
                        ? "Modifica los datos del descuento" 
                        : "Crea una nueva promoción o descuento"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Descuento *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Promoción Verano 2025" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Describe la promoción..." 
                                            className="resize-none"
                                            rows={2}
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Descuento *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                                                <SelectItem value="fixed">Monto Fijo ($)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor *</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                    {discountType === 'percentage' ? '%' : '$'}
                                                </span>
                                                <Input 
                                                    type="number" 
                                                    step="0.01"
                                                    className="pl-8"
                                                    placeholder={discountType === 'percentage' ? '10' : '500'}
                                                    {...field} 
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="minPurchase"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Compra Mínima</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                                <Input 
                                                    type="number" 
                                                    step="0.01"
                                                    className="pl-8"
                                                    placeholder="0"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Monto mínimo para aplicar
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {discountType === 'percentage' && (
                                <FormField
                                    control={form.control}
                                    name="maxDiscount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descuento Máximo</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                                    <Input 
                                                        type="number" 
                                                        step="0.01"
                                                        className="pl-8"
                                                        placeholder="Sin límite"
                                                        {...field}
                                                        value={field.value ?? ''}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                Tope del descuento
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Inicio</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="date"
                                                {...field}
                                                value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Fin</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="date"
                                                {...field}
                                                value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoría (Opcional)</FormLabel>
                                    <Select 
                                        onValueChange={(val) => field.onChange(val ? parseInt(val) : undefined)} 
                                        defaultValue={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Todas las categorías" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="">Todas las categorías</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Aplica solo a productos de esta categoría
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Descuento Activo</FormLabel>
                                        <FormDescription>
                                            El descuento estará disponible para aplicar
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : isEditing ? (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Guardar Cambios
                                    </>
                                ) : (
                                    <>
                                        <Percent className="mr-2 h-4 w-4" />
                                        Crear Descuento
                                    </>
                                )}
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => router.back()}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
