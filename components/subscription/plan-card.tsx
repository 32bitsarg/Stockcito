"use client"

import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PlanCardProps {
  name: string
  description: string
  price: string
  priceYearly?: string
  period?: string
  features: { name: string; included: boolean }[]
  limits: { name: string; value: string }[]
  popular?: boolean
  current?: boolean
  onSelect?: () => void
  loading?: boolean
  buttonText?: string
}

export function PlanCard({
  name,
  description,
  price,
  priceYearly,
  period = "/mes",
  features,
  limits,
  popular = false,
  current = false,
  onSelect,
  loading = false,
  buttonText
}: PlanCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-all",
        popular && "border-primary shadow-md scale-[1.02]",
        current && "ring-2 ring-primary"
      )}
    >
      {popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
          Más popular
        </Badge>
      )}

      {current && (
        <Badge variant="outline" className="absolute -top-3 left-1/2 -translate-x-1/2">
          Plan actual
        </Badge>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold">{name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{price}</span>
          {price !== "Gratis" && <span className="text-muted-foreground">{period}</span>}
        </div>
        {priceYearly && (
          <p className="text-sm text-muted-foreground mt-1">
            o {priceYearly}/año (2 meses gratis)
          </p>
        )}
      </div>

      {/* Limits */}
      <div className="mb-6 space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Límites
        </h4>
        {limits.map((limit, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span>{limit.name}</span>
            <span className="font-medium">{limit.value}</span>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="mb-6 flex-1 space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Funciones
        </h4>
        {features.map((feature, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            {feature.included ? (
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className={cn(!feature.included && "text-muted-foreground")}>
              {feature.name}
            </span>
          </div>
        ))}
      </div>

      {onSelect && (
        <Button
          onClick={onSelect}
          disabled={loading || current}
          variant={popular ? "default" : "outline"}
          className="w-full"
        >
          {loading ? "Procesando..." : buttonText || (current ? "Plan actual" : "Seleccionar")}
        </Button>
      )}
    </div>
  )
}
