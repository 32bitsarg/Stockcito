import { getSubscriptionInfo, getSubscriptionLogs } from "@/actions/subscription-actions"
import { getPaymentStatus } from "@/actions/payment-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UsageMeters } from "@/components/subscription/usage-meter"
import { Crown, Calendar, CreditCard, History, Sparkles, CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatPrice } from "@/lib/subscription/plans"
import { redirect } from "next/navigation"

// Force dynamic rendering for auth-required pages
export const dynamic = "force-dynamic"

export default async function SubscriptionPage() {
  const subscription = await getSubscriptionInfo()
  const paymentStatus = await getPaymentStatus()
  const logs = await getSubscriptionLogs(10)

  if (!subscription) {
    redirect("/login")
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  const getEventLabel = (event: string) => {
    const labels: Record<string, string> = {
      trial_started: "Inicio de prueba",
      trial_ended: "Fin de prueba",
      subscription_created: "Suscripción creada",
      renewed: "Renovación",
      cancelled: "Cancelación",
      expired: "Expirado",
      payment_received: "Pago recibido",
      payment_failed: "Pago fallido",
      downgraded: "Cambio a Free"
    }
    return labels[event] || event
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "trial":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "cancelled":
      case "expired":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "trial":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "cancelled":
      case "expired":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      default:
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi Suscripción</h1>
          <p className="text-muted-foreground">
            Gestiona tu plan y revisa el uso de tu cuenta
          </p>
        </div>

        {subscription.canUpgrade && (
          <Button asChild>
            <Link href="/subscription/upgrade">
              <Sparkles className="h-4 w-4 mr-2" />
              Mejorar plan
            </Link>
          </Button>
        )}
      </div>

      {/* Plan Card */}
      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Plan Header */}
        <div className={`p-6 ${subscription.isPremium ? "bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10" : "bg-muted/30"}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${subscription.isPremium ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" : "bg-muted"}`}>
                <Crown className={`w-7 h-7 ${subscription.isPremium ? "text-white" : "text-muted-foreground"}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">
                    Plan {subscription.plan === "premium" ? "Pyme" : subscription.plan === "entrepreneur" ? "Emprendedor" : "Free"}
                  </h2>
                  <Badge variant="outline" className={getStatusColor(subscription.planStatus)}>
                    {getStatusIcon(subscription.planStatus)}
                    <span className="ml-1">
                      {subscription.planStatus === "trial" && "En prueba"}
                      {subscription.planStatus === "active" && "Activo"}
                      {subscription.planStatus === "cancelled" && "Cancelado"}
                      {subscription.planStatus === "expired" && "Expirado"}
                    </span>
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {subscription.isTrialing && (
                    <>Período de prueba — <span className="font-medium text-primary">{subscription.trialDaysRemaining} días restantes</span></>
                  )}
                  {!subscription.isTrialing && subscription.isPremium && (
                    <>Tu suscripción se renueva en <span className="font-medium">{subscription.subscriptionDaysRemaining} días</span></>
                  )}
                  {subscription.isFree && !subscription.isTrialing && (
                    <>Plan gratuito con funciones limitadas</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Details */}
        <div className="p-6 grid gap-6 md:grid-cols-3 border-t">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-muted">
              <Crown className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Plan actual</p>
              <p className="font-medium">{subscription.plan === "premium" ? "Pyme" : subscription.plan === "entrepreneur" ? "Emprendedor" : "Free"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-muted">
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Próxima renovación</p>
              <p className="font-medium">
                {subscription.isPremium
                  ? formatDate(paymentStatus.nextPaymentDue)
                  : "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-muted">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Último pago</p>
              <p className="font-medium">
                {paymentStatus.lastPayment
                  ? formatDate(paymentStatus.lastPayment)
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Uso actual</h3>
        <div className="rounded-lg border bg-card p-6">
          <UsageMeters usage={subscription.usage} />
        </div>
      </div>

      {/* Upgrade CTA for Free users */}
      {subscription.isFree && !subscription.isTrialing && (
        <div className="rounded-lg border bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Desbloquea todo el potencial</h3>
                <p className="text-sm text-muted-foreground">
                  Usuarios ilimitados, reportes avanzados y más funciones premium
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/subscription/upgrade">
                Mejorar ahora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* History Section */}
      {logs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5" />
            Historial
          </h3>
          <div className="rounded-lg border bg-card divide-y">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <p className="font-medium text-sm">{getEventLabel(log.event)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
                {log.amount && (
                  <span className="font-medium text-sm">
                    {formatPrice(Number(log.amount))}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
