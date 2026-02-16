"use client"

import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="relative">
                <div className="absolute inset-0 rounded-full bg-zinc-900/5 dark:bg-white/5 animate-ping" />
                <div className="relative p-4 rounded-full bg-zinc-100 dark:bg-zinc-900">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                </div>
            </div>
            <div className="text-center space-y-1">
                <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Cargando Dashboard</p>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Preparando métricas...</p>
            </div>
        </div>
    )
}
