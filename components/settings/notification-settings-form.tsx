"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Bell, Mail, Loader2, Package, DollarSign, Users, CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form"
import { updateNotificationSettings, type NotificationSettingsData } from "@/actions/notification-actions"
import { toast } from "sonner"
import { notificationSettingsSchema, NotificationSettingsFormValues } from "@/lib/schemas"

interface NotificationSettingsFormProps {
    initialSettings: NotificationSettingsData | null
}

export function NotificationSettingsForm({ initialSettings }: NotificationSettingsFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<NotificationSettingsFormValues>({
        resolver: zodResolver(notificationSettingsSchema),
        defaultValues: initialSettings || {
            pushEnabled: true,
            emailEnabled: true,
            lowStock: true,
            lowStockThreshold: 5,
            dailySummary: false,
            dailySummaryTime: "20:00",
            newSale: false,
            highValueSale: true,
            highValueThreshold: 10000,
            cashDrawerAlerts: true,
            newEmployee: true,
        },
    })

    const onSubmit = async (values: NotificationSettingsFormValues) => {
        setIsLoading(true)
        try {
            const result = await updateNotificationSettings(values)
            if (result.success) {
                toast.success("Configuración guardada")
                router.refresh()
            } else {
                toast.error(result.error || "Error al guardar")
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Canales de notificación */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Canales</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="pushEnabled"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="flex items-center gap-2">
                                            <Bell className="h-4 w-4" />
                                            Notificaciones Push
                                        </FormLabel>
                                        <FormDescription>
                                            Recibir alertas en el navegador
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
                        <FormField
                            control={form.control}
                            name="emailEnabled"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Notificaciones Email
                                        </FormLabel>
                                        <FormDescription>
                                            Recibir alertas por correo
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
                    </div>
                </div>

                <Separator />

                {/* Alertas de Inventario */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Inventario
                    </h3>
                    <FormField
                        control={form.control}
                        name="lowStock"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel>Alerta de Stock Bajo</FormLabel>
                                    <FormDescription>
                                        Cuando un producto alcance el stock mínimo
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
                    {form.watch("lowStock") && (
                        <FormField
                            control={form.control}
                            name="lowStockThreshold"
                            render={({ field }) => (
                                <FormItem className="ml-4">
                                    <FormLabel>Umbral de stock bajo</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            className="w-32"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Alertar cuando el stock sea menor o igual a este valor
                                    </FormDescription>
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <Separator />

                {/* Alertas de Ventas */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Ventas
                    </h3>
                    <FormField
                        control={form.control}
                        name="highValueSale"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel>Ventas de Alto Valor</FormLabel>
                                    <FormDescription>
                                        Notificar cuando se realice una venta grande
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
                    {form.watch("highValueSale") && (
                        <FormField
                            control={form.control}
                            name="highValueThreshold"
                            render={({ field }) => (
                                <FormItem className="ml-4">
                                    <FormLabel>Monto mínimo para alertar</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">$</span>
                                            <Input
                                                type="number"
                                                className="w-40"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    )}
                    <FormField
                        control={form.control}
                        name="newSale"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel>Todas las Ventas</FormLabel>
                                    <FormDescription>
                                        Recibir notificación por cada venta realizada
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
                    <FormField
                        control={form.control}
                        name="dailySummary"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel>Resumen Diario</FormLabel>
                                    <FormDescription>
                                        Recibir un resumen de ventas al final del día
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
                </div>

                <Separator />

                {/* Otras alertas */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Operaciones
                    </h3>
                    <FormField
                        control={form.control}
                        name="cashDrawerAlerts"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        Movimientos de Caja
                                    </FormLabel>
                                    <FormDescription>
                                        Aperturas y cierres de caja
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
                    <FormField
                        control={form.control}
                        name="newEmployee"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel>Nuevos Empleados</FormLabel>
                                    <FormDescription>
                                        Cuando se registre un nuevo empleado
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
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </div>
            </form>
        </Form>
    )
}
