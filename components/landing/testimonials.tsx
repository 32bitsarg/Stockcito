"use client"

import { motion } from 'framer-motion'

const testimonials = [
  { name: 'María G.', text: 'Stockcito me ayudó a organizar el almacén y las ventas. Fácil de usar y rápido.' },
  { name: 'Juan P.', text: 'La funcionalidad de IVA y la exportación a CSV me salvaron para la contabilidad.' },
  { name: 'Sofía R.', text: 'Ideal para kioscos y comercios chicos. El POS es muy ágil.' }
]

function initials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()
}

export function LandingTestimonials() {
  return (
    <section className="w-full max-w-7xl mx-auto py-12 px-6 md:px-0">
      <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-semibold text-center">Lo que dicen nuestros clientes</motion.h2>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.blockquote key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="p-6 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold">{initials(t.name)}</div>
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">Comercio local</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">"{t.text}"</p>
          </motion.blockquote>
        ))}
      </div>
    </section>
  )
}
