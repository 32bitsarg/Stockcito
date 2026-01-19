"use client"

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { APP_VERSION_DISPLAY } from '@/lib/changelog'

export function LandingFooter() {
  return (
    <footer className="w-full border-t mt-12 py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-0 grid md:grid-cols-3 gap-6 items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg">Stockcito</span>
            <Badge variant="outline" className="text-[10px]">{APP_VERSION_DISPLAY}</Badge>
          </div>
          <div className="text-sm text-muted-foreground mt-2">POS · Inventario · Facturación</div>
          <div className="text-xs text-muted-foreground mt-2">Sistema de punto de venta para PyMEs argentinas</div>
        </div>

        <div className="flex gap-8">
          <div>
            <div className="font-semibold">Producto</div>
            <nav className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/sales/new">POS</Link>
              <Link href="/inventory">Inventario</Link>
              <Link href="/reports">Reportes</Link>
              <Link href="/subscription/upgrade">Planes</Link>
            </nav>
          </div>

          <div>
            <div className="font-semibold">Empresa</div>
            <nav className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/">Inicio</Link>
              <Link href="/login">Ingresar</Link>
              <Link href="/register">Registrarse</Link>
              <Link href="/docs">Documentación</Link>
              <Link href="/changelog">Changelog</Link>
            </nav>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Stockcito</p>
          <p className="text-xs mt-1">Diseñado para comercios locales</p>
          <p className="text-xs mt-2">
            Pagos procesados por{' '}
            <a href="https://www.mercadopago.com.ar" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              MercadoPago
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
