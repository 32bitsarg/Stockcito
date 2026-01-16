// Plan definitions for Stockcito v2.0.0

export const PLAN_LIMITS = {
  free: {
    maxProducts: 500,
    maxClients: 100,
    maxUsers: 2,
    maxInvoicesPerMonth: 50,
    maxCreditNotesPerMonth: 10,
    reportDaysLimit: 7,
    features: {
      suppliers: false,
      advancedReports: false,
      pdfExport: false,
      excelExport: false,
      bulkOperations: false,
      auditFull: false,
      alerts: false,
      customTheme: false,
      prioritySupport: false,
      api: false,
    }
  },
  premium: {
    maxProducts: -1, // unlimited
    maxClients: -1,
    maxUsers: 10,
    maxInvoicesPerMonth: -1,
    maxCreditNotesPerMonth: -1,
    reportDaysLimit: -1, // unlimited history
    features: {
      suppliers: true,
      advancedReports: true,
      pdfExport: true,
      excelExport: true,
      bulkOperations: true,
      auditFull: true,
      alerts: true,
      customTheme: true,
      prioritySupport: true,
      api: true,
    }
  }
} as const

export type PlanType = keyof typeof PLAN_LIMITS
export type PlanFeature = keyof typeof PLAN_LIMITS.free.features

export const PLAN_PRICES = {
  free: {
    monthly: 0,
    yearly: 0,
    currency: 'ARS'
  },
  premium: {
    monthly: 4999,
    yearly: 49990, // 2 months free
    currency: 'ARS'
  }
} as const

export const TRIAL_DAYS = 7
export const GRACE_PERIOD_DAYS = 7 // For Electron offline mode

export interface PlanInfo {
  id: PlanType
  name: string
  description: string
  price: number
  priceYearly: number
  currency: string
  limits: typeof PLAN_LIMITS[keyof typeof PLAN_LIMITS]
  popular?: boolean
}

export const PLANS: PlanInfo[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Ideal para comenzar tu negocio',
    price: PLAN_PRICES.free.monthly,
    priceYearly: PLAN_PRICES.free.yearly,
    currency: 'ARS',
    limits: PLAN_LIMITS.free,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Para negocios en crecimiento',
    price: PLAN_PRICES.premium.monthly,
    priceYearly: PLAN_PRICES.premium.yearly,
    currency: 'ARS',
    limits: PLAN_LIMITS.premium,
    popular: true,
  }
]

export function getPlanLimits(plan: PlanType) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free
}

export function hasFeature(plan: PlanType, feature: PlanFeature): boolean {
  const limits = getPlanLimits(plan)
  return limits.features[feature] ?? false
}

export function isUnlimited(value: number): boolean {
  return value === -1
}

export function formatPrice(price: number, currency: string = 'ARS'): string {
  if (price === 0) return 'Gratis'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

export function formatLimit(value: number): string {
  if (value === -1) return 'Ilimitado'
  return value.toLocaleString('es-AR')
}
