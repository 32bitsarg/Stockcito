"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { supplierSchema, SupplierFormValues } from "@/lib/schemas"
import { createSupplier, updateSupplier } from "@/actions/supplier-actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useOfflineMutation } from "@/hooks/use-offline-mutation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, Building2 } from "lucide-react"

interface SupplierFormProps {
    supplier?: {
        id: number
        name: string
        email: string | null
        phone: string | null
        address: string | null
        taxId: string | null
        website: string | null
        notes: string | null
    }
}

export function SupplierForm({ supplier }: SupplierFormProps) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const isEditing = !!supplier

    const mutation = useOfflineMutation({
        mutationFn: (data: SupplierFormValues) =>
            isEditing ? updateSupplier(supplier.id, data) : createSupplier(data),
        invalidateQueries: [['suppliers']],
        onSuccess: (result: any) => {
            if (result.error) {
                if (typeof result.error === 'string') {
                    setError(result.error)
                } else {
                    setError("Error al guardar el proveedor")
                }
            } else {
                router.push("/suppliers")
                router.refresh()
            }
        },
        onError: () => {
            setError("Error al procesar la solicitud. Verifica tu conexión.")
        }
    })

    const isPending = mutation.isPending

    const form = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: supplier?.name || "",
            email: supplier?.email || "",
            phone: supplier?.phone || "",
            address: supplier?.address || "",
            taxId: supplier?.taxId || "",
            website: supplier?.website || "",
            notes: supplier?.notes || ""
        }
    })

    function onSubmit(data: SupplierFormValues) {
        setError(null)
        mutation.mutate(data)
    }

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>{isEditing ? "Editar Proveedor" : "Nuevo Proveedor"}</CardTitle>
                <CardDescription>
                    {isEditing
                        ? "Modifica los datos del proveedor"
                        : "Ingresa los datos del nuevo proveedor"}
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
                                    <FormLabel>Nombre / Razón Social *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Distribuidora XYZ S.A." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="contacto@proveedor.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+54 11 1234-5678" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="taxId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CUIT</FormLabel>
                                        <FormControl>
                                            <Input placeholder="30-12345678-9" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Identificación fiscal
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sitio Web</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://proveedor.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dirección</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Av. Industrial 1234, Zona Norte" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Notas adicionales sobre el proveedor..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Información adicional, condiciones de pago, etc.
                                    </FormDescription>
                                    <FormMessage />
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
                                        <Building2 className="mr-2 h-4 w-4" />
                                        Crear Proveedor
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
