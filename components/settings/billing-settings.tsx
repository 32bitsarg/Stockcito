"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CreditCard, Calendar, FileText, AlertCircle, Trash2, Edit, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { PaymentInfo } from "@/lib/payments/mercadopago" // Assuming this type is exported or similar

interface BillingSettingsProps {
    currentPlan: string
    status: string
    nextPaymentDue: Date | null
    lastPaymentDate: Date | null
    amount: number
    paymentMethod?: {
        type: string
        lastFourDigits?: string | null
        brand?: string | null
        expirationMonth?: number | null
        expirationYear?: number | null
    } | null
    history: Array<{
        id: number
        date: Date
        amount: number
        event: string
        transactionId: string | null
        details: any
    }>
}

export function BillingSettings({
    currentPlan,
    status,
    nextPaymentDue,
    lastPaymentDate,
    amount,
    paymentMethod,
    history
}: BillingSettingsProps) {
    const [isDeletingCard, setIsDeletingCard] = useState(false)

    const handleRemoveCard = () => {
        // Logic to check if the month is paid before allowing removal
        // This is client-side validation, server-side actions should also validate
        const canRemove = true // Replace with actual logic if needed (e.g. check status === 'active' etc)

        if (!canRemove) {
            toast.error("No puedes eliminar la tarjeta hasta cancelar la suscripción o finalizar el periodo.")
            return
        }

        setIsDeletingCard(true)
        // Here we would call a server action, e.g., removePaymentMethod()
        setTimeout(() => {
            setIsDeletingCard(false)
            toast.success("Método de pago eliminado correctamente")
        }, 1500)
    }

    const handleUpdateCard = () => {
        toast.info("Redirigiendo a MercadoPago para actualizar tarjeta...")
        // Redirect logic -> 
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Plan Actual</CardTitle>
                    <CardDescription>Detalles de tu suscripción y facturación</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-medium text-lg capitalize">{currentPlan} Plan</p>
                            <div className="flex items-center gap-2">
                                <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                                    {status === 'active' ? 'Activo' : status === 'trial' ? 'Prueba Gratuita' : 'Inactivo'}
                                </Badge>
                                {nextPaymentDue && (
                                    <span className="text-sm text-muted-foreground">
                                        Renueva el {format(new Date(nextPaymentDue), "d 'de' MMMM, yyyy", { locale: es })}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold">${amount.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">/ mes</p>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Método de Pago
                        </h3>

                        {paymentMethod ? (
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-muted rounded-md">
                                        <CreditCard className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {paymentMethod.brand ? paymentMethod.brand.toUpperCase() : 'Tarjeta'}
                                            {paymentMethod.lastFourDigits ? ` •••• ${paymentMethod.lastFourDigits}` : ''}
                                        </p>
                                        {paymentMethod.expirationMonth && paymentMethod.expirationYear ? (
                                            <p className="text-sm text-muted-foreground">
                                                Vence {String(paymentMethod.expirationMonth).padStart(2, '0')}/{paymentMethod.expirationYear}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                Método de pago activo
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={handleUpdateCard}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Cambiar
                                    </Button>

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Eliminar
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>¿Eliminar método de pago?</DialogTitle>
                                                <DialogDescription>
                                                    Si eliminas tu tarjeta, no se podrá procesar la próxima renovación de tu suscripción.
                                                    Solo puedes eliminarla si el mes actual ya está abonado.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => { }}>Cancelar</Button>
                                                <Button variant="destructive" onClick={handleRemoveCard} disabled={isDeletingCard}>
                                                    {isDeletingCard ? "Eliminando..." : "Eliminar Tarjeta"}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        ) : (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>No hay método de pago</AlertTitle>
                                <AlertDescription>
                                    Agrega una tarjeta para asegurar la continuidad de tu servicio.
                                </AlertDescription>
                                <Button variant="outline" size="sm" className="mt-2" onClick={handleUpdateCard}>
                                    Agregar Tarjeta
                                </Button>
                            </Alert>
                        )}
                    </div>

                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Historial de Pagos</CardTitle>
                    <CardDescription>Descarga tus facturas y revisa tus pagos anteriores</CardDescription>
                </CardHeader>
                <CardContent>
                    {history.length > 0 ? (
                        <div className="rounded-md border">
                            <div className="grid grid-cols-4 p-4 font-medium text-sm text-muted-foreground bg-muted/50">
                                <div>Fecha</div>
                                <div>Descripción</div>
                                <div>Monto</div>
                                <div className="text-right">Comprobante</div>
                            </div>
                            <div className="divide-y">
                                {history.map((item) => (
                                    <div key={item.id} className="grid grid-cols-4 p-4 text-sm items-center">
                                        <div>
                                            {format(new Date(item.date), "d MMM yyyy", { locale: es })}
                                        </div>
                                        <div>
                                            {item.event === 'subscription_created' ? 'Suscripción Inicial' : 'Renovación Mensual'}
                                        </div>
                                        <div className="font-medium">
                                            ${item.amount.toLocaleString()}
                                        </div>
                                        <div className="text-right">
                                            <Button variant="ghost" size="sm" className="gap-2">
                                                <FileText className="w-4 h-4" />
                                                <span className="sr-only sm:not-sr-only sm:inline-block">Factura</span>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No hay pagos registrados aún.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
