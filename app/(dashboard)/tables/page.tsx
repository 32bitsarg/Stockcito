import { getSession } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { getOrganizationFeatures } from "@/actions/notification-actions"
import { getTables, getTableStats } from "@/actions/table-actions"
import { TablesClient } from "@/components/tables/tables-client"
import { Card, CardContent } from "@/components/ui/card"
import { LayoutGrid, Users, Utensils, Clock, Sparkles } from "lucide-react"

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
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Mesas</h1>
                    <p className="text-muted-foreground">
                        Administra el layout y estado de las mesas
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 dark:bg-green-900/20">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 dark:text-green-300">Libres</p>
                                <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                                    {stats.available}
                                </p>
                            </div>
                            <Sparkles className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-red-50 dark:bg-red-900/20">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-700 dark:text-red-300">Ocupadas</p>
                                <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                                    {stats.occupied}
                                </p>
                            </div>
                            <Utensils className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-yellow-50 dark:bg-yellow-900/20">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">Reservadas</p>
                                <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                                    {stats.reserved}
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 dark:bg-blue-900/20">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 dark:text-blue-300">Limpieza</p>
                                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                                    {stats.cleaning}
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tables Grid */}
            <TablesClient tables={tables} isAdmin={isAdmin} />
        </div>
    )
}
