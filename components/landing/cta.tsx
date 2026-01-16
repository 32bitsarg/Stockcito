"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'

export function LandingCTA() {
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-7xl mx-auto py-12 px-6 md:px-0 text-center">
      <div className="p-10 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border">
        <h3 className="text-2xl font-semibold">Potenciá tu negocio hoy</h3>
        <p className="mt-3 text-muted-foreground">Probá el POS en minutos y empieza a llevar el control real de tu inventario y ventas.</p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link href="/register" className="rounded-md bg-primary px-6 py-3 text-white font-semibold shadow">Comenzar gratis</Link>
          <Link href="/sales/new" className="rounded-md border px-6 py-3">Ir al POS</Link>
        </div>
      </div>
    </motion.section>
  )
}
