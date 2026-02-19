"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { clientSchema, ClientFormValues } from "@/lib/schemas"
import { createClient, updateClient } from "@/actions/client-actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useOfflineMutation } from "@/hooks/use-offline-mutation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, UserPlus } from "lucide-react"

interface ClientFormProps {
    client?: {
        id: number
        name: string
        email: string | null
        phone: string | null
        address: string | null
        taxId: string | null
    }
}

export function ClientForm({ client }: ClientFormProps) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const isEditing = !!client

    const mutation = useOfflineMutation({
        mutationFn: (data: ClientFormValues) =>
            isEditing ? updateClient(client.id, data) : createClient(data),
        invalidateQueries: [['clients']],
        onSuccess: (result: any) => {
            if (result.error) {
                if (typeof result.error === 'string') {
                    setError(result.error)
                } else {
                    setError("Error al guardar el cliente")
                }
            } else {
                router.push("/clients")
                router.refresh()
            }
        },
        onError: () => {
            setError("Error al procesar la solicitud. Verifica tu conexión.")
        }
    })

    const isPending = mutation.isPending

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            name: client?.name || "",
            email: client?.email || "",
            phone: client?.phone || "",
            address: client?.address || "",
            taxId: client?.taxId || ""
        }
    })

    function onSubmit(data: ClientFormValues) {
        setError(null)
        mutation.mutate(data)
    }

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>{isEditing ? "Editar Cliente" : "Nuevo Cliente"}</CardTitle>
                <CardDescription>
                    {isEditing
                        ? "Modifica los datos del cliente"
                        : "Ingresa los datos del nuevo cliente"}
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
                                    <FormLabel>Nombre Completo *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Juan Pérez" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Nombre completo o razón social
                                    </FormDescription>
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
                                            <Input type="email" placeholder="juan@example.com" {...field} />
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

                        <FormField
                            control={form.control}
                            name="taxId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CUIT / CUIL / DNI</FormLabel>
                                    <FormControl>
                                        <Input placeholder="20-12345678-9" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Identificación fiscal para facturación
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dirección</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Av. Siempre Viva 123, Ciudad, Provincia"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
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
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Crear Cliente
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
