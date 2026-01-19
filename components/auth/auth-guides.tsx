"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, LifeBuoy, FileText, Clock } from 'lucide-react'
import { APP_VERSION_DISPLAY } from '@/lib/changelog'

const GUIDES = [
  {
    title: 'Atajos del POS',
    desc: 'Presioná "/" para buscar productos, "Enter" para agregar y "Ctrl + K" para abrir la búsqueda rápida.',
    icon: Zap
  },
  {
    title: 'Soporte y ayuda',
    desc: 'Accedé a guías paso a paso y soporte por correo para configurar tu negocio y emitir comprobantes.',
    icon: LifeBuoy
  },
  {
    title: 'Facturación y IVA',
    desc: 'Guardamos precios sin IVA y desglosamos impuestos en cada venta. Generá PDF para tu contabilidad.',
    icon: FileText
  },
  {
    title: 'Reportes rápidos',
    desc: 'Exportá ventas y productos a CSV/Excel y obtené reportes por periodo para tu contador.',
    icon: Clock
  }
]

export function AuthGuides({ mode = 'login' }: { mode?: 'login' | 'register' }) {
  const [index, setIndex] = useState<number>(() => Math.floor(Math.random() * GUIDES.length))

  useEffect(() => {
    const tick = setInterval(() => setIndex((i) => (i + 1) % GUIDES.length), 8000)
    return () => clearInterval(tick)
  }, [])

  const g = GUIDES[index]

  return (
    <div className="w-full h-full flex flex-col justify-center px-6 md:px-8 lg:px-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.35 }}
          aria-live="polite"
          className="flex flex-col gap-6 text-white"
        >
          <div>
            <h2 className="text-4xl font-extrabold">{mode === 'login' ? 'Bienvenido de vuelta' : 'Comenzá con Stockcito'}</h2>
            <p className="mt-2 text-sm max-w-md">Presioná <span className="font-semibold">/</span> o <span className="font-semibold">Ctrl/Cmd + K</span> para abrir la búsqueda rápida del POS. Usá <span className="font-semibold">Enter</span> para agregar productos y <span className="font-semibold">Esc</span> para cerrar.</p>
          </div>

          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center"><Zap className="w-5 h-5 text-white" /></div>
              <div>
                <div className="text-sm font-semibold">Atajos eficientes</div>
                <div className="text-xs text-white/80">Usá teclas para acelerar la caja.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center"><FileText className="w-5 h-5 text-white" /></div>
              <div>
                <div className="text-sm font-semibold">Facturación simplificada</div>
                <div className="text-xs text-white/80">Precios netos y IVA desglosado por alícuota.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center"><Clock className="w-5 h-5 text-white" /></div>
              <div>
                <div className="text-sm font-semibold">Reportes rápidos</div>
                <div className="text-xs text-white/80">CSV/Excel listos para tu contador.</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded bg-white/10">
              <div className="text-lg font-bold">Beta</div>
              <div className="text-xs text-white/80">Early Access</div>
            </div>
            <div className="p-3 rounded bg-white/10">
              <div className="text-lg font-bold">{APP_VERSION_DISPLAY}</div>
              <div className="text-xs text-white/80">Versión actual</div>
            </div>
            <div className="p-3 rounded bg-white/10">
              <div className="text-lg font-bold">100%</div>
              <div className="text-xs text-white/80">Gratis x 7 días</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-white/90">"Sé de los primeros en probar Stockcito" — El equipo</div>
            <div className="flex items-center gap-2">
              <button aria-label="Anterior" className="rounded px-2 py-1 bg-white/10 text-white text-sm" onClick={() => setIndex((i) => (i - 1 + GUIDES.length) % GUIDES.length)}>⟵</button>
              <button aria-label="Siguiente" className="rounded px-2 py-1 bg-white/10 text-white text-sm" onClick={() => setIndex((i) => (i + 1) % GUIDES.length)}>⟶</button>
            </div>
          </div>

          <div>
            <a href="/docs" className="inline-block rounded-md bg-white/10 px-4 py-2 text-sm">Ver documentación</a>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
