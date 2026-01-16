"use client"

import { motion } from 'framer-motion'
import { Zap, Bell, FileText, BarChart3, ArrowUpRight, Search, ScanBarcode } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function LandingFeatures() {
  return (
    <section className="w-full py-24 bg-muted/30">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <Badge variant="outline" className="text-sm py-1 px-4 border-primary/30 bg-primary/5 text-primary">
            Todo incluido
          </Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Todo lo que necesitas para crecer
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Dejá de usar Excel y papeles sueltos. Centralizá tu operación en una sola plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Feature 1: POS (Large) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 row-span-2"
          >
            <Card className="h-full bg-background/60 backdrop-blur border-primary/10 hover:border-primary/30 transition-all overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Zap className="w-6 h-6 text-primary" />
                  Punto de Venta Veloz
                </CardTitle>
                <p className="text-muted-foreground">
                  Diseñado para cajeros. Búsqueda instantánea, atajos de teclado y escáner de barras. Ventas en segundos.
                </p>
              </CardHeader>
              <CardContent className="mt-4 relative h-64 overflow-hidden">
                {/* CSS Illustration of POS */}
                <div className="absolute top-4 left-6 right-6 bottom-0 bg-background border rounded-t-xl shadow-lg p-4 flex flex-col gap-3">
                  <div className="flex gap-2 mb-2">
                    <div className="h-8 w-full bg-muted/50 rounded flex items-center px-3 text-xs text-muted-foreground border">
                      <Search className="w-3 h-3 mr-2" /> Buscar producto...
                    </div>
                    <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center text-primary">
                      <ScanBarcode className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex justify-between items-center p-2 rounded bg-muted/50 border">
                        <div className="flex flex-col gap-1">
                          <div className="h-3 w-24 bg-muted-foreground/20 rounded" />
                          <div className="h-2 w-12 bg-muted-foreground/10 rounded" />
                        </div>
                        <div className="h-4 w-12 bg-muted-foreground/20 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto bg-primary text-primary-foreground p-3 rounded text-center font-bold shadow-md">
                    Cobra $ 12.500
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Feature 2: Stock (Small) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1"
          >
            <Card className="h-full bg-background/60 backdrop-blur border-primary/10 hover:border-primary/30 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Bell className="w-5 h-5 text-warning" />
                  Alertas de Stock
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Evitá quiebres de stock. Recibí notificaciones automáticas cuando un producto se esté agotando.
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
                  <div className="text-sm font-medium text-warning">
                    Coca Cola Zero (Bajo stock: 3)
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Feature 3: Reports (Small) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1"
          >
            <Card className="h-full bg-background/60 backdrop-blur border-primary/10 hover:border-primary/30 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Métricas Reales
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Tomá decisiones basadas en datos. Ventas por día, productos más vendidos y rentabilidad.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-end gap-1 h-16 w-full justify-around px-2">
                  <div className="w-4 bg-primary/20 rounded-t h-[40%]" />
                  <div className="w-4 bg-primary/40 rounded-t h-[70%]" />
                  <div className="w-4 bg-primary rounded-t h-[50%]" />
                  <div className="w-4 bg-primary/80 rounded-t h-[90%]" />
                  <div className="w-4 bg-primary/30 rounded-t h-[60%]" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Feature 4: Invoicing (Wide) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-3"
          >
            <Card className="bg-background/60 backdrop-blur border-primary/10 hover:border-primary/30 transition-all flex flex-col md:flex-row overflow-hidden group">
              <div className="p-6 md:w-1/2 flex flex-col justify-center">
                <CardTitle className="flex items-center gap-2 text-xl mb-2">
                  <FileText className="w-5 h-5 text-success" />
                  Facturación Simple
                </CardTitle>
                <p className="text-muted-foreground mb-4">
                  Generá comprobantes PDF profesionales, gestioná diferentes alícuotas de IVA y exportá todo para tu contador en un clic.
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">IVA Configurable</Badge>
                  <Badge variant="secondary">Exportación Excel</Badge>
                </div>
              </div>
              <div className="bg-muted/50 md:w-1/2 p-6 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-grid-black/[0.05] dark:bg-grid-white/[0.05]" />
                <div className="w-32 h-40 bg-card border shadow-sm rotate-3 group-hover:rotate-0 transition-transform origin-bottom-right p-3 flex flex-col gap-2 text-[8px] text-muted-foreground">
                  <div className="h-2 w-12 bg-muted rounded mb-1" />
                  <div className="space-y-1">
                    <div className="h-1 w-full bg-muted/50 rounded" />
                    <div className="h-1 w-full bg-muted/50 rounded" />
                    <div className="h-1 w-20 bg-muted/50 rounded" />
                  </div>
                  <div className="mt-auto pt-2 border-t flex justify-between font-bold text-foreground">
                    <span>Total</span>
                    <span>$ 4.500</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

import { Badge } from '@/components/ui/badge'
