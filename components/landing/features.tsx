"use client"

import { motion } from 'framer-motion'
import { Zap, Bell, FileText, Download } from 'lucide-react'

const features = [
  { title: 'POS potente', desc: 'Búsqueda por nombre, SKU, autocompletado y atajos.', icon: <Zap className="w-5 h-5 text-primary"/> },
  { title: 'Alertas de stock', desc: 'Notificaciones y lista de reposición para evitar quiebres.', icon: <Bell className="w-5 h-5 text-primary"/> },
  { title: 'IVA y facturación', desc: 'Precios netos y desglose por alícuota. PDF e integración AFIP.', icon: <FileText className="w-5 h-5 text-primary"/> },
  { title: 'Reportes y export', desc: 'Exportá a CSV/Excel y obtené reportes por periodo.', icon: <Download className="w-5 h-5 text-primary"/> }
]

export function LandingFeatures() {
  return (
    <section className="w-full max-w-7xl mx-auto py-12 px-6 md:px-0">
      <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-semibold">Características</motion.h2>

      <motion.div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
        {features.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="p-6 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/5">{f.icon}</div>
              <h3 className="font-semibold">{f.title}</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
