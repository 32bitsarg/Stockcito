"use client"

import { motion } from 'framer-motion'

const testimonials = [
  {
    quote: "LA TERMINAL MÁS RÁPIDA QUE HEMOS DESPLEGADO. BRAVO.",
    author: "MARCOS R.",
    role: "DUEÑO DE KIOSCO"
  },
  {
    quote: "EL SYNC EN TIEMPO REAL CAMBIÓ NUESTRO CONTROL DE STOCK.",
    author: "ELENA G.",
    role: "GEREENTE DE ALMACÉN"
  }
]

export function LandingTestimonials() {
  return (
    <section className="bg-white dark:bg-zinc-950 py-32 border-t border-zinc-50 dark:border-zinc-900">
      <div className="container mx-auto px-8">
        <div className="max-w-4xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-300 italic">Opiniones de Usuarios</span>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Impacto del Despliegue Global</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <p className="text-2xl font-black italic tracking-tight uppercase leading-tight">
                  "{t.quote}"
                </p>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t.author}</span>
                  <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-400 block italic">{t.role}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
