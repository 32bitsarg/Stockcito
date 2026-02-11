"use client"

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { APP_VERSION_DISPLAY } from '@/lib/changelog'

interface AuthHeroProps {
    title?: string
    subtitle?: React.ReactNode
}

export function AuthHero({
    title = "SISTEMA DE GESTIÓN",
    subtitle = "Acceso seguro a la plataforma centralizada de gestión profesional para PyMEs."
}: AuthHeroProps) {
    return (
        <div className="hidden md:flex md:w-1/2 bg-zinc-950 text-white p-12 flex-col justify-between relative overflow-hidden border-r border-zinc-900/50">
            {/* Ultra minimal background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px]" />

            <div className="relative z-10">
                <div className="inline-flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center grayscale invert dark:invert-0">
                        <img src="/icons/icon.svg" alt="" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Sistema.Online</span>
                </div>
            </div>

            <div className="max-w-sm relative z-10">
                <h2 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-[0.8] mb-6">
                    {title}
                </h2>
                <div className="w-12 h-px bg-zinc-800 mb-6" />
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 leading-relaxed italic">
                    {subtitle}
                </p>
            </div>

            <div className="relative z-10 flex items-end justify-between">
                <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-black tracking-tighter italic leading-none">{APP_VERSION_DISPLAY}</span>
                    <span className="text-[6px] font-black uppercase tracking-[0.3em] text-zinc-600">Acceso Anticipado</span>
                </div>

                <Link href="/docs" className="group flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all italic">
                    Documentación
                    <ArrowUpRight className="w-2.5 h-2.5" />
                </Link>
            </div>

            {/* Background watermark */}
            <div className="absolute -bottom-10 -right-5 text-[15rem] font-black italic tracking-tighter opacity-[0.015] select-none pointer-events-none">
                STOCK
            </div>
        </div>
    )
}
