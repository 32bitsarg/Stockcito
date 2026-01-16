import { getSession } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { getKitchenOrders, getKitchenStats } from "@/actions/kitchen-actions"
import { getOrganizationFeatures } from "@/actions/notification-actions"
import { KitchenHeader } from "@/components/kitchen/kitchen-header"
import { KitchenOrderCard } from "@/components/kitchen/kitchen-order-card"
import { Card, CardContent } from "@/components/ui/card"
import { ChefHat, Clock, CheckCircle, AlertTriangle } from "lucide-react"

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
        <div className="min-h-screen bg-background">
            <KitchenHeader stats={stats} />

            <div className="p-4 lg:p-6">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                    <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200">
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">Pendientes</p>
                                    <p className="text-3xl font-bold text-yellow-800 dark:text-yellow-200">
                                        {stats.pendingCount}
                                    </p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">En Preparación</p>
                                    <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                                        {stats.preparingCount}
                                    </p>
                                </div>
                                <ChefHat className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-700 dark:text-green-300">Listos</p>
                                    <p className="text-3xl font-bold text-green-800 dark:text-green-200">
                                        {stats.readyCount}
                                    </p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-muted border-muted-foreground/20">
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                                    <p className="text-3xl font-bold">
                                        {stats.averagePrepTime} min
                                    </p>
                                </div>
                                <Clock className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Orders Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Pending Column */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                            <AlertTriangle className="h-5 w-5" />
                            Pendientes ({pendingOrders.length})
                        </h2>
                        <div className="space-y-3">
                            {pendingOrders.length === 0 ? (
                                <Card className="border-dashed">
                                    <CardContent className="py-8 text-center text-muted-foreground">
                                        No hay pedidos pendientes
                                    </CardContent>
                                </Card>
                            ) : (
                                pendingOrders.map(order => (
                                    <KitchenOrderCard key={order.id} order={order} />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Preparing Column */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            <ChefHat className="h-5 w-5" />
                            En Preparación ({preparingOrders.length})
                        </h2>
                        <div className="space-y-3">
                            {preparingOrders.length === 0 ? (
                                <Card className="border-dashed">
                                    <CardContent className="py-8 text-center text-muted-foreground">
                                        No hay pedidos en preparación
                                    </CardContent>
                                </Card>
                            ) : (
                                preparingOrders.map(order => (
                                    <KitchenOrderCard key={order.id} order={order} />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Ready Column */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-green-700 dark:text-green-300">
                            <CheckCircle className="h-5 w-5" />
                            Listos ({readyOrders.length})
                        </h2>
                        <div className="space-y-3">
                            {readyOrders.length === 0 ? (
                                <Card className="border-dashed">
                                    <CardContent className="py-8 text-center text-muted-foreground">
                                        No hay pedidos listos
                                    </CardContent>
                                </Card>
                            ) : (
                                readyOrders.map(order => (
                                    <KitchenOrderCard key={order.id} order={order} />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
