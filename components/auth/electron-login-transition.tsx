"use client"

import { motion, AnimatePresence } from 'framer-motion'

interface ElectronLoginTransitionProps {
    show: boolean
}

/**
 * Pantalla de transición que se muestra SOLO en Electron después de un login exitoso.
 * Cubre el lag de navegación (~1-2s) mientras el dashboard carga por detrás.
 * 
 * Se monta sobre todo el viewport con position: fixed y z-index máximo.
 * AnimatePresence se encarga de montar/desmontar sin residuos en el DOM.
 */
export function ElectronLoginTransition({ show }: ElectronLoginTransitionProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="electron-login-transition"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
                        className="flex flex-col items-center gap-6"
                    >
                        {/* Brand — mismo estilo que el login */}
                        <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white leading-none">
                            Stockcito
                        </h1>

                        {/* Barra de carga animada */}
                        <div className="w-32 h-px bg-zinc-800 overflow-hidden">
                            <motion.div
                                className="h-full w-8 bg-white/80"
                                animate={{ x: ["-32px", "128px"] }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1,
                                    ease: "easeInOut",
                                }}
                            />
                        </div>

                        {/* Estado */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 italic"
                        >
                            Cargando panel
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
