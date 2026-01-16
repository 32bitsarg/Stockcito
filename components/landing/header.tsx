"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Menu, LogIn, BookOpen } from 'lucide-react'

export function LandingHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="w-full py-4 px-6 md:px-12 flex items-center justify-between z-20">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">S</div>
          <div>
            <div className="text-lg font-extrabold">Stockcito</div>
            <div className="text-xs text-muted-foreground">POS · Inventario · Facturación</div>
          </div>
        </Link>
      </div>

      <nav className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-4">
          <Link href="/" className="text-sm hover:underline">Inicio</Link>
          <Link href="/docs" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <BookOpen className="w-4 h-4" />
            Documentación
          </Link>
          <Link href="/sales/new" className="text-sm">Ir al POS</Link>
          <Link href="/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-muted-foreground/80"><LogIn className="w-4 h-4" />Ingresar</Link>
          <Link href="/register" className="rounded-md bg-primary px-4 py-2 text-sm text-white shadow">Probar gratis</Link>
        </div>

        <button className="md:hidden p-2 rounded-md" aria-label="menu" onClick={() => setOpen(!open)}>
          <Menu className="h-5 w-5" />
        </button>
      </nav>

      {open && (
        <div className="absolute right-4 top-16 w-48 bg-popover rounded-md shadow-md p-3 md:hidden">
          <nav className="flex flex-col gap-2">
            <Link href="/docs" className="text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Documentación
            </Link>
            <Link href="/sales/new" className="text-sm">Ir al POS</Link>
            <Link href="/login" className="text-sm">Ingresar</Link>
            <Link href="/register" className="text-sm">Registrarse</Link>
          </nav>
        </div>
      )}
    </header>
  )
}
