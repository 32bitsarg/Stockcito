"use client"

import Link from "next/link"
import { Clock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TrialBannerProps {
  daysRemaining: number
  onUpgrade?: () => void
}

export function TrialBanner({ daysRemaining, onUpgrade }: TrialBannerProps) {
  const isUrgent = daysRemaining <= 2

  return (
    <div className={`
      flex items-center justify-between gap-4 px-4 py-2 rounded-lg text-sm
      ${isUrgent 
        ? 'bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700' 
        : 'bg-primary/10 border border-primary/20'}
    `}>
      <div className="flex items-center gap-2">
        <Sparkles className={`h-4 w-4 ${isUrgent ? 'text-yellow-600' : 'text-primary'}`} />
        <span className="font-medium">
          {isUrgent ? (
            <>
              <Clock className="inline h-3 w-3 mr-1" />
              ¡Tu prueba termina en {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'}!
            </>
          ) : (
            <>Período de prueba: {daysRemaining} días restantes</>
          )}
        </span>
        <span className="text-muted-foreground hidden sm:inline">
          — Estás probando Premium gratis
        </span>
      </div>

      <Button 
        size="sm" 
        variant={isUrgent ? "default" : "outline"}
        asChild
      >
        <Link href="/subscription/upgrade">
          Suscribirme
        </Link>
      </Button>
    </div>
  )
}
