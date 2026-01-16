"use client"

import Link from 'next/link'
import { Zap, FileText, BarChart3 } from 'lucide-react'

interface AuthHeroProps {
    title?: string
    subtitle?: React.ReactNode
}

export function AuthHero({
    title = "Bienvenido de vuelta",
    subtitle = (
        <>
            Accedé a tu panel y comenzá a vender. Usá <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs font-mono">/</kbd> o{' '}
            <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs font-mono">Ctrl+K</kbd>
        </>
    )
}: AuthHeroProps) {
    return (
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-8 flex-col justify-center relative overflow-hidden">
            {/* Animated background shapes */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="max-w-md mx-auto space-y-6 relative z-10 scale-95 origin-center">
                <div>
                    <h2 className="text-3xl font-bold">{title}</h2>
                    <div className="mt-3 text-white/80 text-base">
                        {subtitle}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm transition-all hover:bg-white/15 hover:scale-[1.02]">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                            <Zap className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Atajos eficientes</h3>
                            <p className="text-white/70 text-xs">Usá teclas para acelerar la caja.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm transition-all hover:bg-white/15 hover:scale-[1.02]">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Facturación simplificada</h3>
                            <p className="text-white/70 text-xs">Precios netos y IVA desglosado.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm transition-all hover:bg-white/15 hover:scale-[1.02]">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                            <BarChart3 className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Reportes rápidos</h3>
                            <p className="text-white/70 text-xs">CSV/Excel listos para tu contador.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center transition-all hover:bg-white/15">
                        <div className="text-xl font-bold">120+</div>
                        <div className="text-[10px] text-white/70">Comercios</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center transition-all hover:bg-white/15">
                        <div className="text-xl font-bold">1.2k</div>
                        <div className="text-[10px] text-white/70">Ventas / día</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center transition-all hover:bg-white/15">
                        <div className="text-xl font-bold">420</div>
                        <div className="text-[10px] text-white/70">Reportes / mes</div>
                    </div>
                </div>

                <div className="pt-3 border-t border-white/20 flex items-center justify-between">
                    <p className="text-white/60 text-xs italic">
                        "Stockcito agilizó nuestras ventas"
                    </p>
                    <Link
                        href="/docs"
                        className="text-xs text-white/80 hover:text-white hover:underline transition-colors flex items-center gap-1"
                    >
                        Docs <Zap className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
