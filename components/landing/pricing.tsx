"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, X, Crown, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Free',
    description: 'Ideal para comenzar tu negocio',
    price: 'Gratis',
    priceNote: 'para siempre',
    popular: false,
    features: [
      { name: 'POS completo sin límite de ventas', included: true },
      { name: 'Dashboard en tiempo real', included: true },
      { name: 'Gestión de descuentos', included: true },
      { name: 'App de escritorio', included: true },
      { name: 'Hasta 500 productos', included: true },
      { name: 'Hasta 100 clientes', included: true },
      { name: 'Hasta 2 usuarios', included: true },
      { name: 'Gestión de proveedores', included: false },
      { name: 'Exportación PDF/Excel', included: false },
      { name: 'Reportes avanzados', included: false },
      { name: 'Soporte prioritario', included: false },
    ],
    cta: 'Comenzar gratis',
    href: '/register',
  },
  {
    name: 'Premium',
    description: 'Para negocios en crecimiento',
    price: '$4.999',
    priceNote: 'ARS/mes',
    popular: true,
    features: [
      { name: 'POS completo sin límite de ventas', included: true },
      { name: 'Dashboard en tiempo real', included: true },
      { name: 'Gestión de descuentos', included: true },
      { name: 'App de escritorio', included: true },
      { name: 'Productos ilimitados', included: true },
      { name: 'Clientes ilimitados', included: true },
      { name: 'Hasta 10 usuarios', included: true },
      { name: 'Gestión de proveedores', included: true },
      { name: 'Exportación PDF/Excel', included: true },
      { name: 'Reportes avanzados', included: true },
      { name: 'Soporte prioritario', included: true },
    ],
    cta: 'Probar 7 días gratis',
    href: '/register',
  },
]

export function LandingPricing() {
  return (
    <section className="w-full max-w-7xl mx-auto py-16 px-6 md:px-0" id="pricing">
      <motion.div 
        initial={{ opacity: 0, y: 8 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <Badge variant="outline" className="mb-4">
          <Zap className="w-3 h-3 mr-1" />
          Planes simples
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold">
          Un precio justo para tu negocio
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Comienza gratis y escala cuando lo necesites. Sin sorpresas ni costos ocultos.
        </p>
      </motion.div>

      <motion.div 
        className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {plans.map((plan, i) => (
          <div
            key={plan.name}
            className={cn(
              "relative p-8 bg-white dark:bg-gray-900 border rounded-2xl shadow-sm",
              plan.popular && "border-primary shadow-lg ring-2 ring-primary/20"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  <Crown className="w-3 h-3 mr-1" />
                  Más popular
                </Badge>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-1">{plan.priceNote}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature.name} className="flex items-center gap-3 text-sm">
                  {feature.included ? (
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={cn(!feature.included && "text-muted-foreground")}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>

            <Button 
              asChild 
              className={cn(
                "w-full",
                plan.popular 
                  ? "bg-gradient-to-r from-primary to-primary/80" 
                  : ""
              )}
              variant={plan.popular ? "default" : "outline"}
            >
              <Link href={plan.href}>
                {plan.cta}
              </Link>
            </Button>
          </div>
        ))}
      </motion.div>

      <motion.div 
        className="text-center mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm text-muted-foreground">
          ¿Necesitas más usuarios o funciones personalizadas?{' '}
          <a href="mailto:soporte@stockcito.com" className="text-primary hover:underline">
            Contactanos
          </a>
        </p>
      </motion.div>
    </section>
  )
}
