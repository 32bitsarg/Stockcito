"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, HelpCircle, MessageCircle, Loader2 } from "lucide-react"
import Link from "next/link"

function CancelledContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const paymentId = searchParams.get("payment_id")
  const status = searchParams.get("status")

  return (
    <div className="container max-w-2xl py-16">
      <Card>
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 rounded-full bg-orange-100 dark:bg-orange-900/20 w-fit">
            <XCircle className="h-12 w-12 text-orange-600" />
          </div>
          <CardTitle className="text-3xl">Pago cancelado</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              El proceso de pago fue cancelado. No se realizó ningún cargo.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              ¿Tuviste algún problema?
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                • Si tu tarjeta fue rechazada, intenta con otro medio de pago
              </li>
              <li>
                • Verifica que tienes fondos suficientes o límite disponible
              </li>
              <li>
                • Asegúrate de que tu tarjeta esté habilitada para compras online
              </li>
              <li>
                • Si el problema persiste, contacta a tu banco
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/subscription/upgrade">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Intentar de nuevo
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/dashboard">
                Volver al Dashboard
              </Link>
            </Button>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/docs" className="text-muted-foreground">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Centro de ayuda
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a 
                  href="mailto:soporte@stockcito.com" 
                  className="text-muted-foreground"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contactar soporte
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Puedes seguir usando Stockcito con el plan {status === "pending" ? "actual" : "Free"} mientras tanto.
      </p>
    </div>
  )
}

export default function SubscriptionCancelledPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CancelledContent />
    </Suspense>
  )
}
