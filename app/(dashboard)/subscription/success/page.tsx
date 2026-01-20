"use client"

import { useEffect, useState, Suspense, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Crown, ArrowRight, Loader2, AlertCircle, Clock } from "lucide-react"
import Link from "next/link"
import { verifySubscriptionPayment, type VerificationResult } from "@/actions/payment-actions"

type VerificationStatus = 'loading' | 'success' | 'pending' | 'error'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const paymentId = searchParams.get("payment_id")
  const externalReference = searchParams.get("external_reference")
  const mpStatus = searchParams.get("status")

  const verify = useCallback(async () => {
    try {
      const verificationResult = await verifySubscriptionPayment(paymentId, externalReference)
      setResult(verificationResult)

      if (verificationResult.success && verificationResult.status === 'approved') {
        setStatus('success')

        // Dynamic import of canvas-confetti
        const confetti = (await import("canvas-confetti")).default
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      } else if (verificationResult.status === 'pending') {
        setStatus('pending')

        // If pending and we haven't retried too many times, retry after a delay
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
          }, 3000)
        }
      } else {
        setStatus('error')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setResult({
        success: false,
        status: 'error',
        message: 'Error al verificar el pago',
        planActive: false
      })
    }
  }, [paymentId, externalReference, retryCount])

  useEffect(() => {
    verify()
  }, [verify])

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando tu pago...</p>
        </div>
      </div>
    )
  }

  // Pending state
  if (status === 'pending') {
    return (
      <div className="container max-w-2xl py-16">
        <Card className="border-2 border-yellow-500">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-4 rounded-full bg-yellow-100 dark:bg-yellow-900/20 w-fit">
              <Clock className="h-12 w-12 text-yellow-600" />
            </div>
            <CardTitle className="text-3xl">Pago Pendiente</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-4">
                {result?.message || 'Tu pago está siendo procesado. Esto puede tomar unos minutos.'}
              </p>

              {retryCount < 3 && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Verificando automáticamente...</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => verify()} variant="outline" className="flex-1">
                Verificar nuevamente
              </Button>
              <Button asChild className="flex-1">
                <Link href="/dashboard">
                  Ir al Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Si el pago fue aprobado, recibirás un email de confirmación y tu cuenta se actualizará automáticamente.
        </p>
      </div>
    )
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="container max-w-2xl py-16">
        <Card className="border-2 border-destructive">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-4 rounded-full bg-red-100 dark:bg-red-900/20 w-fit">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-3xl">Hubo un problema</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-4">
                {result?.message || 'No pudimos verificar tu pago. Por favor, contacta a soporte si el problema persiste.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => verify()} variant="outline" className="flex-1">
                Reintentar
              </Button>
              <Button asChild variant="default" className="flex-1">
                <Link href="/subscription">
                  Ver opciones de suscripción
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  return (
    <div className="container max-w-2xl py-16">
      <Card className="border-2 border-primary">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 rounded-full bg-green-100 dark:bg-green-900/20 w-fit">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-3xl">¡Bienvenido a Premium!</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-4">
              {result?.planActive
                ? 'Tu pago fue procesado exitosamente. Ahora tienes acceso a todas las funciones Premium de Stockcito.'
                : 'Tu pago fue aprobado. Tu cuenta Premium se activará en breve.'
              }
            </p>

            <div className="flex items-center justify-center gap-2 text-primary font-semibold">
              <Crown className="h-5 w-5" />
              <span>{result?.planActive ? 'Plan Premium Activo' : 'Activando Plan Premium...'}</span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Ahora puedes disfrutar de:</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Productos, clientes y usuarios ilimitados</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Exportación a PDF y Excel</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Reportes avanzados y análisis</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Gestión completa de proveedores</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Alertas automáticas de stock</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Soporte prioritario</span>
              </li>
            </ul>
          </div>

          {paymentId && (
            <div className="text-center text-sm text-muted-foreground">
              <p>ID de pago: {paymentId}</p>
              {externalReference && <p>Referencia: {externalReference}</p>}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/dashboard">
                Ir al Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/subscription">
                Ver mi suscripción
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Recibirás un email de confirmación con los detalles de tu suscripción.
      </p>
    </div>
  )
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
