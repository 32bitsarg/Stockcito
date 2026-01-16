"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Package, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function LandingHero() {
  return (
    <section className="relative w-full overflow-hidden bg-background pt-16 pb-32 lg:pt-32">
      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center text-center space-y-8">

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="px-4 py-1.5 text-sm rounded-full border-muted-foreground/20 bg-muted/50 text-foreground mb-4 font-normal">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                v0.1 Early Access
              </span>
            </Badge>
          </motion.div>

          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-2 p-4 bg-primary/5 rounded-2xl"
          >
            <Package className="w-16 h-16 text-primary stroke-[1.5]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl max-w-4xl text-foreground"
          >
            Gestión simple para <br />
            negocios modernos.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto max-w-[600px] text-muted-foreground md:text-xl font-light"
          >
            Punto de venta, control de inventario y facturación en una plataforma minimalista que evoluciona con vos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4"
          >
            <Button size="lg" className="h-12 px-8 text-base rounded-full" asChild>
              <Link href="/register">
                Comenzar gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="ghost" className="h-12 px-8 text-base rounded-full" asChild>
              <Link href="/login">
                Ya tengo cuenta
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="pt-8 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span>Control de Inventario</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Datos en la Nube</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
