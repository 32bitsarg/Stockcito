import { POSInterface } from "@/components/sales/pos-interface"
import { getSession } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { getOrganizationFeatures } from "@/actions/notification-actions"
import { getTables } from "@/actions/table-actions"
import * as motion from "framer-motion/client"

export const dynamic = 'force-dynamic'

interface POSPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function POSPage({ searchParams }: POSPageProps) {
    const session = await getSession()
    if (!session) {
        redirect("/login")
    }

    const resolvedParams = await searchParams
    const addSku = typeof resolvedParams.addSku === 'string' ? resolvedParams.addSku : undefined

    const features = await getOrganizationFeatures()
    const tables = features?.tableManagement
        ? await getTables()
        : []

    return (
        <div className="flex-1 flex flex-col -m-4 lg:-m-6 overflow-hidden min-h-[600px]">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between px-6 py-4 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800"
            >
                <div className="flex items-center gap-3">
                    <div className="h-6 w-1 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
                    <h1 className="text-lg font-black uppercase italic tracking-tighter text-zinc-900 dark:text-zinc-100">
                        Terminal de Venta / POS-01
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">Motor de Procesamiento</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Activo</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="flex-1 overflow-hidden">
                <POSInterface
                    tableManagementEnabled={features?.tableManagement ?? false}
                    tables={tables}
                    initialSku={addSku}
                    userRole={session.role}
                />
            </div>
        </div>
    )
}
