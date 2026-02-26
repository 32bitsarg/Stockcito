"use client"

import { useEffect, useState, Suspense, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Crown, ArrowRight, Loader2, AlertCircle, Clock, Sparkles } from "lucide-react"
import Link from "next/link"
import { verifySubscriptionPayment, type VerificationResult } from "@/actions/payment-actions"

type VerificationStatus = 'loading' | 'success' | 'pending' | 'error'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const preapprovalId = searchParams.get("preapproval_id")
  const paymentId = searchParams.get("payment_id") || preapprovalId
  const externalReference = searchParams.get("external_reference")
  const mpStatus = searchParams.get("status")

  const verify = useCallback(async () => {
    try {
      // Use preapprovalId if paymentId is not available (subscription flow)
      const idToVerify = paymentId || preapprovalId
      const verificationResult = await verifySubscriptionPayment(idToVerify, externalReference)
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
  const isEntrepreneur = result?.planName === 'Emprendedor'
  const planTitle = isEntrepreneur ? '¡Bienvenido a Emprendedor!' : '¡Bienvenido a Pyme!'

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4">
      <Card className="border-2 border-primary max-w-2xl w-full shadow-xl overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="text-center pb-4 pt-8">
          <div className="mx-auto mb-6 p-4 rounded-full bg-green-100 dark:bg-green-900/20 w-fit ring-8 ring-green-50 dark:ring-green-900/10">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            {planTitle}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 px-8 pb-10">
          <div className="text-center space-y-3">
            <p className="text-xl text-muted-foreground leading-relaxed">
              {result?.planActive
                ? `Tu pago de ${isEntrepreneur ? '$15.000' : '$30.000'} fue procesado exitosamente. Ahora tienes acceso a todas las funciones ${result?.planName} de Stockcito.`
                : `Tu pago fue aprobado exitosamente. Tu cuenta ${result?.planName} se activará en pocos segundos.`
              }
            </p>

            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-bold text-lg">
              <Crown className="h-6 w-6" />
              <span>{result?.planActive ? `Suscripción ${result?.planName} Activa` : `Activando Plan ${result?.planName}...`}</span>
            </div>
          </div>

          <div className="bg-muted/30 rounded-2xl p-8 border border-muted-foreground/10">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Tu plan incluye:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-base">
              {isEntrepreneur ? (
                <>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Hasta <strong>300 productos</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Hasta <strong>200 clientes</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span><strong>Dueño + 1 Empleado</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span><strong>10 Proveedores</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span><strong>30 días</strong> de reportes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Exportación <strong>PDF y Excel</strong></span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Productos <strong>ilimitados</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Clientes <strong>ilimitados</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Usuarios <strong>ilimitados</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Facturación <strong>ilimitada</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Reportes <strong>históricos</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Soporte <strong>prioritario</strong></span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild className="flex-1 h-14 text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
              <Link href="/dashboard">
                Ir al Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 h-14 text-lg border-2 hover:bg-muted transition-all">
              <Link href="/subscription">
                Ver mi suscripción
              </Link>
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground pt-4">
            ¿Necesitas ayuda? Escríbenos a <span className="text-primary font-medium">soporte@stockcito.com</span>
          </p>
        </CardContent>
      </Card>
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
