"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Keyboard, FileText, Download, Shield } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

const shortcuts = [
    { category: 'Navegación', items: [
        { keys: ['/', 'Ctrl+K'], desc: 'Búsqueda rápida de productos' },
        { keys: ['Ctrl+D'], desc: 'Ir al Dashboard' },
        { keys: ['Ctrl+J'], desc: 'Ir a Nueva Venta (POS)' },
        { keys: ['Ctrl+I'], desc: 'Ir a Inventario' },
        { keys: ['Ctrl+L'], desc: 'Ir a Clientes' },
        { keys: ['Ctrl+R'], desc: 'Ir a Reportes' },
        { keys: ['Ctrl+U'], desc: 'Ir a Usuarios' },
        { keys: ['?'], desc: 'Abrir esta ayuda' },
    ]},
    { category: 'En el POS', items: [
        { keys: ['Enter'], desc: 'Agregar producto al carrito' },
        { keys: ['↑ / ↓'], desc: 'Navegar resultados' },
        { keys: ['F2'], desc: 'Finalizar venta' },
        { keys: ['F4'], desc: 'Cancelar venta' },
        { keys: ['Esc'], desc: 'Cerrar búsqueda' },
    ]},
]

const quickTips = [
    { icon: FileText, title: 'Precios netos', desc: 'Los precios se almacenan sin IVA. El impuesto se calcula automáticamente.' },
    { icon: Download, title: 'Exportar datos', desc: 'Desde Reportes podés exportar a CSV o Excel.' },
    { icon: Shield, title: 'Roles de usuario', desc: 'Admin, Cajero y Visor tienen diferentes permisos.' },
]

interface HelpDialogContentProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function HelpDialogContent({ open, onOpenChange }: HelpDialogContentProps) {
    return (
        <Dialog open={open} onOpenChange={(details) => onOpenChange(details.open)}>
            <DialogContent className="max-w-2xl max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="h-5 w-5 text-primary" />
                        Atajos de teclado y ayuda
                    </DialogTitle>
                </DialogHeader>
                
                <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-6">
                        {/* Shortcuts */}
                        {shortcuts.map((section, i) => (
                            <div key={i}>
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                                    {section.category}
                                </h3>
                                <div className="space-y-2">
                                    {section.items.map((item, j) => (
                                        <div key={j} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                            <span className="text-sm">{item.desc}</span>
                                            <div className="flex gap-1">
                                                {item.keys.map((key, k) => (
                                                    <kbd key={k} className="px-2 py-1 bg-background border rounded text-xs font-mono">
                                                        {key}
                                                    </kbd>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Quick Tips */}
                        <div>
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                                Tips rápidos
                            </h3>
                            <div className="grid gap-3">
                                {quickTips.map((tip, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <tip.icon className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{tip.title}</p>
                                            <p className="text-xs text-muted-foreground">{tip.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Link to full docs */}
                        <div className="pt-4 border-t">
                            <a 
                                href="/docs" 
                                target="_blank"
                                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                                Ver documentación completa →
                            </a>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
