"use client"

import { useOfflineData } from "@/hooks/use-offline-data"
import { getDashboardMetrics, getTopProducts, getRecentSales, getSalesChartData, getLowStockProducts, getUserRecentSales } from "@/actions/dashboard-actions"
import { useNetworkStatus, getOfflineMutations, getLastSyncTimestamp } from "@/lib/offline-sync"
import { getStockAlertCount } from "@/actions/stock-alert-actions"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { TopProductsWidget } from "@/components/dashboard/top-products-widget"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { LowStockAlert } from "@/components/inventory/low-stock-alert"
import { EmailVerificationBanner } from "@/components/dashboard/email-verification-banner"
import { OfflineDataBadge } from "@/components/offline/offline-data-badge"
import Link from "next/link"
import * as motion from "framer-motion/client"
import { APP_VERSION_DISPLAY } from "@/lib/changelog"
import { Loader2, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"

interface DashboardContentProps {
    session: {
        id: number
        name: string
        email: string
        role: string
        emailVerified: boolean
    }
}

/**
 * Dashboard Content - Client Component con soporte offline.
 * 
 * SEGURIDAD:
 * - No cachea datos de sesión (se pasan como prop desde Server Component).
 * - Los server actions validan organizationId internamente.
 * - Los datos financieros cacheados son solo los que el usuario ya tiene permiso de ver.
 * - El caché se limpia al cerrar sesión.
 */
export function DashboardContent({ session }: DashboardContentProps) {
    const isOwner = session.role === 'owner'
    const isAdmin = session.role === 'admin'
    const isManager = session.role === 'manager'
    const canViewFinancials = isOwner || isAdmin || isManager
    const showVerificationBanner = isOwner && !session.emailVerified

    if (!canViewFinancials) {
        return <EmployeeDashboard session={session} />
    }

    return <AdminDashboard session={session} showVerificationBanner={showVerificationBanner} />
}

// ─────────────────────────────────────────────────────────────
// EMPLOYEE VIEW
// ─────────────────────────────────────────────────────────────

function EmployeeDashboard({ session }: { session: DashboardContentProps['session'] }) {
    const isOnline = useNetworkStatus()

    const { data: lowStockProducts, isOfflineData: offlineLowStock, dataUpdatedAt: lowStockUpdated } = useOfflineData(
        ['lowStockProducts'],
        getLowStockProducts
    )

    const { data: userRecentSales, isOfflineData: offlineSales, dataUpdatedAt: salesUpdated } = useOfflineData(
        ['userRecentSales', session.id],
        () => getUserRecentSales(session.id)
    )

    const isOfflineData = offlineLowStock || offlineSales

    return (
        <div className="flex flex-col gap-10 max-w-5xl mx-auto w-full pb-10">
            <div className="flex items-center justify-between">
                <OfflineDataBadge isOfflineData={isOfflineData} dataUpdatedAt={salesUpdated || lowStockUpdated} />
                <div className={`flex items-center gap-2 ${isOnline ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'bg-red-950 dark:bg-red-100 text-red-100 dark:text-red-900'} rounded-xl px-4 py-2 shadow-lg transition-colors duration-500`}>
                    <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${isOnline
                        ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                        : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                        }`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 mt-8">
                <div className="h-12 w-1.5 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-zinc-50">Hola, {session.name}</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                        Terminal Operativa Activa / {new Date().toLocaleDateString('es-AR', { weekday: 'long' })}
                    </p>
                </div>
            </div>

            {/* Quick Actions for Employees */}
            <div className="grid gap-6 md:grid-cols-2 w-full">
                <Link href="/sales/new" className="group relative flex flex-col items-center justify-center p-10 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 transition-all shadow-sm hover:shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>
                    </div>
                    <div className="p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-zinc-900 transition-all mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>
                    </div>
                    <div className="text-center relative z-10">
                        <h3 className="font-black text-xl uppercase italic tracking-tighter">Punto de Venta</h3>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">Iniciar nueva operación</p>
                    </div>
                </Link>

                <Link href="/inventory" className="group relative flex flex-col items-center justify-center p-10 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 transition-all shadow-sm hover:shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22v-10" /></svg>
                    </div>
                    <div className="p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-zinc-900 transition-all mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22v-10" /></svg>
                    </div>
                    <div className="text-center relative z-10">
                        <h3 className="font-black text-xl uppercase italic tracking-tighter">Inventario</h3>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">Consultar precios y stock</p>
                    </div>
                </Link>
            </div>

            {userRecentSales && userRecentSales.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full mt-6 space-y-6"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-1 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
                        <h3 className="font-black text-sm uppercase italic tracking-widest text-zinc-900 dark:text-zinc-100">Mis Ventas Recientes</h3>
                    </div>

                    <div className="rounded-[24px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xl">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead>
                                    <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                                        <th className="h-12 px-6 text-left align-middle text-[10px] font-black uppercase tracking-widest text-zinc-400">ID / Hora</th>
                                        <th className="h-12 px-6 text-left align-middle text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Transacción</th>
                                        <th className="h-12 px-6 text-left align-middle text-[10px] font-black uppercase tracking-widest text-zinc-400">Volumen</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                                    {userRecentSales.map((sale: any) => (
                                        <tr key={sale.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors group">
                                            <td className="px-6 py-4 align-middle font-mono text-xs tabular-nums text-zinc-500">
                                                #{sale.id.toString().padStart(4, '0')} <span className="mx-2 opacity-20">|</span> {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-4 align-middle">
                                                <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 font-mono italic tracking-tighter">
                                                    ${Number(sale.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 align-middle">
                                                <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-full text-zinc-500">
                                                    {sale.items.length.toString().padStart(2, '0')} ITEMS
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}

            {lowStockProducts && lowStockProducts.length > 0 && (
                <div className="w-full">
                    <LowStockAlert products={lowStockProducts} />
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// ADMIN / OWNER VIEW
// ─────────────────────────────────────────────────────────────

function AdminDashboard({ session, showVerificationBanner }: { session: DashboardContentProps['session']; showVerificationBanner: boolean }) {
    const isOnline = useNetworkStatus()
    const [pendingCount, setPendingCount] = useState(0)
    const [stockAlertCount, setStockAlertCount] = useState(0)
    const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)

    // Contar mutaciones pendientes y alertas de stock
    useEffect(() => {
        const checkStatus = async () => {
            const mutations = await getOfflineMutations()
            setPendingCount(mutations.length)

            const lastSync = await getLastSyncTimestamp()
            if (lastSync) {
                setLastSyncTime(new Date(lastSync).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }))
            }
        }
        checkStatus()
        const interval = setInterval(checkStatus, 5000)
        return () => clearInterval(interval)
    }, [])

    // Fetch stock alert count (from server, only when online)
    useEffect(() => {
        if (!isOnline) return
        const fetchAlerts = async () => {
            try {
                const count = await getStockAlertCount()
                setStockAlertCount(count)
            } catch {
                // Ignore errors when fetching alerts
            }
        }
        fetchAlerts()
        const interval = setInterval(fetchAlerts, 15000)
        return () => clearInterval(interval)
    }, [isOnline])

    const { data: metrics, isOfflineData: offlineMetrics, dataUpdatedAt } = useOfflineData(
        ['dashboardMetrics'],
        getDashboardMetrics
    )

    const { data: topProducts } = useOfflineData(
        ['topProducts'],
        () => getTopProducts(5)
    )

    const { data: recentSales } = useOfflineData(
        ['recentSales'],
        () => getRecentSales(10)
    )

    const { data: chartData } = useOfflineData(
        ['salesChartData'],
        () => getSalesChartData(7)
    )

    const { data: lowStockProducts } = useOfflineData(
        ['lowStockProducts'],
        getLowStockProducts
    )

    // Mostrar loading solo si no hay datos en caché
    if (!metrics) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                <p className="text-sm text-zinc-500">Cargando dashboard...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Modern Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <Link href="/changelog" className="flex items-center gap-3 mb-2 group cursor-pointer">
                        <div className="h-8 w-1.5 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">Sistema Operativo / {APP_VERSION_DISPLAY}</span>
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 uppercase italic">
                        Dashboard
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
                        Métricas de rendimiento e inteligencia de negocio en tiempo real.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <OfflineDataBadge isOfflineData={offlineMetrics} dataUpdatedAt={dataUpdatedAt} />
                    <div className={`flex items-center gap-4 ${isOnline ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-800 dark:border-zinc-200' : 'bg-red-950 dark:bg-red-100 text-red-100 dark:text-red-900 border-red-800 dark:border-red-300'} rounded-2xl px-6 py-3 shadow-2xl border transition-colors duration-500`}>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                                {isOnline ? 'Sincronización' : 'Offline'}
                            </span>
                            <span className="text-xs font-black uppercase italic tracking-tighter">
                                {isOnline
                                    ? lastSyncTime ? `Última sync: ${lastSyncTime}` : new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
                                    : pendingCount > 0 ? `${pendingCount} pendiente${pendingCount !== 1 ? 's' : ''}` : 'Sin conexión'
                                }
                            </span>
                        </div>
                        <div className="w-px h-8 bg-white/10 dark:bg-zinc-200" />
                        <div className="h-10 w-10 flex items-center justify-center bg-white/10 dark:bg-zinc-900/5 rounded-xl">
                            <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${isOnline
                                ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                                : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                                }`} />
                        </div>
                    </div>
                </div>
            </div>

            {showVerificationBanner && (
                <EmailVerificationBanner email={session.email} />
            )}

            {/* Stock Alert Banner */}
            {stockAlertCount > 0 && (
                <Link href="/inventory">
                    <div className="flex items-center gap-3 bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-400 rounded-2xl px-6 py-4 hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-colors cursor-pointer group">
                        <div className="h-10 w-10 flex items-center justify-center bg-red-500 rounded-xl text-white shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <span className="text-sm font-black uppercase tracking-wider">
                                {stockAlertCount} alerta{stockAlertCount !== 1 ? 's' : ''} de stock
                            </span>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mt-0.5">
                                Productos con stock negativo tras sincronización offline · Click para revisar
                            </p>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </div>
                </Link>
            )}

            {lowStockProducts && lowStockProducts.length > 0 && (
                <LowStockAlert products={lowStockProducts} />
            )}

            {/* Main Stats Row */}
            <DashboardStats metrics={metrics} />

            {/* Main Content Grid */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-6 items-start">
                {/* Sales Timeline - Spans 4 columns */}
                <div className="lg:col-span-4 h-[500px]">
                    {chartData ? <SalesChart data={chartData} type="line" /> : (
                        <div className="flex items-center justify-center h-full bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <p className="text-sm text-zinc-400">Sin datos de gráfico disponibles</p>
                        </div>
                    )}
                </div>

                {/* Top Products - Spans 2 columns */}
                <div className="lg:col-span-2 h-[500px]">
                    {topProducts ? <TopProductsWidget products={topProducts} /> : (
                        <div className="flex items-center justify-center h-full bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <p className="text-sm text-zinc-400">Sin productos disponibles</p>
                        </div>
                    )}
                </div>

                {/* Recent Activity - Full width below */}
                <div className="lg:col-span-6 min-h-[500px]">
                    {recentSales ? <RecentActivity sales={recentSales} /> : (
                        <div className="flex items-center justify-center min-h-[200px] bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <p className="text-sm text-zinc-400">Sin ventas recientes disponibles</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
