import { getSession } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { getOrganizationFeatures } from "@/actions/notification-actions"
import { getTables, getTableStats } from "@/actions/table-actions"
import { TablesClient } from "@/components/tables/tables-client"
import { Card, CardContent } from "@/components/ui/card"
import { LayoutGrid, Users, Utensils, Clock, Sparkles } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import * as motion from "framer-motion/client"

export const dynamic = 'force-dynamic'

export default async function TablesPage() {
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    // Check if tables feature is enabled
    const features = await getOrganizationFeatures()
    if (!features?.tableManagement) {
        redirect("/dashboard?error=tables_disabled")
    }

    const [tables, stats] = await Promise.all([
        getTables(),
        getTableStats()
    ])

    const isAdmin = session.role === 'owner' || session.role === 'admin'

    return (
        <div className="pb-10">
            <PageHeader
                title="Gestión de Salón"
                subtitle="Monitoreo de disponibilidad, reservas y rotación de mesas en tiempo real."
            />

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="grid gap-4 md:grid-cols-5 mb-8"
            >
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm relative overflow-hidden group">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Capacidad Total</p>
                                <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tighter">{stats.total.toString().padStart(2, '0')}</p>
                            </div>
                            <LayoutGrid className="h-6 w-6 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200 dark:border-zinc-800 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 shadow-xl group">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Disponibles</p>
                                <p className="text-3xl font-black font-mono tracking-tighter uppercase italic">{stats.available.toString().padStart(2, '0')}</p>
                            </div>
                            <Sparkles className="h-6 w-6 text-zinc-600 dark:text-zinc-400 animate-pulse" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm group">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Ocupación</p>
                                <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tighter">{stats.occupied.toString().padStart(2, '0')}</p>
                            </div>
                            <Utensils className="h-6 w-6 text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm group">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Reservas</p>
                                <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tighter">{stats.reserved.toString().padStart(2, '0')}</p>
                            </div>
                            <Clock className="h-6 w-6 text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shadow-sm border-dashed">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Protocolo / Aseo</p>
                                <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tighter italic">{stats.cleaning.toString().padStart(2, '0')}</p>
                            </div>
                            <Users className="h-6 w-6 text-zinc-300" />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Tables Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
                <TablesClient tables={tables} isAdmin={isAdmin} />
            </motion.div>
        </div>
    )
}
