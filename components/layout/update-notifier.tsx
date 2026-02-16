'use client'

import { useEffect, useState, useCallback } from 'react'
import { Download, RefreshCw, Sparkles, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface UpdateState {
    status: 'none' | 'available' | 'downloading' | 'ready'
    progress: number
}

export function UpdateNotifier() {
    const [update, setUpdate] = useState<UpdateState>({ status: 'none', progress: 0 })
    const [dismissed, setDismissed] = useState(false)

    useEffect(() => {
        const isElectron = typeof window !== 'undefined' && (window as any).electron

        if (!isElectron) return

        const removeAvailableListener = (window as any).electron.on('update-available', () => {
            setUpdate({ status: 'available', progress: 0 })
            setDismissed(false)
        })

        const removeProgressListener = (window as any).electron.on('download-progress', (percent: number) => {
            setUpdate({ status: 'downloading', progress: Math.round(percent) })
        })

        const removeReadyListener = (window as any).electron.on('update-ready', () => {
            setUpdate({ status: 'ready', progress: 100 })
            setDismissed(false)
        })

        return () => {
            if (removeAvailableListener) removeAvailableListener()
            if (removeProgressListener) removeProgressListener()
            if (removeReadyListener) removeReadyListener()
        }
    }, [])

    const handleRestart = useCallback(() => {
        if ((window as any).electron) {
            (window as any).electron.send('restart-app')
        }
    }, [])

    if (update.status === 'none' || dismissed) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-4 right-4 z-[100] w-[380px] max-w-[calc(100vw-2rem)]"
            >
                <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl">
                    {/* Progress bar */}
                    {update.status === 'downloading' && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-100 dark:bg-zinc-900">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                                initial={{ width: '0%' }}
                                animate={{ width: `${update.progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    )}

                    {/* Ready shimmer */}
                    {update.status === 'ready' && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 animate-pulse" />
                    )}

                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className={`shrink-0 p-2.5 rounded-xl ${update.status === 'ready'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                                }`}>
                                {update.status === 'ready' ? (
                                    <Sparkles className="w-5 h-5" />
                                ) : update.status === 'downloading' ? (
                                    <Download className="w-5 h-5 animate-bounce" />
                                ) : (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                                    {update.status === 'ready'
                                        ? '¡Nueva versión lista!'
                                        : update.status === 'downloading'
                                            ? 'Descargando actualización'
                                            : 'Nueva versión disponible'
                                    }
                                </h4>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                    {update.status === 'ready'
                                        ? 'La actualización se descargó correctamente. Reiniciá para disfrutar las mejoras.'
                                        : update.status === 'downloading'
                                            ? `Descargando... ${update.progress}%`
                                            : 'Se encontró una versión más reciente. Descargando en segundo plano...'
                                    }
                                </p>

                                {update.status === 'ready' && (
                                    <button
                                        onClick={handleRestart}
                                        className="mt-3 inline-flex items-center gap-2 py-2 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-black uppercase tracking-wider rounded-xl hover:opacity-90 transition-opacity shadow-lg"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Reiniciar ahora
                                    </button>
                                )}
                            </div>

                            {/* Dismiss */}
                            <button
                                onClick={() => setDismissed(true)}
                                className="shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
