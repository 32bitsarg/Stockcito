"use client"

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const testimonials = [
  {
    name: 'Martín Gomez',
    role: 'Dueño de Almacén',
    text: 'Probé muchos sistemas y todos eran complicados. Stockcito es justo lo que necesitaba: rápido y sin vueltas.',
    initials: 'MG'
  },
  {
    name: 'Sofia Rodriguez',
    role: 'Kiosco "El Paso"',
    text: 'Lo uso desde el teléfono para controlar el stock y desde la compu para vender. La sincronización es perfecta.',
    initials: 'SR'
  },
  {
    name: 'Lucas P.',
    role: 'Ferretería Barrial',
    text: 'La función de imprimir tickets fiscales y presupuestos me ordenó el local. El soporte responde al toque.',
    initials: 'LP'
  }
]

export function LandingTestimonials() {
  return (
    <section className="w-full py-24 bg-background">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <Badge variant="secondary" className="text-sm py-1 px-4 bg-primary/5 text-primary border-primary/20">
            Comunidad
          </Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Lo que dicen nuestros <span className="text-primary">Early Adopters</span>
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
            Comercios reales que ya están optimizando su día a día con Stockcito v0.1.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full border-muted/60 shadow-none hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{t.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed italic">
                    "{t.text}"
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
