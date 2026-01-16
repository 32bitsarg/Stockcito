"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { CreditCard, Box, BarChart2, Crown, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function LandingHero() {
  return (
    <section className="w-full max-w-7xl mx-auto py-20 px-6 md:px-0">
      <div className="grid gap-12 md:grid-cols-2 items-center">
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-xs px-2 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              v0.1 disponible
            </Badge>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">Haz ventas más rápido y controla tu stock con facilidad</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">Stockcito es un sistema pensado para comercios y PyMEs: POS ágil, gestión de inventario, IVA desglosado y facturación en PDF. Comenzá en minutos.</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="rounded-md bg-gradient-to-r from-primary to-primary/80 px-6 py-3 text-white font-semibold shadow-lg">
              Comenzar gratis
            </Link>
            <Link href="/sales/new" className="rounded-md border px-6 py-3">Probar POS</Link>
            <Link href="/subscription/upgrade" className="rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-900/20 px-6 py-3 text-amber-800 dark:text-amber-200 font-medium flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Ver planes
            </Link>
          </div>

          <div className="mt-6 text-sm text-muted-foreground flex items-center gap-3">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <span>7 días de prueba Premium gratis. Sin tarjeta requerida.</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="rounded-xl p-6 shadow-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
        >
          <div className="rounded-lg bg-white dark:bg-gray-900 p-6 ring-1 ring-gray-100 dark:ring-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Venta rápida</div>
                <div className="mt-2 text-sm font-semibold">3 items • $3.540,00</div>
              </div>
              <div className="text-sm text-muted-foreground">Pago: Efectivo</div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded flex items-center gap-2"><Box className="w-4 h-4" /> Buscar</div>
              <div className="p-3 bg-muted rounded flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Reportes</div>
              <div className="p-3 bg-muted rounded">Descuentos</div>
              <div className="p-3 bg-muted rounded">Factura PDF</div>
            </div>

            <div className="mt-4 bg-slate-50 dark:bg-slate-800 rounded p-3 text-sm font-mono">#001 • 3 items • Total $3.540,00</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
