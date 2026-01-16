"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Keyboard, Zap, FileText, Download, Shield, ArrowLeft,
  ExternalLink, Menu, X, Search, ChevronRight, Users, LayoutGrid
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const sections = [
  { id: 'intro', title: 'Introducción' },
  { id: 'shortcuts', title: 'Atajos de Teclado' },
  { id: 'features', title: 'Funcionalidades' },
  { id: 'tables', title: 'Gestión de Mesas' },
  { id: 'roles', title: 'Roles y Permisos' },
  { id: 'faq', title: 'Preguntas Frecuentes' },
]

const shortcuts = [
  { keys: ['/', 'Ctrl+K'], desc: 'Búsqueda global' },
  { keys: ['Ctrl+J'], desc: 'Nueva Venta' },
  { keys: ['F2'], desc: 'Finalizar venta' },
  { keys: ['F4'], desc: 'Cancelar venta' },
  { keys: ['Ctrl+D'], desc: 'Ir al Dashboard' },
  { keys: ['Ctrl+I'], desc: 'Ir a Inventario' },
  { keys: ['Ctrl+L'], desc: 'Ir a Clientes' },
  { keys: ['Ctrl+R'], desc: 'Ir a Reportes' },
  { keys: ['Ctrl+U'], desc: 'Ir a Usuarios' },
  { keys: ['Esc'], desc: 'Cerrar modal / Volver' },
  { keys: ['Shift+?'], desc: 'Ver ayuda' },
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 border-b bg-background/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden p-2 -ml-2 hover:bg-muted rounded-md"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Zap className="w-5 h-5 text-primary fill-current" />
            Stockcito
          </Link>
          <Badge variant="secondary" className="hidden sm:flex text-[10px] h-5 px-1.5">v0.1</Badge>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="hidden sm:flex">Ingresar</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Empezar Gratis</Button>
          </Link>
        </div>
      </header>

      <div className="flex pt-16 min-h-screen">
        {/* Sidebar Navigation */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 pt-16",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="h-full overflow-y-auto p-4 py-8">
            <div className="mb-6 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar en docs..."
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    activeSection === section.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <ChevronRight className={cn(
                    "w-4 h-4 transition-transform",
                    activeSection === section.id ? "rotate-90" : ""
                  )} />
                  {section.title}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t">
              <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Recursos
              </h4>
              <Link href="/sales/new" className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                <ExternalLink className="w-4 h-4" />
                Ir al POS
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 space-y-16">

          {/* Intro */}
          <section id="intro" className="scroll-mt-24 space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Documentación</h1>
              <p className="text-xl text-muted-foreground">
                Domina Stockcito para gestionar inventario, ventas y facturación de forma profesional.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Inicio Rápido</h3>
                <p className="text-sm text-muted-foreground mb-4">Configura tu catálogo en menos de 5 minutos e importá tus productos.</p>
                <Button variant="link" className="p-0 h-auto gap-1">Ver tutorial <ArrowLeft className="w-3 h-3 rotate-180" /></Button>
              </div>
              <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-4">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Instalar App</h3>
                <p className="text-sm text-muted-foreground mb-4">Stockcito es una PWA. Instalala en tu celular o PC para acceso offline.</p>
              </div>
            </div>
          </section>

          {/* Shortcuts */}
          <section id="shortcuts" className="scroll-mt-24 pt-8 border-t">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Keyboard className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Atajos de Teclado</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Optimiza tu flujo de trabajo en el POS usando estos accesos rápidos. No necesitas ratón.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shortcuts.map((shortcut, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <span className="text-sm font-medium">{shortcut.desc}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, j) => (
                      <kbd key={j} className="px-2 py-1 bg-background border rounded text-xs font-mono text-foreground font-bold shadow-sm">
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section id="features" className="scroll-mt-24 pt-8 border-t">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Funcionalidades Principales</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" /> Facturación AFIP
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Emisión de facturas A, B y C integradas directamente con AFIP.
                  Generación automática de CAE y envío por correo electrónico al cliente.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-500" /> Reportes & Exportación
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Todos los datos son tuyos. Exportá tus reportes de ventas, caja diaria y
                  movimientos de stock a Excel o CSV cuando quieras.
                </p>
              </div>
            </div>
          </section>

          {/* Tables Management (New) */}
          <section id="tables" className="scroll-mt-24 pt-8 border-t">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Gestión de Mesas</h2>
            </div>
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="p-6 grid gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Estados de Mesa</h3>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">Libre</Badge>
                    <Badge variant="outline" className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">Ocupada</Badge>
                    <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">Reservada</Badge>
                    <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">Limpieza</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Controlá visualmente qué mesas necesitan atención. El tiempo de ocupación se muestra en tiempo real.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Para Restaurantes</h4>
                    <p className="text-xs text-muted-foreground">
                      Asigná pedidos a mesas específicas, dividí cuentas y gestioná reservas con nombre y horario.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Configuración Flexible</h4>
                    <p className="text-xs text-muted-foreground">
                      Creá mesas cuadradas, redondas o rectangulares y organizalas según tu layout físico.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Roles y Permisos (New) */}
          <section id="roles" className="scroll-mt-24 pt-8 border-t">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Roles y Permisos</h2>
            </div>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium">
                  <tr>
                    <th className="p-4">Rol</th>
                    <th className="p-4">Acceso Principal</th>
                    <th className="p-4">Restricciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-4 font-medium">Owner</td>
                    <td className="p-4">Acceso Total</td>
                    <td className="p-4 text-muted-foreground">Ninguna</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Admin</td>
                    <td className="p-4">Configuración, Usuarios, Auditoría</td>
                    <td className="p-4 text-muted-foreground">No puede eliminar el negocio</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Manager</td>
                    <td className="p-4">Reportes, Inventario, Caja</td>
                    <td className="p-4 text-muted-foreground">Sin acceso a configuración sensible</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Cajero</td>
                    <td className="p-4">POS, Apertura/Cierre Caja</td>
                    <td className="p-4 text-muted-foreground">Solo ve sus propias ventas</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Mozo</td>
                    <td className="p-4">Mesas, Comandas</td>
                    <td className="p-4 text-muted-foreground">No cobra, solo carga pedidos</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-24 pt-8 border-t pb-20">
            <h2 className="text-2xl font-bold mb-6">Preguntas Frecuentes</h2>
            <div className="grid gap-4">
              {[
                { q: "¿Puedo usarlo sin internet?", a: "Sí, Stockcito funciona offline y sincroniza tus ventas cuando recuperas la conexión." },
                { q: "¿Cuántos usuarios puedo tener?", a: "Ilimitados. Puedes crear cuentas para todo tu personal sin costo extra." },
                { q: "¿Mis datos están seguros?", a: "Utilizamos encriptación de grado bancario y backups diarios automáticos." }
              ].map((faq, i) => (
                <div key={i} className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>
    </div>
  )
}
