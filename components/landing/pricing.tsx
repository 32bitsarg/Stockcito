"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const plans = [
  {
    id: "free",
    name: "Plan Gratis",
    price: "$0",
    period: "/mes",
    features: ["Hasta 25 Productos", "Hasta 10 Clientes", "1 Unidad de Negocio", "Dashboard POS Básica"]
  },
  {
    id: "entrepreneur",
    name: "Emprendedor",
    price: "$15.000",
    period: "/mes",
    features: ["7 Días de Prueba", "Hasta 300 Productos", "Hasta 10 Proveedores", "Exportación PDF/Excel", "Gestión de Descuentos"]
  },
  {
    id: "premium",
    name: "Pyme",
    price: "$30.000",
    period: "/mes",
    features: ["7 Días de Prueba", "Productos Ilimitados", "Auditoría Completa", "Reportes Avanzados", "Alertas Automáticas"],
    recommended: true
  }
]

export function LandingPricing() {
  return (
    <section className="bg-white dark:bg-zinc-950 py-32 border-t border-zinc-50 dark:border-zinc-900">
      <div className="container mx-auto px-8">
        <div className="max-w-6xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 italic">Matriz de Suscripción</span>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Escala tu Infraestructura</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {plans.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="space-y-10"
              >
                <div className="space-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-8">
                  <h3 className="text-[12px] font-black uppercase tracking-[0.3em]">{p.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-black italic tracking-tighter">{p.price}</span>
                    <span className="text-[10px] font-bold text-zinc-500 mb-2">{p.period}</span>
                  </div>
                </div>

                <div className="space-y-4 h-48">
                  {p.features.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-4 text-zinc-500">
                      <div className="w-1 h-1 bg-zinc-200 rounded-full" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">{f}</span>
                    </div>
                  ))}
                </div>

                <Button variant={p.recommended ? "default" : "outline"} className="w-full h-12 rounded-none text-[10px] font-black uppercase tracking-[0.3em]" asChild>
                  <Link href={p.id === 'free' ? "/register" : `/register?mode=subscription&plan=${p.id}`}>Inicializar {p.name}</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
