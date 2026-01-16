import { getDashboardMetrics, getTopProducts, getRecentSales, getSalesChartData, getLowStockProducts, getUserRecentSales } from "@/actions/dashboard-actions"
import { getSession } from "@/actions/auth-actions"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { TopProductsWidget } from "@/components/dashboard/top-products-widget"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { LowStockAlert } from "@/components/inventory/low-stock-alert"
import { EmailVerificationBanner } from "@/components/dashboard/email-verification-banner"
import { VerificationToast } from "@/components/dashboard/verification-toast"
import { redirect } from "next/navigation"
import { Suspense } from "react"

export default async function Dashboard() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  // Permissions check
  const isOwner = session.role === 'owner'
  const isAdmin = session.role === 'admin'
  const isManager = session.role === 'manager'

  // Roles with access to financial data
  const canViewFinancials = isOwner || isAdmin || isManager

  // Verify if needs to see the banner
  const showVerificationBanner = isOwner && !session.emailVerified

  // If simple employee (Cashier/Waiter), show restricted view
  if (!canViewFinancials) {
    const lowStockProducts = await getLowStockProducts()
    const userRecentSales = await getUserRecentSales(session.id)

    return (
      <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
        <Suspense fallback={null}>
          <VerificationToast />
        </Suspense>

        <div className="text-center space-y-2 mt-8">
          <h1 className="text-3xl font-bold tracking-tight">Hola, {session.name} 👋</h1>
          <p className="text-muted-foreground">
            ¿Qué te gustaría hacer hoy?
          </p>
        </div>

        {/* Quick Actions for Employees */}
        <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto w-full">
          <a href="/sales/new" className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 rounded-xl border-2 border-transparent hover:border-primary/50 transition-all shadow-sm hover:shadow-md group text-center gap-4">
            <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>
            </div>
            <div>
              <h3 className="font-semibold text-xl group-hover:text-primary transition-colors">
                Ir al Punto de Venta
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Realizar ventas y cobros
              </p>
            </div>
          </a>

          <a href="/inventory" className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 rounded-xl border-2 border-transparent hover:border-primary/50 transition-all shadow-sm hover:shadow-md group text-center gap-4">
            <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22v-10" /></svg>
            </div>
            <div>
              <h3 className="font-semibold text-xl group-hover:text-emerald-600 transition-colors">
                Consultar Productos
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Ver precios y stock
              </p>
            </div>
          </a>
        </div>

        {userRecentSales.length > 0 && (
          <div className="max-w-4xl mx-auto w-full mt-4">
            <h3 className="font-semibold text-lg mb-4">Mis Ventas Recientes</h3>
            <div className="rounded-md border bg-card">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Hora</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Total</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Items</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {userRecentSales.map((sale: any) => (
                      <tr key={sale.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          {sale.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4 align-middle font-medium">
                          ${Number(sale.total).toFixed(2)}
                        </td>
                        <td className="p-4 align-middle text-muted-foreground">
                          {sale.items.length} items
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {lowStockProducts.length > 0 && (
          <div className="max-w-4xl mx-auto w-full">
            <LowStockAlert products={lowStockProducts} />
          </div>
        )}
      </div>
    )
  }

  // Full Dashboard for Owner/Admin/Manager
  const metrics = await getDashboardMetrics()
  const topProducts = await getTopProducts(5)
  const recentSales = await getRecentSales(10)
  const chartData = await getSalesChartData(7)
  const lowStockProducts = await getLowStockProducts()

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <VerificationToast />
      </Suspense>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de actividad y métricas clave.
        </p>
      </div>

      {showVerificationBanner && (
        <EmailVerificationBanner email={session.email} />
      )}

      {lowStockProducts.length > 0 && (
        <LowStockAlert products={lowStockProducts} />
      )}

      <DashboardStats metrics={metrics} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="min-h-[400px]">
          <SalesChart data={chartData} type="line" />
        </div>
        <div className="min-h-[400px]">
          <TopProductsWidget products={topProducts} />
        </div>
      </div>

      <div className="min-h-[500px]">
        <RecentActivity sales={recentSales} />
      </div>
    </div>
  )
}
