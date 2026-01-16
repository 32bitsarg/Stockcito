"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function LandingCTA() {
  return (
    <section className="w-full py-24 bg-background">
      <div className="container px-4 md:px-6 mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-primary text-primary-foreground overflow-hidden relative"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
            </svg>
          </div>

          <div className="relative z-10 py-16 px-6 md:px-12 md:py-24 text-center space-y-8 flex flex-col items-center">
            <div className="inline-flex items-center rounded-full bg-primary-foreground/10 border border-primary-foreground/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="mr-2 h-4 w-4" />
              Early Access v0.1
            </div>

            <h3 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl max-w-2xl">
              Potenciá tu negocio hoy con Stockcito
            </h3>

            <p className="text-primary-foreground/80 md:text-xl max-w-xl">
              Probá el POS en minutos y empieza a llevar el control real de tu inventario y ventas. Sin tarjetas de crédito.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="h-12 px-8 text-base shadow-lg" asChild>
                <Link href="/register">
                  Comenzar ahora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                <Link href="/login">
                  Ya tengo cuenta
                </Link>
              </Button>
            </div>

            <p className="text-sm text-primary-foreground/60">
              Únete a más de 50 comercios que ya confían en nosotros.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
