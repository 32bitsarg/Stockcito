"use client"

import { motion } from 'framer-motion'

export function LandingShowcase() {
    return (
        <section className="bg-white dark:bg-zinc-950 py-12 md:py-24 border-t border-zinc-50 dark:border-zinc-900 overflow-hidden">
            <div className="container mx-auto px-4 md:px-8 max-w-[1400px]">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="relative group rounded-xl md:rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-zinc-950/50 bg-zinc-100 dark:bg-zinc-900"
                >
                    {/* Glossy reflection effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />

                    <img
                        src="/assets/images/landing.webp"
                        alt="Stockcito Dashboard Interface"
                        className="w-full h-auto object-cover md:object-contain grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out"
                    />
                </motion.div>
            </div>
        </section>
    )
}
