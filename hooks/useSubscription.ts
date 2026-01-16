"use client"

import { useState, useEffect, useCallback } from 'react'
import { getSubscriptionInfo, SubscriptionInfo } from '@/actions/subscription-actions'

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const info = await getSubscriptionInfo()
      setSubscription(info)
    } catch (err) {
      setError('Error al cargar la suscripción')
      console.error('useSubscription error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    subscription,
    loading,
    error,
    refresh,
    // Convenience getters
    isPremium: subscription?.isPremium ?? false,
    isFree: subscription?.isFree ?? true,
    isTrialing: subscription?.isTrialing ?? false,
    plan: subscription?.plan ?? 'free',
    planStatus: subscription?.planStatus ?? 'active',
    trialDaysRemaining: subscription?.trialDaysRemaining ?? null,
    canUpgrade: subscription?.canUpgrade ?? true,
    usage: subscription?.usage ?? null
  }
}

// Hook for checking single feature access
export function useFeatureAccess(feature: string) {
  const { subscription, loading, isPremium, isTrialing } = useSubscription()
  
  // During trial, all premium features are available
  if (isTrialing) {
    return { hasAccess: true, loading }
  }

  // Check if feature is available in current plan
  const premiumFeatures = [
    'suppliers',
    'advancedReports', 
    'pdfExport',
    'excelExport',
    'bulkOperations',
    'auditFull',
    'alerts',
    'customTheme',
    'prioritySupport',
    'api'
  ]

  const hasAccess = isPremium || !premiumFeatures.includes(feature)

  return { hasAccess, loading }
}

// Hook for checking usage limits
export function useUsageLimit(limitType: 'products' | 'clients' | 'users' | 'invoices') {
  const { subscription, loading } = useSubscription()

  if (!subscription?.usage) {
    return {
      loading,
      current: 0,
      limit: 0,
      percentage: 0,
      isUnlimited: false,
      isAtLimit: false,
      canCreate: true
    }
  }

  const usage = subscription.usage[limitType]
  const isUnlimited = usage.limit === -1
  const isAtLimit = !isUnlimited && usage.current >= usage.limit
  const canCreate = isUnlimited || usage.current < usage.limit

  return {
    loading,
    current: usage.current,
    limit: usage.limit,
    percentage: usage.percentage,
    isUnlimited,
    isAtLimit,
    canCreate
  }
}
