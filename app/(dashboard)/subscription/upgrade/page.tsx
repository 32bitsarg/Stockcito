"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PlanCard } from "@/components/subscription/plan-card"
import { PlanComparison } from "@/components/subscription/plan-comparison"
import { createCheckoutSession } from "@/actions/payment-actions"
import { useSubscription } from "@/hooks/useSubscription"
import { Crown, Shield, Zap, Clock } from "lucide-react"
import toast from "react-hot-toast"

const FREE_FEATURES = [
  { name: "POS completo", included: true },
  { name: "Dashboard básico", included: true },
  { name: "Gestión de descuentos", included: true },
  { name: "App de escritorio", included: true },
  { name: "Gestión de proveedores", included: false },
  { name: "Exportación PDF/Excel", included: false },
  { name: "Reportes avanzados", included: false },
  { name: "Alertas automáticas", included: false },
]

const ENTREPRENEUR_FEATURES = [
  { name: "POS completo", included: true },
  { name: "Dashboard en tiempo real", included: true },
  { name: "Gestión de descuentos", included: true },
  { name: "App de escritorio", included: true },
  { name: "Gestión de proveedores (hasta 10)", included: true },
  { name: "Exportación PDF/Excel", included: true },
  { name: "Reportes avanzados", included: false },
  { name: "Alertas automáticas", included: false },
]

const PYME_FEATURES = [
  { name: "POS completo", included: true },
  { name: "Dashboard en tiempo real", included: true },
  { name: "Gestión de descuentos", included: true },
  { name: "App de escritorio", included: true },
  { name: "Gestión de proveedores ilimitados", included: true },
  { name: "Exportación PDF/Excel", included: true },
  { name: "Reportes avanzados", included: true },
  { name: "Alertas automáticas", included: true },
  { name: "Auditoría completa", included: true },
  { name: "Soporte prioritario", included: true },
]

const FREE_LIMITS = [
  { name: "Productos", value: "25" },
  { name: "Clientes", value: "10" },
  { name: "Usuarios", value: "1" },
]

const ENTREPRENEUR_LIMITS = [
  { name: "Productos", value: "300" },
  { name: "Clientes", value: "200" },
  { name: "Usuarios", value: "2" },
]

const PYME_LIMITS = [
  { name: "Productos", value: "Ilimitados" },
  { name: "Clientes", value: "Ilimitados" },
  { name: "Usuarios", value: "Ilimitados" },
]

export default function UpgradePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { plan, isTrialing, loading: subscriptionLoading } = useSubscription()
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (targetPlan: "entrepreneur" | "premium") => {
    try {
      setLoading(targetPlan)
      console.log(`Starting checkout session for ${targetPlan}...`)
      const result = await createCheckoutSession("monthly", targetPlan)
      console.log('Checkout result:', result)

      if (result.success && result.checkoutUrl) {
        console.log('Redirecting to:', result.checkoutUrl)
        window.location.href = result.checkoutUrl
      } else {
        console.error('Checkout error:', result.error)
        toast.error(result.error || "Error al iniciar el pago")
      }
    } catch (error) {
      console.error('Checkout exception:', error)
      toast.error("Error al procesar la solicitud")
    } finally {
      setLoading(null)
    }
  }

  const isPyme = plan === "premium" && !isTrialing
  const isEntrepreneur = plan === "entrepreneur" && !isTrialing

  useEffect(() => {
    if (searchParams.get('auto_checkout') === 'true' && !loading && !subscriptionLoading && !isPyme) {
      handleUpgrade("premium")
    }
  }, [searchParams, subscriptionLoading, isPyme])

  return (
    <div className="container max-w-7xl py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Elige el plan perfecto para tu negocio
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Comienza gratis y escala cuando lo necesites. Sin compromisos, cancela cuando quieras.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
          <div className="p-2 rounded-full bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Pago seguro</h3>
            <p className="text-sm text-muted-foreground">
              Procesado por MercadoPago, el líder en pagos de Argentina
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
          <div className="p-2 rounded-full bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">7 días de prueba</h3>
            <p className="text-sm text-muted-foreground">
              Prueba todas las funciones Pyme sin compromiso
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
          <div className="p-2 rounded-full bg-primary/10">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Activación inmediata</h3>
            <p className="text-sm text-muted-foreground">
              Tu plan se activa al instante después del pago
            </p>
          </div>
        </div>
      </div>

      {/* Plan Cards - 3 columns */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
        <PlanCard
          name="Free"
          description="Para probar el sistema"
          price="Gratis"
          features={FREE_FEATURES}
          limits={FREE_LIMITS}
          current={plan === "free" && !isTrialing}
          buttonText={plan === "free" && !isTrialing ? "Plan actual" : undefined}
        />

        <PlanCard
          name="Emprendedor"
          description="Para negocios unipersonales"
          price="$15.000"
          priceYearly="$150.000"
          features={ENTREPRENEUR_FEATURES}
          limits={ENTREPRENEUR_LIMITS}
          current={isEntrepreneur}
          onSelect={isEntrepreneur || isPyme ? undefined : () => handleUpgrade("entrepreneur")}
          loading={loading === "entrepreneur"}
          buttonText={
            isTrialing
              ? "Suscribirme"
              : isEntrepreneur
                ? "Plan actual"
                : isPyme
                  ? "Ya tienes Pyme"
                  : "Elegir Emprendedor"
          }
        />

        <PlanCard
          name="Pyme"
          description="Para negocios establecidos"
          price="$30.000"
          priceYearly="$300.000"
          features={PYME_FEATURES}
          limits={PYME_LIMITS}
          popular
          current={isPyme}
          onSelect={isPyme ? undefined : () => handleUpgrade("premium")}
          loading={loading === "premium"}
          buttonText={
            isTrialing
              ? "Suscribirme ahora"
              : isPyme
                ? "Plan actual"
                : "Elegir Pyme"
          }
        />
      </div>

      {/* Detailed Comparison */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">
          Comparación detallada
        </h2>
        <PlanComparison />
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          Preguntas frecuentes
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">¿Cómo funciona el período de prueba?</h3>
            <p className="text-muted-foreground text-sm">
              Al registrarte, tienes 7 días para probar todas las funciones Pyme gratis.
              No necesitas tarjeta de crédito. Si no te suscribes, pasas automáticamente al plan Free.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">¿Qué métodos de pago aceptan?</h3>
            <p className="text-muted-foreground text-sm">
              Aceptamos tarjetas de crédito/débito, Mercado Pago, Rapipago, Pago Fácil,
              y transferencia bancaria a través de MercadoPago.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">¿Puedo cambiar de plan en cualquier momento?</h3>
            <p className="text-muted-foreground text-sm">
              Sí, puedes subir o bajar de plan cuando quieras. Si bajas, tu plan actual
              sigue activo hasta el final del período pagado.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">¿Qué pasa con mis datos si bajo de plan?</h3>
            <p className="text-muted-foreground text-sm">
              Tus datos nunca se borran. Si excedes los límites del plan inferior,
              simplemente no podrás crear nuevos registros hasta que elimines algunos
              o subas de plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
