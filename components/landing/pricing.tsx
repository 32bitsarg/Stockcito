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
    description: 'Para probar el sistema.',
    price: '$0',
    priceNote: '/mes',
    popular: false,
    features: [
      { name: 'Hasta 25 productos', included: true },
      { name: 'Hasta 10 clientes', included: true },
      { name: 'Solo 1 usuario (dueño)', included: true },
      { name: 'Historial de 24hs', included: true },
      { name: 'Proveedores', included: false },
      { name: 'Exportación PDF/Excel', included: false },
      { name: 'Reportes avanzados', included: false },
    ],
    cta: 'Crear cuenta gratis',
    href: '/register',
    variant: 'outline' as const
  },
  {
    name: 'Emprendedor',
    description: 'Para negocios unipersonales.',
    price: '$15.000',
    priceNote: 'ARS/mes',
    popular: false,
    features: [
      { name: 'Hasta 300 productos', included: true },
      { name: 'Hasta 200 clientes', included: true },
      { name: 'Hasta 2 usuarios', included: true },
      { name: 'Historial de 30 días', included: true },
      { name: 'Hasta 10 proveedores', included: true },
      { name: 'Exportación PDF y Excel', included: true },
      { name: 'Reportes avanzados', included: false },
      { name: 'Alertas automáticas', included: false },
    ],
    cta: 'Empezar prueba gratis',
    href: '/register',
    variant: 'outline' as const
  },
  {
    name: 'Pyme',
    description: 'Para negocios establecidos.',
    price: '$30.000',
    priceNote: 'ARS/mes',
    popular: true,
    features: [
      { name: 'Productos ilimitados', included: true },
      { name: 'Clientes ilimitados', included: true },
      { name: 'Usuarios ilimitados', included: true },
      { name: 'Historial completo', included: true },
      { name: 'Proveedores ilimitados', included: true },
      { name: 'Exportación PDF y Excel', included: true },
      { name: 'Reportes avanzados', included: true },
      { name: 'Alertas automáticas', included: true },
      { name: 'Auditoría completa', included: true },
      { name: 'Soporte prioritario', included: true },
    ],
    cta: 'Empezar prueba de 7 días',
    href: '/register',
    variant: 'default' as const
  },
]

export function LandingPricing() {
  return (
    <section className="w-full py-24 bg-muted/30" id="pricing">
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
            Elegí el plan que mejor se adapte a tu etapa. Sin contratos a largo plazo.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
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
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-primary/60" />
                )}
                <CardHeader>
                  {plan.popular && (
                    <Badge className="w-fit mb-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                      Más popular
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
                          <div className="h-5 w-5 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                            <Check className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-muted/50 text-muted-foreground/60 flex items-center justify-center shrink-0">
                            <X className="h-3 w-3" />
                          </div>
                        )}
                        <span className={cn(
                          !feature.included && "text-muted-foreground decoration-muted-foreground/60"
                        )}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <div className="flex flex-col gap-3 w-full">
                    <Button className="w-full h-11 text-base font-medium shadow-sm transition-all hover:scale-[1.02]" variant={plan.variant} asChild>
                      <Link href={plan.href}>{plan.cta}</Link>
                    </Button>
                    {plan.name === 'Pyme' && (
                      <Button className="w-full h-11 border-primary text-primary hover:bg-primary/5 text-base font-medium" variant="outline" asChild>
                        <Link href="/register?mode=subscription">Suscribirse ahora</Link>
                      </Button>
                    )}
                  </div>
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
