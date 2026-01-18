"use client"

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollText, Sparkles, Bug, Rocket, Zap, ArrowLeft, ChevronDown, ChevronRight, Calendar, Tag } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Changelog entries - Add new entries at the top
const changelogEntries = [
    {
        version: '0.1.0',
        date: '2026-01-17',
        title: 'Lanzamiento Inicial 🎉',
        description: 'Primera versión pública de Stockcito',
        changes: [
            {
                type: 'new',
                title: 'Sistema POS completo',
                description: 'Punto de venta con soporte para productos, clientes y múltiples métodos de pago'
            },
            {
                type: 'new',
                title: 'Gestión de inventario',
                description: 'Control de stock con alertas de bajo inventario y categorización de productos'
            },
            {
                type: 'new',
                title: 'Módulo de clientes',
                description: 'Registro y seguimiento de clientes con historial de compras'
            },
            {
                type: 'new',
                title: 'Reportes y analytics',
                description: 'Dashboard con métricas de ventas, productos más vendidos y tendencias'
            },
            {
                type: 'new',
                title: 'Sistema de suscripciones',
                description: 'Planes Free y Premium con integración de MercadoPago'
            },
            {
                type: 'new',
                title: 'Modo restaurante',
                description: 'Funcionalidades específicas para restaurantes: cocina y gestión de mesas'
            },
            {
                type: 'new',
                title: 'Control de usuarios',
                description: 'Roles (owner, admin, manager, cashier) con permisos diferenciados'
            },
            {
                type: 'improvement',
                title: 'Diseño responsive',
                description: 'Interfaz adaptada para desktop, tablet y móvil'
            },
            {
                type: 'improvement',
                title: 'Tema oscuro/claro',
                description: 'Soporte completo para modo oscuro con cambio automático'
            },
        ]
    },
]

const typeConfig = {
    new: {
        icon: Rocket,
        label: 'Nuevo',
        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        dotColor: 'bg-emerald-500'
    },
    improvement: {
        icon: Sparkles,
        label: 'Mejora',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        dotColor: 'bg-blue-500'
    },
    fix: {
        icon: Bug,
        label: 'Corrección',
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        dotColor: 'bg-amber-500'
    },
    performance: {
        icon: Zap,
        label: 'Rendimiento',
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        dotColor: 'bg-purple-500'
    }
}

// Group changes by type
function groupChangesByType(changes: typeof changelogEntries[0]['changes']) {
    const groups: Record<string, typeof changes> = {}
    changes.forEach(change => {
        if (!groups[change.type]) {
            groups[change.type] = []
        }
        groups[change.type].push(change)
    })
    return groups
}

export default function ChangelogPage() {
    const [selectedVersion, setSelectedVersion] = useState(changelogEntries[0]?.version || '')
    const [expandedTypes, setExpandedTypes] = useState<string[]>(['new', 'improvement', 'fix', 'performance'])

    const selectedEntry = changelogEntries.find(e => e.version === selectedVersion)
    const groupedChanges = selectedEntry ? groupChangesByType(selectedEntry.changes) : {}

    const toggleType = (type: string) => {
        setExpandedTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        )
    }

    const stats = selectedEntry ? {
        new: selectedEntry.changes.filter(c => c.type === 'new').length,
        improvement: selectedEntry.changes.filter(c => c.type === 'improvement').length,
        fix: selectedEntry.changes.filter(c => c.type === 'fix').length,
        performance: selectedEntry.changes.filter(c => c.type === 'performance').length,
    } : { new: 0, improvement: 0, fix: 0, performance: 0 }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Header */}
            <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="w-full px-6 lg:px-12 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/" className="flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Volver
                                </Link>
                            </Button>
                            <div className="h-6 w-px bg-border hidden sm:block" />
                            <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                                <ScrollText className="w-4 h-4" />
                                <span className="font-medium">Changelog</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/docs">Ver Documentación</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-6 lg:px-12 py-8">
                {/* Hero - Compact */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-4">
                            <ScrollText className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">Historial de cambios</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-2">
                            ¿Qué hay de nuevo?
                        </h1>
                        <p className="text-muted-foreground max-w-xl">
                            Todas las actualizaciones, mejoras y correcciones de Stockcito.
                        </p>
                    </div>

                    {/* Version Selector - Desktop */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {changelogEntries.map((entry) => (
                            <button
                                key={entry.version}
                                onClick={() => setSelectedVersion(entry.version)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    selectedVersion === entry.version
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                                )}
                            >
                                v{entry.version}
                            </button>
                        ))}
                    </div>
                </div>

                {selectedEntry && (
                    <>
                        {/* Version Info Bar */}
                        <Card className="mb-6 bg-gradient-to-r from-primary/5 via-transparent to-transparent border-primary/20">
                            <CardContent className="py-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-mono font-bold">v{selectedEntry.version}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm">
                                                {new Date(selectedEntry.date).toLocaleDateString('es-AR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {stats.new > 0 && (
                                            <Badge className={typeConfig.new.className}>
                                                <Rocket className="w-3 h-3 mr-1" />
                                                {stats.new} nuevos
                                            </Badge>
                                        )}
                                        {stats.improvement > 0 && (
                                            <Badge className={typeConfig.improvement.className}>
                                                <Sparkles className="w-3 h-3 mr-1" />
                                                {stats.improvement} mejoras
                                            </Badge>
                                        )}
                                        {stats.fix > 0 && (
                                            <Badge className={typeConfig.fix.className}>
                                                <Bug className="w-3 h-3 mr-1" />
                                                {stats.fix} correcciones
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Title & Description */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-2">{selectedEntry.title}</h2>
                            <p className="text-muted-foreground">{selectedEntry.description}</p>
                        </div>

                        {/* Changes Grid - Collapsible by Type */}
                        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                            {(['new', 'improvement', 'fix', 'performance'] as const).map((type) => {
                                const changes = groupedChanges[type]
                                if (!changes || changes.length === 0) return null

                                const config = typeConfig[type]
                                const Icon = config.icon
                                const isExpanded = expandedTypes.includes(type)

                                return (
                                    <Card key={type} className="overflow-hidden">
                                        <button
                                            onClick={() => toggleType(type)}
                                            className="w-full text-left"
                                        >
                                            <CardHeader className="pb-3 hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("p-2 rounded-lg", config.className)}>
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-base">{config.label}</CardTitle>
                                                            <CardDescription>{changes.length} cambios</CardDescription>
                                                        </div>
                                                    </div>
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </CardHeader>
                                        </button>

                                        {isExpanded && (
                                            <CardContent className="pt-0">
                                                <div className="space-y-3">
                                                    {changes.map((change, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                                        >
                                                            <div className={cn("w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0", config.dotColor)} />
                                                            <div>
                                                                <p className="font-medium text-sm">{change.title}</p>
                                                                <p className="text-xs text-muted-foreground mt-0.5">{change.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                )
                            })}
                        </div>

                        {/* All versions summary - for quick navigation when there are many */}
                        {changelogEntries.length > 1 && (
                            <div className="mt-12 pt-8 border-t">
                                <h3 className="text-lg font-semibold mb-4">Versiones anteriores</h3>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    {changelogEntries.filter(e => e.version !== selectedVersion).map((entry) => (
                                        <button
                                            key={entry.version}
                                            onClick={() => setSelectedVersion(entry.version)}
                                            className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline" className="font-mono">v{entry.version}</Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(entry.date).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium truncate">{entry.title}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Empty state */}
                {!selectedEntry && (
                    <Card className="py-12">
                        <CardContent className="text-center">
                            <ScrollText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No hay cambios registrados</h3>
                            <p className="text-muted-foreground">Volvé pronto para ver las novedades.</p>
                        </CardContent>
                    </Card>
                )}

                {/* Footer CTA */}
                <div className="mt-12 flex flex-col items-center justify-center gap-4 py-8 border-t">
                    <p className="text-muted-foreground text-sm">¿Tenés sugerencias o encontraste un bug?</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Button size="sm" asChild>
                            <a href="mailto:noreply@stockcito.com?subject=Feedback%20-%20Stockcito">
                                ✉️ Escribinos
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/">Volver al Inicio</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/docs">Ver Documentación</Link>
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        <a href="mailto:noreply@stockcito.com" className="hover:text-foreground transition-colors">
                            noreply@stockcito.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
