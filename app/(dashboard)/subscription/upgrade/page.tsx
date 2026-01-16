"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlanCard } from "@/components/subscription/plan-card"
import { PlanComparison } from "@/components/subscription/plan-comparison"
import { createCheckoutSession } from "@/actions/payment-actions"
import { useSubscription } from "@/hooks/useSubscription"
import { Crown, Shield, Zap, Clock } from "lucide-react"
import toast from "react-hot-toast"

const FREE_FEATURES = [
  { name: "POS completo sin límite de ventas", included: true },
  { name: "Dashboard en tiempo real", included: true },
  { name: "Gestión de descuentos", included: true },
  { name: "App de escritorio", included: true },
  { name: "Gestión de proveedores", included: false },
  { name: "Exportación PDF/Excel", included: false },
  { name: "Reportes avanzados", included: false },
  { name: "Alertas automáticas", included: false },
  { name: "Soporte prioritario", included: false },
]

const PREMIUM_FEATURES = [
  { name: "POS completo sin límite de ventas", included: true },
  { name: "Dashboard en tiempo real", included: true },
  { name: "Gestión de descuentos", included: true },
  { name: "App de escritorio", included: true },
  { name: "Gestión de proveedores", included: true },
  { name: "Exportación PDF/Excel", included: true },
  { name: "Reportes avanzados", included: true },
  { name: "Alertas automáticas", included: true },
  { name: "Soporte prioritario", included: true },
]

const FREE_LIMITS = [
  { name: "Productos", value: "500" },
  { name: "Clientes", value: "100" },
  { name: "Usuarios", value: "2" },
  { name: "Facturas/mes", value: "50" },
]

const PREMIUM_LIMITS = [
  { name: "Productos", value: "Ilimitados" },
  { name: "Clientes", value: "Ilimitados" },
  { name: "Usuarios", value: "10" },
  { name: "Facturas/mes", value: "Ilimitadas" },
]

export default function UpgradePage() {
  const router = useRouter()
  const { plan, isTrialing, loading: subscriptionLoading } = useSubscription()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    try {
      setLoading(true)
      const result = await createCheckoutSession("monthly")
      
      if (result.success && result.checkoutUrl) {
        // Redirect to MercadoPago checkout
        window.location.href = result.checkoutUrl
      } else {
        toast.error(result.error || "Error al iniciar el pago")
      }
    } catch {
      toast.error("Error al procesar la solicitud")
    } finally {
      setLoading(false)
    }
  }

  const isPremium = plan === "premium" && !isTrialing

  return (
    <div className="container max-w-6xl py-8">
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
              Prueba todas las funciones Premium sin compromiso
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

      {/* Plan Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        <PlanCard
          name="Free"
          description="Ideal para comenzar tu negocio"
          price="Gratis"
          features={FREE_FEATURES}
          limits={FREE_LIMITS}
          current={plan === "free" && !isTrialing}
          buttonText={plan === "free" && !isTrialing ? "Plan actual" : undefined}
        />
        
        <PlanCard
          name="Premium"
          description="Para negocios en crecimiento"
          price="$4.999"
          priceYearly="$49.990"
          features={PREMIUM_FEATURES}
          limits={PREMIUM_LIMITS}
          popular
          current={isPremium}
          onSelect={isPremium ? undefined : handleUpgrade}
          loading={loading}
          buttonText={
            isTrialing 
              ? "Suscribirme ahora" 
              : isPremium 
                ? "Plan actual" 
                : "Mejorar a Premium"
          }
        />
      </div>

      {/* Detailed Comparison */}
      <div className="max-w-4xl mx-auto">
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
              Al registrarte, tienes 7 días para probar todas las funciones Premium gratis. 
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
            <h3 className="font-semibold mb-2">¿Puedo cancelar en cualquier momento?</h3>
            <p className="text-muted-foreground text-sm">
              Sí, puedes cancelar cuando quieras. Tu plan Premium seguirá activo hasta 
              el final del período pagado, luego pasarás al plan Free.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">¿Qué pasa con mis datos si bajo a Free?</h3>
            <p className="text-muted-foreground text-sm">
              Tus datos nunca se borran. Si excedes los límites del plan Free, 
              simplemente no podrás crear nuevos registros hasta que elimines algunos 
              o vuelvas a Premium.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
