"use client"

import { motion } from 'framer-motion'
import { Download, Monitor, ShieldCheck, Zap } from 'lucide-react'
import { APP_VERSION, APP_VERSION_DISPLAY } from '@/lib/changelog'

export function LandingDownload() {
    const downloadUrl = `https://github.com/32bitsarg/Stockcito/releases/download/${APP_VERSION_DISPLAY}/Stockcito-Setup-${APP_VERSION}.exe`

    const features = [
        {
            icon: <Zap className="w-5 h-5 text-zinc-900 dark:text-white" />,
            title: "Máximo Rendimiento",
            description: "Ejecución nativa sin las limitaciones del navegador."
        },
        {
            icon: <ShieldCheck className="w-5 h-5 text-zinc-900 dark:text-white" />,
            title: "Soporte Offline Real",
            description: "Trabajá sin internet con sincronización inteligente en segundo plano."
        },
        {
            icon: <Monitor className="w-5 h-5 text-zinc-900 dark:text-white" />,
            title: "Integración de Sistema",
            description: "Soporte directo para impresoras térmicas y lectores de código de barras."
        }
    ]

    return (
        <section id="descarga" className="bg-zinc-50 dark:bg-zinc-900/50 py-24 md:py-32 border-t border-zinc-100 dark:border-zinc-900">
            <div className="container mx-auto px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 italic">Experiencia Nativa</h2>
                        <h3 className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic leading-[0.9] mb-8">
                            Llevá tu negocio <br /> al escritorio
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base max-w-md leading-relaxed mb-12 font-medium">
                            Descargá la aplicación oficial de Stockcito para Windows. Obtené mayor estabilidad, velocidad de respuesta instantánea y acceso total a periféricos de punto de venta.
                        </p>

                        <div className="space-y-8">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="mt-1 w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl shrink-0 shadow-sm">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-1 italic">{feature.title}</h4>
                                        <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-tight">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-10 md:p-16 rounded-[48px] shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none">
                            <Download size={240} strokeWidth={2.5} />
                        </div>

                        <div className="relative z-10 text-center flex flex-col items-center">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-8 border border-zinc-200 dark:border-zinc-800">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Versión Estable {APP_VERSION_DISPLAY}
                            </div>

                            <div className="mb-10 p-8 rounded-[32px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50">
                                <Monitor className="w-16 h-16 text-zinc-900 dark:text-white" strokeWidth={1.5} />
                            </div>

                            <a
                                href={downloadUrl}
                                className="w-full group flex items-center justify-center gap-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 p-6 md:p-8 rounded-[24px] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-zinc-900/20 dark:hover:shadow-white/10"
                            >
                                <Download className="w-6 h-6 transition-transform group-hover:-translate-y-1" />
                                <div className="flex flex-col items-start translate-y-0.5">
                                    <span className="text-[14px] font-black uppercase tracking-[0.2em] italic leading-none">Descargar para Windows</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mt-1">Stockcito-Setup-{APP_VERSION}.exe</span>
                                </div>
                            </a>

                            <div className="mt-8 flex flex-col gap-2">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 italic">
                                    Requerimientos: Windows 10 / 11 (64-bit)
                                </p>
                                <div className="flex items-center justify-center gap-6 mt-4 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                                    <span className="text-[8px] font-black uppercase tracking-widest">AMD64 Arch</span>
                                    <span className="w-1 h-1 rounded-full bg-zinc-300" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Native Driver Support</span>
                                    <span className="w-1 h-1 rounded-full bg-zinc-300" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Verified Publisher</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
