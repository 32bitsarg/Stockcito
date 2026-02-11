"use client"

import Link from 'next/link'
import { APP_VERSION_DISPLAY } from '@/lib/changelog'

export function LandingFooter() {
  return (
    <footer className="bg-white dark:bg-zinc-950 py-20 border-t border-zinc-50 dark:border-zinc-900">
      <div className="container mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 border-b border-zinc-50 dark:border-zinc-900 pb-16">
          <div className="space-y-4">
            <span className="text-xl font-black tracking-tighter uppercase italic leading-none">Stockcito</span>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 max-w-xs leading-relaxed italic">
              Un sistema operativo moderno para nodos comerciales argentinos. Diseñado para velocidad y fiabilidad.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-16">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em]">Infraestructura</h4>
              <ul className="space-y-3">
                <li><Link href="/docs" className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors italic">Documentación</Link></li>
                <li><Link href="/changelog" className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors italic">Actualizaciones</Link></li>
                <li><Link href="/api" className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors italic">Acceso API</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em]">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors italic">Privacidad</Link></li>
                <li><Link href="/terms" className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors italic">Términos</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">
            © 2026 Stockcito Node Systems
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[12px] font-black tracking-tighter italic leading-none">{APP_VERSION_DISPLAY}</span>
              <span className="text-[7px] font-black uppercase tracking-[0.2em] opacity-30">Production Alpha</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
