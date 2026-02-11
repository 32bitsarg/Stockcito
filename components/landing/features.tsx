"use client"

import { motion } from 'framer-motion'
import { Shield, BarChart, Terminal, Database } from 'lucide-react'

const features = [
  {
    icon: <Terminal className="w-5 h-5" />,
    title: "Ventas sin Esperas",
    description: "Punto de venta diseñado para ser ágil. Realizá cobros en segundos sin fricciones para tus clientes."
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: "Control de Stock",
    description: "Alertas automáticas de falta de mercadería y seguimiento preciso de cada unidad en tus depósitos."
  },
  {
    icon: <BarChart className="w-5 h-5" />,
    title: "Reportes de Ganancia",
    description: "Visualizá tus márgenes reales y productos más vendidos con gráficos simples y detallados."
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Datos Protegidos",
    description: "Toda tu información contable y de clientes está respaldada en la nube con máxima seguridad."
  }
]

export function LandingFeatures() {
  return (
    <section className="bg-white dark:bg-zinc-950 py-32 border-t border-zinc-50 dark:border-zinc-900">
      <div className="container mx-auto px-8">
        <div className="flex flex-col md:flex-row gap-20">
          <div className="w-full md:w-1/3 space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 italic">Funciones Principales</span>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Ingeniería <br /> de Precisión</h2>
          </div>

          <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <div className="text-zinc-900 dark:text-white opacity-40">{f.icon}</div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em]">{f.title}</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 leading-relaxed italic max-w-xs">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
