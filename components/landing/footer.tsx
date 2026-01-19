"use client"

import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { APP_VERSION_DISPLAY, FEEDBACK_EMAIL } from '@/lib/changelog'

export function LandingFooter() {
  return (
    <footer className="w-full border-t mt-12">
      {/* Feedback CTA Section - Prominent */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold mb-1">¿Tenés sugerencias o encontraste un bug?</h3>
              <p className="text-sm text-muted-foreground">
                Tu feedback nos ayuda a mejorar Stockcito. ¡Escribinos!
              </p>
            </div>
            <a
              href={`mailto:${FEEDBACK_EMAIL}?subject=Feedback%20-%20Stockcito`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all duration-200"
            >
              <Mail className="w-5 h-5" />
              Escribinos
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid md:grid-cols-4 gap-8 items-start">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg">Stockcito</span>
              <Badge variant="outline" className="text-[10px]">{APP_VERSION_DISPLAY}</Badge>
            </div>
            <div className="text-sm text-muted-foreground mt-2">POS · Inventario · Facturación</div>
            <div className="text-xs text-muted-foreground mt-2">Sistema de punto de venta para PyMEs argentinas</div>
          </div>

          {/* Producto */}
          <div>
            <div className="font-semibold">Producto</div>
            <nav className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/sales/new" className="hover:text-foreground transition-colors">POS</Link>
              <Link href="/inventory" className="hover:text-foreground transition-colors">Inventario</Link>
              <Link href="/reports" className="hover:text-foreground transition-colors">Reportes</Link>
              <Link href="/subscription/upgrade" className="hover:text-foreground transition-colors">Planes</Link>
            </nav>
          </div>

          {/* Empresa */}
          <div>
            <div className="font-semibold">Empresa</div>
            <nav className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
              <Link href="/login" className="hover:text-foreground transition-colors">Ingresar</Link>
              <Link href="/register" className="hover:text-foreground transition-colors">Registrarse</Link>
              <Link href="/docs" className="hover:text-foreground transition-colors">Documentación</Link>
              <Link href="/changelog" className="hover:text-foreground transition-colors">Changelog</Link>
            </nav>
          </div>

          {/* Contacto */}
          <div>
            <div className="font-semibold">Contacto</div>
            <div className="mt-2 space-y-3">
              <a
                href={`mailto:${FEEDBACK_EMAIL}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-4 h-4" />
                {FEEDBACK_EMAIL}
              </a>
              <p className="text-xs text-muted-foreground">
                Respondemos en 24-48hs hábiles
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 mt-8 pt-6 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Stockcito. Diseñado para comercios locales.</p>
            <p className="text-xs">
              Pagos procesados por{' '}
              <a href="https://www.mercadopago.com.ar" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                MercadoPago
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
