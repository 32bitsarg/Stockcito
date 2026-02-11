"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md py-4 border-b border-zinc-100 dark:border-zinc-900" : "bg-transparent py-8"
    )}>
      <div className="container mx-auto px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 border border-zinc-100 dark:border-zinc-900 flex items-center justify-center p-1.5 grayscale hover:grayscale-0 transition-all duration-500">
            <img src="/icons/icon.svg" alt="Stockcito Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter uppercase italic leading-none">Stockcito</span>
            <span className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-500 mt-1 italic">Gestión en la Nube</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-12">
          <Link href="/docs" className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Docs</Link>
          <Link href="/changelog" className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Updates</Link>

          <div className="w-px h-4 bg-zinc-100 dark:bg-zinc-800" />

          <Link href="/login" className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white hover:opacity-70 transition-opacity">Ingreso</Link>
          <Link href="/register" className="text-[9px] font-black uppercase tracking-[0.3em] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-none transition-transform hover:scale-105">Desplegar</Link>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Placeholder */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900 p-8 flex flex-col gap-6 md:hidden shadow-2xl"
          >
            <Link href="/docs" onClick={() => setMobileMenuOpen(false)} className="text-[10px] font-black uppercase tracking-[0.4em]">Documentación</Link>
            <Link href="/changelog" onClick={() => setMobileMenuOpen(false)} className="text-[10px] font-black uppercase tracking-[0.4em]">Actualizaciones</Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-[10px] font-black uppercase tracking-[0.4em]">Acceso Terminal</Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="text-[10px] font-black uppercase tracking-[0.4em] bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 p-4 text-center">Iniciar Despliegue</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
