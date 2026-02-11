"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Keyboard, Zap, FileText, Download, Shield, ArrowLeft,
  ExternalLink, Menu, X, Search, ChevronRight, Users, LayoutGrid
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { APP_VERSION_DISPLAY } from '@/lib/changelog'

const sections = [
  { id: 'intro', title: 'Introducción' },
  { id: 'shortcuts', title: 'Atajos de Teclado' },
  { id: 'features', title: 'Funcionalidades' },
  { id: 'tables', title: 'Gestión de Mesas' },
  { id: 'roles', title: 'Roles y Permisos' },
  { id: 'faq', title: 'Preguntas Frecuentes' },
]

const shortcuts = [
  { keys: ['/', 'Ctrl+K'], desc: 'BÚSQUEDA GLOBAL' },
  { keys: ['Ctrl+J'], desc: 'NUEVA VENTA' },
  { keys: ['F2'], desc: 'FINALIZAR VENTA' },
  { keys: ['F4'], desc: 'CANCELAR VENTA' },
  { keys: ['Ctrl+D'], desc: 'IR AL DASHBOARD' },
  { keys: ['Ctrl+I'], desc: 'IR A INVENTARIO' },
  { keys: ['Ctrl+L'], desc: 'IR A CLIENTES' },
  { keys: ['Ctrl+R'], desc: 'IR A REPORTES' },
  { keys: ['Ctrl+U'], desc: 'IR A USUARIOS' },
  { keys: ['Esc'], desc: 'CERRAR MODAL / VOLVER' },
  { keys: ['Shift+?'], desc: 'VER AYUDA' },
]

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('intro')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Handle scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100
      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveSection(section.id)
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      window.scrollTo({ top: element.offsetTop - 80, behavior: 'smooth' })
      setActiveSection(id)
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900">
      {/* Grid Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-zinc-100 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex flex-col group">
            <span className="text-xl font-black tracking-tighter uppercase italic leading-none group-hover:tracking-widest transition-all duration-500">Stockcito</span>
            <span className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-500 mt-1 italic">Guía de Ayuda</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-1 h-1 bg-zinc-900 dark:bg-white animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">v{APP_VERSION_DISPLAY}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="text-[9px] font-black uppercase tracking-[0.3em] hover:text-zinc-500 transition-colors">Ingreso</Link>
          <Link href="/register" className="h-9 px-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center text-[9px] font-black uppercase tracking-[0.3em] hover:opacity-90 transition-opacity">
            Desplegar
          </Link>
          <button
            className="md:hidden p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex pt-16 min-h-screen relative z-10">
        {/* Sidebar Navigation */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-900 transform transition-transform duration-500 ease-in-out md:translate-x-0 pt-16",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="h-full flex flex-col p-8">
            <div className="mb-12 relative group">
              <label className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2 block italic">Buscador</label>
              <div className="relative">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
                <Input
                  placeholder="BUSCAR EN LA GUÍA..."
                  className="pl-8 h-10 bg-transparent border-0 border-b border-zinc-100 dark:border-zinc-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-zinc-900 dark:focus-visible:border-white transition-all font-bold uppercase text-[10px] tracking-widest placeholder:text-zinc-200 dark:placeholder:text-zinc-800"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <nav className="space-y-6">
              <span className="text-[7px] font-black uppercase tracking-[0.5em] text-zinc-500 italic block border-b border-zinc-50 dark:border-zinc-900 pb-2">Contenido</span>
              <div className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "w-full flex items-center justify-between py-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all italic",
                      activeSection === section.id
                        ? "text-zinc-900 dark:text-white translate-x-2"
                        : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:translate-x-1"
                    )}
                  >
                    <span>{section.title}</span>
                    {activeSection === section.id && <div className="w-1.5 h-1.5 bg-zinc-900 dark:bg-white" />}
                  </button>
                ))}
              </div>
            </nav>

            <div className="mt-auto pt-8 border-t border-zinc-50 dark:border-zinc-900">
              <span className="text-[7px] font-black uppercase tracking-[0.5em] text-zinc-500 italic block mb-4">Enlaces Rápidos</span>
              <Link href="/sales/new" className="flex items-center justify-between group">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Terminal POS</span>
                <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-72 w-full max-w-4xl mx-auto px-12 py-20 space-y-32">

          {/* Intro */}
          <section id="intro" className="scroll-mt-32 space-y-12">
            <div className="space-y-4">
              <div className="w-12 h-px bg-zinc-900 dark:bg-white mb-8" />
              <h1 className="text-6xl lg:text-7xl font-black tracking-tighter uppercase italic leading-none">Ayuda para el <br /> Usuario</h1>
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-zinc-500 leading-relaxed italic max-w-2xl">
                Guía completa para la configuración y el uso diario de Stockcito en tu negocio.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 pt-8">
              <div className="p-8 border border-zinc-100 dark:border-zinc-900 group hover:border-zinc-900 dark:hover:border-white transition-colors">
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400 italic mb-4 block">Paso 01</span>
                <h3 className="text-[14px] font-black uppercase tracking-[0.2em] mb-4 italic">Primeros Pasos</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-8 italic leading-relaxed">Configurá tu negocio y productos en pocos minutos de forma guiada.</p>
                <div className="h-px w-full bg-zinc-50 dark:bg-zinc-900 mb-4" />
                <button className="text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2 group-hover:gap-4 transition-all">
                  Ver Tutorial <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
              <div className="p-8 border border-zinc-100 dark:border-zinc-900 group hover:border-zinc-900 dark:hover:border-white transition-colors">
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400 italic mb-4 block">Acceso Móvil</span>
                <h3 className="text-[14px] font-black uppercase tracking-[0.2em] mb-4 italic">Descargar App</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-8 italic leading-relaxed">Stockcito se instala como una aplicación en tu celular para mayor comodidad.</p>
                <div className="h-px w-full bg-zinc-50 dark:bg-zinc-900 mb-4" />
                <button className="text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2 group-hover:gap-4 transition-all">
                  Instalar App <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Shortcuts */}
          <section id="shortcuts" className="scroll-mt-32 space-y-12">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 italic">Agilidad en Caja</span>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Atajos Rápidos</h2>
              <div className="h-px w-20 bg-zinc-900 dark:bg-white" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900">
              {shortcuts.map((shortcut, i) => (
                <div key={i} className="bg-white dark:bg-zinc-950 p-6 flex flex-col justify-between gap-6 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] italic text-zinc-500">{shortcut.desc}</span>
                  <div className="flex gap-2">
                    {shortcut.keys.map((key, j) => (
                      <kbd key={j} className="h-7 px-3 flex items-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[9px] font-mono font-bold tracking-widest uppercase">
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section id="features" className="scroll-mt-32 space-y-12">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 italic">Gestión de Negocio</span>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Funciones de Stockcito</h2>
              <div className="h-px w-20 bg-zinc-900 dark:bg-white" />
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 border border-zinc-100 dark:border-zinc-900 flex items-center justify-center italic font-black text-xl italic select-none">F</div>
                  <h3 className="text-[16px] font-black uppercase tracking-[0.2em] italic">Facturación Fiscal</h3>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500 leading-relaxed italic border-l-2 border-zinc-100 dark:border-zinc-800 pl-6">
                  Emisión de comprobantes A, B y C integrados con AFIP.
                  Generación de factura electrónica y envío por email.
                </p>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 border border-zinc-100 dark:border-zinc-900 flex items-center justify-center italic font-black text-xl italic select-none">R</div>
                  <h3 className="text-[16px] font-black uppercase tracking-[0.2em] italic">Reportes & Export</h3>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500 leading-relaxed italic border-l-2 border-zinc-100 dark:border-zinc-800 pl-6">
                  Propiedad absoluta de datos. Exportación masiva de caja, inventario y
                  analítica comercial a formatos crudos (.XLSX / .CSV).
                </p>
              </div>
            </div>
          </section>

          {/* Tables Management */}
          <section id="tables" className="scroll-mt-32 space-y-12">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 italic">Organización</span>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Control de Mesas</h2>
              <div className="h-px w-20 bg-zinc-900 dark:bg-white" />
            </div>

            <div className="border border-zinc-100 dark:border-zinc-800 p-12 space-y-12">
              <div className="grid gap-8">
                <div className="space-y-6">
                  <span className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-500 italic border-b border-zinc-100 dark:border-zinc-800 pb-2 block w-max">Estados de las Mesas</span>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Libre</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Ocupada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Reservada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Servicio</span>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase tracking-widest italic border-l-2 border-zinc-900 dark:border-white pl-4">Sector Gastronomía</h4>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 italic leading-relaxed">
                      Asignación de pedidos a mesas o sectores, y gestión de reservas por horario.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase tracking-widest italic border-l-2 border-zinc-900 dark:border-white pl-4">Mapeo Dinámico</h4>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 italic leading-relaxed">
                      Configuración visual de tu local para ver el estado de cada mesa de forma rápida.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Roles y Permisos */}
          <section id="roles" className="scroll-mt-32 space-y-12">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 italic">Equipo de Trabajo</span>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Roles y Permisos</h2>
              <div className="h-px w-20 bg-zinc-900 dark:bg-white" />
            </div>

            <div className="border border-zinc-100 dark:border-zinc-900 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                  <tr>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest italic">Rol</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest italic text-center">Protocolo</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest italic text-right">Restricciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {[
                    { r: 'Owner', p: 'Acceso Total', re: 'Ninguna' },
                    { r: 'Admin', p: 'Config/Usuarios', re: 'Borrado de Base' },
                    { r: 'Manager', p: 'Inventario/Caja', re: 'Config Crítica' },
                    { r: 'Cajero', p: 'Operativa POS', re: 'Historial Global' },
                    { r: 'Mozo', p: 'Mesas/Pedidos', re: 'Sin Cobro' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white italic">{row.r}</td>
                      <td className="p-6 text-[9px] font-bold uppercase tracking-widest text-zinc-500 italic text-center">{row.p}</td>
                      <td className="p-6 text-[9px] font-bold uppercase tracking-widest text-zinc-400 italic text-right">{row.re}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-32 space-y-12 pb-32">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 italic">Consultas Frecuentes</span>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Centro de Ayuda</h2>
              <div className="h-px w-20 bg-zinc-900 dark:bg-white" />
            </div>

            <div className="grid gap-12">
              {[
                { q: "¿FUNCIONA SIN INTERNET?", a: "SÍ. Stockcito permite cobrar localmente y sincroniza tus datos cuando vuelve la conexión." },
                { q: "¿LÍMITE DE EMPLEADOS?", a: "SIN LÍMITE. Podés crear usuarios para todo tu personal con diferentes permisos." },
                { q: "¿MIS DATOS ESTÁN SEGUROS?", a: "COMPLETAMENTE. Usamos seguridad de alto nivel y hacemos copias automáticas diarias." }
              ].map((faq, i) => (
                <div key={i} className="space-y-4 border-l-2 border-zinc-100 dark:border-zinc-900 pl-8 hover:border-zinc-900 dark:hover:border-white transition-all cursor-default group">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.2em] italic group-hover:tracking-[0.3em] transition-all">{faq.q}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 italic leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>

      {/* Footer Navigation (Mobile Only) */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-14 h-14 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-2xl"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
    </div>
  )
}
