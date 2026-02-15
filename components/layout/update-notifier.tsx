'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export function UpdateNotifier() {
    const [updateStatus, setUpdateStatus] = useState<'none' | 'available' | 'ready'>('none')

    useEffect(() => {
        // Verificar si estamos en Electron usando el puente expuesto
        const isElectron = typeof window !== 'undefined' && (window as any).electron

        if (!isElectron) return

        // Escuchar eventos de actualización usando el puente seguro
        const removeAvailableListener = (window as any).electron.on('update-available', () => {
            setUpdateStatus('available')
            toast.info('Hay una nueva versión de Stockcito disponible. Descargando...')
        })

        const removeReadyListener = (window as any).electron.on('update-ready', () => {
            setUpdateStatus('ready')
            toast.success('¡Actualización lista! Reinicia para aplicar los cambios.', {
                duration: Infinity
            })
        })

        return () => {
            if (removeAvailableListener) removeAvailableListener()
            if (removeReadyListener) removeReadyListener()
        }
    }, [])

    const handleRestart = () => {
        if ((window as any).electron) {
            (window as any).electron.send('restart-app')
        }
    }

    if (updateStatus === 'none') return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-4 flex items-center justify-between shadow-lg border-b border-blue-400/30 backdrop-blur-md"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/50 rounded-lg">
                        <RefreshCw className={`h-5 w-5 ${updateStatus === 'available' ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-sm">
                            {updateStatus === 'ready' ? '¡Actualización Lista!' : 'Descargando Actualización...'}
                        </h4>
                        <p className="text-xs text-blue-100 mt-1">
                            {updateStatus === 'ready'
                                ? 'La nueva versión se ha descargado. Reinicia la aplicación para disfrutar de las mejoras.'
                                : 'Se ha encontrado una versión más reciente. Se aplicará automáticamente al reiniciar.'}
                        </p>
                        {updateStatus === 'ready' && (
                            <button
                                onClick={handleRestart}
                                className="mt-3 py-1.5 px-4 bg-white text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                            >
                                Reiniciar e Instalar
                            </button>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => setUpdateStatus('none')}
                    className="p-2 rounded-full hover:bg-blue-500 transition-colors md:ml-4"
                >
                    <X className="h-5 w-5" />
                </button>
            </motion.div>
        </AnimatePresence>
    )
}
