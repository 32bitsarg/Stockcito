"use client"

import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { useState } from 'react'

const faqs = [
    {
        question: "¿Stockcito funciona sin internet?",
        answer: "Sí. Está diseñado con tecnología offline-first. Podés seguir vendiendo y controlando tu stock aunque se corte la conexión; los datos se sincronizarán automáticamente cuando vuelvas a estar en línea."
    },
    {
        question: "¿Cómo manejo la inflación con el sistema?",
        answer: "Stockcito permite actualizaciones masivas de precios por porcentaje o categoría. Además, podés pre-cargar aumentos para que se apliquen automáticamente en una fecha determinada, protegiendo tus márgenes sin esfuerzo manual."
    },
    {
        question: "¿Tengo que pagar para empezar?",
        answer: "No. Ofrecemos una prueba gratuita de 7 días con todas las funciones desbloqueadas. No pedimos tarjeta de crédito para iniciar; el objetivo es que veas el valor que aporta a tu comercio antes de decidir."
    },
    {
        question: "¿Qué pasa con mis datos si cambio de PC?",
        answer: "Toda tu información está respaldada en la nube de forma segura. Si cambiás de dispositivo o instalás nuestra app en otra computadora, solo tenés que iniciar sesión para recuperar todo tu inventario y ventas históricas."
    },
    {
        question: "¿Tienen soporte en mi zona?",
        answer: "Contamos con soporte regional dedicado. Al ser un desarrollo con base operativa en el interior (región Pergamino y alrededores), entendemos los tiempos y necesidades reales de los comercios de la zona."
    }
]

export function LandingFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <section id="faq" className="bg-white dark:bg-zinc-950 py-32 border-t border-zinc-50 dark:border-zinc-900">
            <div className="container mx-auto px-8">
                <div className="flex flex-col md:flex-row gap-20">
                    <div className="w-full md:w-1/3 space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 italic">Dudas Comunes</span>
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Preguntas <br /> Frecuentes</h2>
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 italic max-w-xs pt-4">
                            Todo lo que necesitás saber para digitalizar tu comercio hoy mismo con total seguridad.
                        </p>
                    </div>

                    <div className="w-full md:w-2/3 space-y-4">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="border-b border-zinc-100 dark:border-zinc-900"
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                    className="w-full flex justify-between items-center py-6 text-left group"
                                >
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                                        {faq.question}
                                    </span>
                                    {openIndex === i ? (
                                        <Minus className="w-4 h-4 text-zinc-400" />
                                    ) : (
                                        <Plus className="w-4 h-4 text-zinc-400" />
                                    )}
                                </button>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="pb-8"
                                    >
                                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 leading-relaxed italic max-w-2xl">
                                            {faq.answer}
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
