"use client"

import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface UsageMeterProps {
  label: string
  current: number
  limit: number
  showPercentage?: boolean
  className?: string
}

export function UsageMeter({
  label,
  current,
  limit,
  showPercentage = true,
  className
}: UsageMeterProps) {
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 0 : Math.min(100, Math.round((current / limit) * 100))
  const isNearLimit = percentage >= 80
  const isAtLimit = percentage >= 100

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn(
          "font-medium",
          isAtLimit && "text-destructive",
          isNearLimit && !isAtLimit && "text-yellow-600 dark:text-yellow-500"
        )}>
          {current.toLocaleString('es-AR')}
          {isUnlimited ? (
            <span className="text-muted-foreground"> / Ilimitado</span>
          ) : (
            <span className="text-muted-foreground"> / {limit.toLocaleString('es-AR')}</span>
          )}
          {showPercentage && !isUnlimited && (
            <span className="ml-2 text-muted-foreground">({percentage}%)</span>
          )}
        </span>
      </div>
      
      {!isUnlimited && (
        <Progress 
          value={percentage} 
          className={cn(
            "h-2",
            isAtLimit && "[&>div]:bg-destructive",
            isNearLimit && !isAtLimit && "[&>div]:bg-yellow-500"
          )}
        />
      )}

      {isAtLimit && (
        <p className="text-xs text-destructive">
          Has alcanzado el límite. Mejora a Premium para continuar.
        </p>
      )}
    </div>
  )
}

interface UsageMetersProps {
  usage: {
    products: { current: number; limit: number }
    clients: { current: number; limit: number }
    users: { current: number; limit: number }
    invoices: { current: number; limit: number }
  }
  className?: string
}

export function UsageMeters({ usage, className }: UsageMetersProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <UsageMeter 
        label="Productos" 
        current={usage.products.current} 
        limit={usage.products.limit} 
      />
      <UsageMeter 
        label="Clientes" 
        current={usage.clients.current} 
        limit={usage.clients.limit} 
      />
      <UsageMeter 
        label="Usuarios" 
        current={usage.users.current} 
        limit={usage.users.limit} 
      />
      <UsageMeter 
        label="Facturas este mes" 
        current={usage.invoices.current} 
        limit={usage.invoices.limit} 
      />
    </div>
  )
}
