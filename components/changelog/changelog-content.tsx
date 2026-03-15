"use client"

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollText, Rocket, Sparkles, Bug, Zap, ArrowLeft, ChevronDown, ChevronRight, Calendar, Tag, Mail } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { changelogEntries, FEEDBACK_EMAIL } from '@/lib/changelog'

const typeConfig = {
    new: {
        label: 'Añadido',
        className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: <Sparkles className="w-3 h-3 mr-1.5" />
    },
    improvement: {
        label: 'Mejora',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: <Rocket className="w-3 h-3 mr-1.5" />
    },
    fix: {
        label: 'Corrección',
        className: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
        icon: <Bug className="w-3 h-3 mr-1.5" />
    },
    performance: {
        label: 'Rendimiento',
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        icon: <Zap className="w-3 h-3 mr-1.5" />
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

interface ChangelogContentProps {
    isAuthenticated: boolean
}

export function ChangelogContent({ isAuthenticated }: ChangelogContentProps) {
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

    const backUrl = isAuthenticated ? '/dashboard' : '/'
    const backLabel = isAuthenticated ? 'Volver al panel' : 'Volver al inicio'

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
            {/* Header */}
            <div className="sticky top-0 border-b border-border bg-background/80 backdrop-blur-md z-40">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground -ml-2">
                                <Link href={backUrl}>
                                    <ArrowLeft className="w-4 h-4" />
                                    {backLabel}
                                </Link>
                            </Button>
                            <div className="h-4 w-px bg-border hidden sm:block" />
                            <div className="hidden sm:flex items-center gap-2 text-sm font-medium">
                                <ScrollText className="w-4 h-4 text-primary" />
                                <span>Novedades</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/docs">Documentación</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row container max-w-7xl mx-auto items-stretch">
                {/* Side List - Versions */}
                <div className="w-full md:w-64 lg:w-72 border-r border-border flex flex-col bg-muted/20 shrink-0 h-auto md:h-[calc(100vh-65px)] md:sticky md:top-[65px]">
                    <div className="p-6 border-b border-border">
                        <h2 className="text-lg font-semibold tracking-tight">Historial de Versiones</h2>
                        <p className="text-sm text-muted-foreground mt-1">Explorá nuestra evolución</p>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-none p-3 space-y-1">
                        {changelogEntries.map((entry) => (
                            <button
                                key={entry.version}
                                onClick={() => setSelectedVersion(entry.version)}
                                className={cn(
                                    "w-full p-4 text-left rounded-lg transition-all flex flex-col gap-1.5 group",
                                    selectedVersion === entry.version
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "hover:bg-muted"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-sm">
                                        v{entry.version}
                                    </span>
                                    <span className={cn(
                                        "text-xs font-medium",
                                        selectedVersion === entry.version ? "text-primary-foreground/80" : "text-muted-foreground group-hover:text-foreground"
                                    )}>
                                        {new Date(entry.date).toLocaleDateString('es-AR', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <p className={cn(
                                    "text-sm font-medium truncate",
                                    selectedVersion === entry.version ? "text-primary-foreground" : "text-foreground"
                                )}>
                                    {entry.title}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content - Detail View */}
                <div className="flex-1 overflow-y-auto w-full md:h-[calc(100vh-65px)]">
                    <div className="max-w-3xl mx-auto px-6 py-12 lg:px-12 lg:py-16">
                        {selectedEntry ? (
                            <div className="space-y-12">
                                <div className="space-y-6">
                                    <Badge variant="outline" className="text-sm px-3 py-1 font-medium bg-muted/50">
                                        Versión {selectedEntry.version}
                                    </Badge>

                                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground balance-text">
                                        Novedades: {selectedEntry.title}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-md">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {new Date(selectedEntry.date).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-md">
                                            <Tag className="w-4 h-4" />
                                            <span>Equipo de Stockcito</span>
                                        </div>
                                    </div>

                                    <p className="text-lg text-muted-foreground leading-relaxed pt-2">
                                        {selectedEntry.description}
                                    </p>
                                </div>

                                {/* List of Changes */}
                                <div className="space-y-8">
                                    {(['new', 'improvement', 'fix', 'performance'] as const).map((type) => {
                                        const changes = groupedChanges[type]
                                        if (!changes || changes.length === 0) return null

                                        const config = typeConfig[type]
                                        const isExpanded = expandedTypes.includes(type)

                                        return (
                                            <div key={type} className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
                                                <button
                                                    onClick={() => toggleType(type)}
                                                    className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn("px-3 py-1.5 flex items-center text-xs font-semibold rounded-md", config.className)}>
                                                            {config.icon}
                                                            {config.label}
                                                        </div>
                                                        <span className="text-sm font-medium text-muted-foreground">
                                                            {changes.length} {changes.length === 1 ? 'cambio' : 'cambios'}
                                                        </span>
                                                    </div>
                                                    <div className="text-muted-foreground p-1 rounded-md hover:bg-muted transition-colors">
                                                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                                    </div>
                                                </button>

                                                {isExpanded && (
                                                    <div className="px-5 pb-5 pt-2 grid gap-5 border-t border-border/50">
                                                        {changes.map((change, idx) => (
                                                            <div key={idx} className="flex gap-4">
                                                                <div className="flex-shrink-0 mt-1.5">
                                                                    <div className="w-2 h-2 rounded-full bg-primary/40 ring-4 ring-primary/10" />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <h4 className="text-base font-semibold text-foreground">{change.title}</h4>
                                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                                        {change.description}
                                                                    </p>
                                                                    {change.docsPath && (
                                                                        <Link
                                                                            href={change.docsPath}
                                                                            className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-primary hover:underline mt-2 italic"
                                                                        >
                                                                            Ver en documentación <ChevronRight className="w-3 h-3 ml-1" />
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Footer CTA Section */}
                                <div className="pt-12 mt-12 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6 pb-8">
                                    <div className="space-y-1 text-center sm:text-left">
                                        <h3 className="font-medium text-foreground">¿Alguna duda o sugerencia?</h3>
                                        <p className="text-sm text-muted-foreground">Escribinos y lo solucionamos rápido.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button variant="outline" asChild>
                                            <a href={`mailto:${FEEDBACK_EMAIL}`}>
                                                <Mail className="w-4 h-4 mr-2" />
                                                Soporte
                                            </a>
                                        </Button>
                                        <Button asChild>
                                            <Link href="/docs">Ver Guías</Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
                                    <ScrollText className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold">Seleccioná una versión</h3>
                                <p className="text-muted-foreground max-w-sm">Elegí una versión desde el panel lateral para ver todos los detalles y novedades de esa actualización.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
