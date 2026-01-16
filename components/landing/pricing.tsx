"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, X, Crown, Zap, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const plans = [
  {
    name: 'Free',
    description: 'Perfecto para empezar sin invertir un peso.',
    price: '$0',
    priceNote: '/mes',
    popular: false,
    features: [
      { name: 'POS Básico', included: true },
      { name: 'Hasta 100 productos', included: true },
      { name: 'Hasta 5 empleados', included: true },
      { name: 'Reportes Básicos', included: true },
      { name: 'Facturación PDF', included: false },
      { name: 'Control de Stock Avanzado', included: false },
      { name: 'Soporte Prioritario', included: false },
      { name: 'Múltiples Cajas', included: false },
    ],
    cta: 'Crear cuenta gratis',
    href: '/register',
    variant: 'outline' as const
  },
  {
    name: 'Pro',
    description: 'Para negocios que quieren crecer de verdad.',
    price: '$10.000',
    priceNote: 'ARS/mes',
    popular: true,
    features: [
      { name: 'POS Ilimitado', included: true },
      { name: 'Productos Ilimitados', included: true },
      { name: 'Usuarios Ilimitados', included: true },
      { name: 'Reportes Avanzados & Excel', included: true },
      { name: 'Facturación PDF & Fiscal', included: true },
      { name: 'Alertas de Stock', included: true },
      { name: 'Soporte Prioritario WhatsApp', included: true },
      { name: 'Gestión de Proveedores', included: true },
    ],
    cta: 'Empezar prueba de 7 días',
    href: '/register',
    variant: 'default' as const
  },
]

export function LandingPricing() {
  return (
    <section className="w-full py-24 bg-slate-50 dark:bg-slate-950/50" id="pricing">
      <div className="container px-4 md:px-6 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Precios simples, como tu negocio
          </h2>
          <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
            Sin contratos a largo plazo. Cancelá cuando quieras.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:gap-8 max-w-4xl mx-auto items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="h-full"
            >
              <Card className={cn(
                "h-full flex flex-col relative overflow-hidden transition-all hover:shadow-lg",
                plan.popular ? "border-primary shadow-md scale-100 md:scale-105 z-10" : "border-border"
              )}>
                {plan.popular && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-blue-600" />
                )}
                <CardHeader>
                  {plan.popular && (
                    <Badge className="w-fit mb-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                      Recomendado
                    </Badge>
                  )}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground font-medium">{plan.priceNote}</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm">
                        {feature.included ? (
                          <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                            <Check className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                            <X className="h-3 w-3" />
                          </div>
                        )}
                        <span className={cn(
                          !feature.included && "text-muted-foreground decoration-slate-400"
                        )}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full h-11" variant={plan.variant} asChild>
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Pagos seguros procesados por MercadoPago
          </p>
        </div>
      </div>
    </section>
  )
}
