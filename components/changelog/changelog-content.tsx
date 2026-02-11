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
        label: 'AÑADIDO',
        className: 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950',
        borderColor: 'border-zinc-900 dark:border-white'
    },
    improvement: {
        label: 'MEJORA',
        className: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100',
        borderColor: 'border-zinc-100 dark:border-zinc-800'
    },
    fix: {
        label: 'CORRECCIÓN',
        className: 'bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400',
        borderColor: 'border-zinc-50 dark:border-zinc-900'
    },
    performance: {
        label: 'RENDIMIENTO',
        className: 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950',
        borderColor: 'border-zinc-900 dark:border-white'
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
    const backLabel = isAuthenticated ? 'VOLVER AL PANEL' : 'VOLVER AL INICIO'

    return (
        <div className="h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900 overflow-hidden">
            {/* Grid Pattern */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Header */}
            <div className="border-b border-zinc-100 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-50">
                <div className="w-full px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link href={backUrl} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] hover:text-zinc-500 transition-colors italic">
                                <ArrowLeft className="w-4 h-4" />
                                {backLabel}
                            </Link>
                            <div className="h-4 w-px bg-zinc-100 dark:bg-zinc-900 hidden sm:block" />
                            <div className="hidden sm:flex items-center gap-2">
                                <ScrollText className="w-3 h-3 text-zinc-400" />
                                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400 italic">Cambios y Mejoras</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link href="/docs" className="text-[9px] font-black uppercase tracking-[0.3em] hover:text-zinc-500 transition-colors italic border-b border-zinc-900 dark:border-white pb-1">Documentación</Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative z-10">
                {/* Side List - Versions */}
                <div className="w-72 md:w-80 border-r border-zinc-100 dark:border-zinc-900 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-900">
                        <span className="text-[7px] font-black uppercase tracking-[0.5em] text-zinc-400 italic block mb-2">Historial</span>
                        <h2 className="text-[14px] font-black uppercase tracking-[0.2em] italic">Versiones</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-none">
                        {changelogEntries.map((entry) => (
                            <button
                                key={entry.version}
                                onClick={() => setSelectedVersion(entry.version)}
                                className={cn(
                                    "w-full p-6 md:p-8 text-left border-b border-zinc-50 dark:border-zinc-900 transition-all group",
                                    selectedVersion === entry.version
                                        ? "bg-white dark:bg-zinc-950"
                                        : "hover:bg-white/50 dark:hover:bg-zinc-900/50"
                                )}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className={cn(
                                        "text-[10px] font-black tracking-widest uppercase italic px-3 py-1 border transition-colors",
                                        selectedVersion === entry.version
                                            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                                            : "border-zinc-100 dark:border-zinc-800 text-zinc-400 group-hover:border-zinc-300 dark:group-hover:border-zinc-600"
                                    )}>
                                        v{entry.version}
                                    </span>
                                    {selectedVersion === entry.version && (
                                        <div className="w-1.5 h-1.5 bg-zinc-900 dark:bg-white animate-pulse" />
                                    )}
                                </div>
                                <p className={cn(
                                    "text-[10px] font-black uppercase tracking-[0.1em] italic leading-tight transition-colors",
                                    selectedVersion === entry.version ? "text-zinc-900 dark:text-white" : "text-zinc-400"
                                )}>
                                    {entry.title}
                                </p>
                                <p className="text-[7px] font-black uppercase tracking-[0.3em] text-zinc-300 mt-2 italic">
                                    {new Date(entry.date).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content - Detail View */}
                <div className="flex-1 overflow-y-auto scrollbar-none bg-white dark:bg-zinc-950">
                    <div className="max-w-4xl mx-auto px-8 md:px-12 lg:px-20 py-12 md:py-20">
                        {selectedEntry ? (
                            <div className="space-y-16 md:space-y-24">
                                <div className="space-y-8 md:space-y-12">
                                    <div className="w-12 h-px bg-zinc-900 dark:bg-white" />
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Versión v{selectedEntry.version}</span>
                                            <div className="h-px flex-1 bg-zinc-50 dark:bg-zinc-900" />
                                        </div>
                                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter uppercase italic leading-none">{selectedEntry.title}</h1>
                                        <div className="flex flex-wrap items-center gap-6 pt-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3 text-zinc-400" />
                                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">
                                                    {new Date(selectedEntry.date).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-3 h-3 text-zinc-400" />
                                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Publicado por Soporte</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[11px] md:text-[12px] font-bold uppercase tracking-[0.1em] text-zinc-500 italic leading-relaxed max-w-2xl border-l-2 border-zinc-100 dark:border-zinc-800 pl-8">
                                        {selectedEntry.description}
                                    </p>
                                </div>

                                {/* Matrix of Changes */}
                                <div className="grid gap-px bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900">
                                    {(['new', 'improvement', 'fix', 'performance'] as const).map((type) => {
                                        const changes = groupedChanges[type]
                                        if (!changes || changes.length === 0) return null

                                        const config = typeConfig[type]
                                        const isExpanded = expandedTypes.includes(type)

                                        return (
                                            <div key={type} className="bg-white dark:bg-zinc-950">
                                                <button
                                                    onClick={() => toggleType(type)}
                                                    className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className={cn("px-4 py-1 text-[8px] font-black uppercase tracking-[0.3em] italic border", config.className, config.borderColor)}>
                                                            {config.label}
                                                        </div>
                                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] italic text-zinc-400">
                                                            {changes.length} CAMBIOS
                                                        </span>
                                                    </div>
                                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                </button>

                                                {isExpanded && (
                                                    <div className="p-6 md:p-8 pt-0 grid gap-4">
                                                        {changes.map((change, idx) => (
                                                            <div key={idx} className="p-5 md:p-6 border border-zinc-50 dark:border-zinc-900 hover:border-zinc-100 dark:hover:border-zinc-800 transition-colors space-y-2 group">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-1 h-1 bg-zinc-900 dark:bg-white opacity-20 group-hover:opacity-100 transition-opacity" />
                                                                    <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] italic">{change.title}</h4>
                                                                </div>
                                                                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 italic leading-relaxed pl-4">
                                                                    {change.description}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Footer CTA Section */}
                                <div className="pt-16 md:pt-24 border-t border-zinc-50 dark:border-zinc-900 flex flex-col items-center gap-10 text-center pb-12">
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] italic text-zinc-400">¿Necesitás ayuda?</h3>
                                        <a href={`mailto:${FEEDBACK_EMAIL}`} className="text-[11px] md:text-[12px] font-black tracking-widest text-zinc-900 dark:text-white border-b border-zinc-900 dark:border-white pb-1 italic leading-none">{FEEDBACK_EMAIL}</a>
                                    </div>
                                    <Link href="/docs" className="h-10 px-8 flex items-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[9px] font-black uppercase tracking-[0.3em] italic transition-transform hover:scale-105 active:scale-95">Centro de Ayuda</Link>
                                </div>
                            </div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 border border-zinc-100 dark:border-zinc-900 italic">
                                <ScrollText className="w-8 h-8 text-zinc-100 dark:text-zinc-800" />
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400">Seleccione una versión de la lista lateral</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
