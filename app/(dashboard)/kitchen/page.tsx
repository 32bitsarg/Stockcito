import { getSession } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { getKitchenOrders, getKitchenStats } from "@/actions/kitchen-actions"
import { getOrganizationFeatures } from "@/actions/notification-actions"
import { KitchenHeader } from "@/components/kitchen/kitchen-header"
import { KitchenOrderCard } from "@/components/kitchen/kitchen-order-card"
import { Card, CardContent } from "@/components/ui/card"
import { ChefHat, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import * as motion from "framer-motion/client"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function KitchenPage() {
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    // Check if kitchen feature is enabled
    const features = await getOrganizationFeatures()
    if (!features?.kitchenDisplay) {
        redirect("/dashboard?error=kitchen_disabled")
    }

    const [orders, stats] = await Promise.all([
        getKitchenOrders('all'),
        getKitchenStats()
    ])

    const pendingOrders = orders.filter(o => o.status === 'pending')
    const preparingOrders = orders.filter(o => o.status === 'preparing')
    const readyOrders = orders.filter(o => o.status === 'ready')

    return (
        <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 -mt-6 -mx-4 lg:-mx-8">
            <KitchenHeader stats={stats} />

            <div className="p-4 lg:p-8">
                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="grid gap-4 md:grid-cols-4 mb-10"
                >
                    <Card className="bg-zinc-900 dark:bg-zinc-100 border-none group transition-all hover:scale-[1.02]">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Queue / Pendientes</p>
                                    <p className="text-4xl font-black text-zinc-100 dark:text-zinc-900 font-mono tracking-tighter">
                                        {stats.pendingCount.toString().padStart(2, '0')}
                                    </p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-zinc-800 dark:text-zinc-200 group-hover:animate-pulse" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all hover:scale-[1.02]">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">On Fire / Preparación</p>
                                    <p className="text-4xl font-black text-zinc-900 dark:text-zinc-100 font-mono tracking-tighter">
                                        {stats.preparingCount.toString().padStart(2, '0')}
                                    </p>
                                </div>
                                <ChefHat className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all hover:scale-[1.02]">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Pick Up / Listos</p>
                                    <p className="text-4xl font-black text-zinc-900 dark:text-zinc-100 font-mono tracking-tighter">
                                        {stats.readyCount.toString().padStart(2, '0')}
                                    </p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all hover:scale-[1.02]">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Eficacia / Prep Time</p>
                                    <p className="text-4xl font-black text-zinc-900 dark:text-zinc-100 font-mono tracking-tighter">
                                        {stats.averagePrepTime}<span className="text-xs uppercase ml-1">min</span>
                                    </p>
                                </div>
                                <Clock className="h-8 w-8 text-zinc-300 dark:text-zinc-700 font-mono" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Orders Grid */}
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Pending Column */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b-2 border-zinc-900 dark:border-zinc-100 pb-2">
                            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100 animate-pulse" />
                                Entrada ({pendingOrders.length})
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {pendingOrders.length === 0 ? (
                                <div className="py-12 text-center text-zinc-400 italic text-xs font-bold uppercase tracking-widest border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl">
                                    Queue Empty
                                </div>
                            ) : (
                                pendingOrders.map((order, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={order.id}
                                    >
                                        <KitchenOrderCard order={order} />
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Preparing Column */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b-2 border-zinc-300 dark:border-zinc-800 pb-2 text-zinc-400">
                            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <ChefHat className="h-4 w-4" />
                                Producción ({preparingOrders.length})
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {preparingOrders.length === 0 ? (
                                <div className="py-12 text-center text-zinc-400 italic text-xs font-bold uppercase tracking-widest border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl">
                                    Station Idle
                                </div>
                            ) : (
                                preparingOrders.map((order, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={order.id}
                                    >
                                        <KitchenOrderCard order={order} />
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Ready Column */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b-2 border-zinc-300 dark:border-zinc-800 pb-2 text-zinc-400">
                            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Despacho ({readyOrders.length})
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {readyOrders.length === 0 ? (
                                <div className="py-12 text-center text-zinc-400 italic text-xs font-bold uppercase tracking-widest border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl">
                                    No ready items
                                </div>
                            ) : (
                                readyOrders.map((order, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={order.id}
                                    >
                                        <KitchenOrderCard order={order} />
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
