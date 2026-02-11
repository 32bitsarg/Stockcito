"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LandingHero() {
  return (
    <section className="relative w-full overflow-hidden bg-white dark:bg-zinc-950 pt-40 pb-40 lg:pt-60 lg:pb-60">
      {/* Ultra subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="container relative z-10 px-8 mx-auto">
        <div className="max-w-4xl mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 mb-8 block italic">
              Software de Gestión v0.1.5
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
          >
            <h1 className="text-7xl md:text-9xl lg:text-[11rem] font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic leading-[0.75] mb-12">
              Stock <br />
              Cito
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-8"
          >
            <Link href="/register" className="group flex items-center gap-4 text-zinc-900 dark:text-white">
              <span className="text-[12px] font-black uppercase tracking-[0.4em] italic border-b-2 border-zinc-900 dark:border-white pb-1">Iniciar Despliegue</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
            </Link>

            <Link href="/login" className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors italic">
              Terminal Activa
            </Link>
          </motion.div>

        </div>
      </div>

      {/* Minimal Version Watermark */}
      <div className="absolute bottom-12 right-12 opacity-[0.02] select-none pointer-events-none hidden lg:block">
        <div className="text-[20rem] font-black italic tracking-tighter leading-none uppercase">
          0.1
        </div>
      </div>
    </section>
  )
}
