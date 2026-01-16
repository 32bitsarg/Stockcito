"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, ArrowLeft, RefreshCw, CreditCard, Loader2, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

function PendingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [checking, setChecking] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  
  const paymentId = searchParams.get("payment_id")
  const externalReference = searchParams.get("external_reference")

  const checkPaymentStatus = async () => {
    if (!paymentId) {
      toast.error("No se encontró el ID del pago")
      return
    }

    setChecking(true)
    setStatusMessage(null)

    try {
      const response = await fetch(`/api/payments/status?payment_id=${paymentId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al verificar el pago')
      }

      switch (data.status) {
        case 'approved':
          toast.success("¡Pago confirmado!")
          router.push('/subscription/success?payment_id=' + paymentId)
          break
        case 'rejected':
          toast.error("El pago fue rechazado")
          router.push('/subscription/cancelled?payment_id=' + paymentId)
          break
        case 'pending':
        case 'in_process':
          setStatusMessage("El pago aún está siendo procesado. Intenta nuevamente en unos minutos.")
          toast("Pago aún en proceso", { icon: "⏳" })
          break
        case 'cancelled':
          toast.error("El pago fue cancelado")
          router.push('/subscription/cancelled')
          break
        default:
          setStatusMessage(`Estado del pago: ${data.status}`)
      }
    } catch (error) {
      console.error('Error checking payment:', error)
      toast.error("Error al verificar el estado del pago")
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="container max-w-2xl py-16">
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 rounded-full bg-orange-100 dark:bg-orange-900/20 w-fit">
            <Clock className="h-12 w-12 text-orange-600" />
          </div>
          <CardTitle className="text-3xl">Pago pendiente</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-2">
              Tu pago está siendo procesado.
            </p>
            <p className="text-muted-foreground">
              Esto puede tomar unos minutos. Te notificaremos cuando se confirme.
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-600" />
              ¿Qué significa esto?
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                • Si pagaste con efectivo (Rapipago, Pago Fácil), el pago se acreditará cuando lo abones
              </li>
              <li>
                • Si pagaste con transferencia, puede demorar hasta 24 horas hábiles
              </li>
              <li>
                • Los pagos con tarjeta suelen confirmarse en minutos
              </li>
            </ul>
          </div>

          {paymentId && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground text-center">
                <span className="font-medium">ID de pago:</span> {paymentId}
              </p>
              {externalReference && (
                <p className="text-sm text-muted-foreground text-center mt-1">
                  <span className="font-medium">Referencia:</span> {externalReference}
                </p>
              )}
            </div>
          )}

          {statusMessage && (
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                {statusMessage}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={checkPaymentStatus} 
              className="flex-1"
              disabled={checking || !paymentId}
            >
              {checking ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Verificar estado
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Dashboard
              </Link>
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Mientras tanto, puedes seguir usando Stockcito normalmente.
            Tu plan se actualizará automáticamente cuando se confirme el pago.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SubscriptionPendingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <PendingContent />
    </Suspense>
  )
}
