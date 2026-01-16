"use client"

import Link from "next/link"
import { Lock, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFeatureAccess } from "@/hooks/useSubscription"

interface FeatureGateProps {
  feature: string
  featureName: string
  description?: string
  children: React.ReactNode
}

export function FeatureGate({
  feature,
  featureName,
  description,
  children
}: FeatureGateProps) {
  const { hasAccess, loading } = useFeatureAccess(feature)

  if (loading) {
    return (
      <div className="animate-pulse bg-muted rounded-lg h-32" />
    )
  }

  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {/* Blurred background content */}
      <div className="blur-sm pointer-events-none opacity-50">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
        <div className="text-center p-6 max-w-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">{featureName}</h3>
          
          <p className="text-sm text-muted-foreground mb-4">
            {description || "Esta función está disponible en el plan Premium."}
          </p>

          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/subscription/upgrade">
                <Crown className="h-4 w-4 mr-2" />
                Mejorar a Premium
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/subscription">Ver mi plan</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple inline lock for buttons/actions
interface FeatureLockProps {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function FeatureLock({ feature, children, fallback }: FeatureLockProps) {
  const { hasAccess, loading } = useFeatureAccess(feature)

  if (loading) return null
  if (hasAccess) return <>{children}</>
  
  return (
    <>
      {fallback || (
        <Button variant="outline" disabled className="gap-2">
          <Lock className="h-4 w-4" />
          Premium
        </Button>
      )}
    </>
  )
}
