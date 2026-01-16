"use client"

import Link from "next/link"
import { Crown, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface UpgradeBannerProps {
  message?: string
  showDismiss?: boolean
}

export function UpgradeBanner({ 
  message = "Desbloquea todas las funciones con Premium",
  showDismiss = true
}: UpgradeBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="relative bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{message}</p>
            <p className="text-sm text-muted-foreground">
              Reportes avanzados, productos ilimitados, y más.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/subscription/upgrade">Ver planes</Link>
          </Button>
          
          {showDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
