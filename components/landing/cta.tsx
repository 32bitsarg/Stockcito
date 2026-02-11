"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LandingCTA() {
  return (
    <section className="bg-zinc-950 text-white py-32 overflow-hidden relative border-t border-white/5">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="container relative z-10 px-8 mx-auto text-center space-y-12">
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">Despliegue Global</span>
          <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.8]">¿Listo para <br /> Sincronizar?</h2>
        </div>

        <div className="flex justify-center">
          <Button size="lg" className="h-16 px-12 bg-white text-black hover:bg-zinc-200 rounded-none text-[12px] font-black uppercase tracking-[0.3em] transition-transform hover:scale-105" asChild>
            <Link href="/register" className="flex items-center gap-3">
              Empezar Ahora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 italic">No se requiere método de pago para el despliegue inicial.</p>
      </div>
    </section>
  )
}
