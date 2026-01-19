import Link from 'next/link'
import { Package, Crown, CreditCard, Mail } from 'lucide-react'
import { getLowStockProducts } from '@/actions/dashboard-actions'
import { getSession } from '@/actions/auth-actions'
import { getOrganizationFeatures } from '@/actions/notification-actions'
import { getTrialDaysRemaining } from '@/actions/subscription-actions'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SidebarLinks, SidebarLink } from './sidebar-link'
import { APP_VERSION_DISPLAY, FEEDBACK_EMAIL } from '@/lib/changelog'

const baseRoutes = [
    { href: '/dashboard', label: 'Dashboard', iconName: 'LayoutDashboard' },
    { href: '/inventory', label: 'Inventario', iconName: 'Package' },
    { href: '/categories', label: 'Categorías', iconName: 'FolderKanban' },
    { href: '/sales/new', label: 'Ventas (POS)', iconName: 'ShoppingCart' },
    { href: '/sales/history', label: 'Historial', iconName: 'History' },
    { href: '/sales/drawer', label: 'Caja', iconName: 'Calculator' },
    { href: '/clients', label: 'Clientes', iconName: 'Users' },
    { href: '/suppliers', label: 'Proveedores', iconName: 'Building2' },

    { href: '/reports', label: 'Reportes', iconName: 'BarChart3' },
]

// Restaurant-specific routes
const restaurantRoutes = [
    { href: '/kitchen', label: 'Cocina', iconName: 'ChefHat' },
    { href: '/tables', label: 'Mesas', iconName: 'LayoutGrid' },
]

const adminRoutes = [
    { href: '/users', label: 'Usuarios', iconName: 'Shield' },
    { href: '/users/time', label: 'Control Horario', iconName: 'Clock' },
    { href: '/users/audit', label: 'Auditoría', iconName: 'ClipboardList' },
    { href: '/discounts', label: 'Descuentos', iconName: 'Percent' },
    { href: '/settings', label: 'Configuración', iconName: 'Settings' },
]

export async function Sidebar() {
    const [lowStock, session, features, trialDays] = await Promise.all([
        getLowStockProducts(),
        getSession(),
        getOrganizationFeatures(),
        getTrialDaysRemaining()
    ])
    const lowCount = lowStock.length
    // Owner and admin have access to admin routes
    const isAdmin = session?.role === 'admin' || session?.role === 'owner'
    const plan = session?.plan || 'free'
    const isPremium = plan === 'premium'
    const isTrialing = session?.planStatus === 'trial'

    // Filter restaurant routes based on enabled features
    const activeRestaurantRoutes = restaurantRoutes.filter(route => {
        if (route.href === '/kitchen') return features?.kitchenDisplay
        if (route.href === '/tables') return features?.tableManagement
        return false
    })

    return (
        <div className="hidden border-r bg-muted/40 md:block w-64 min-h-screen flex flex-col">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <Package className="h-6 w-6" />
                    <span>Stockcito</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {APP_VERSION_DISPLAY}
                    </Badge>
                </Link>
            </div>

            {/* Plan Badge - Only visible to Owner/Admin */}
            {isAdmin && (
                <div className="px-4 py-3 border-b">
                    <Link
                        href="/subscription"
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            isPremium && !isTrialing
                                ? "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-800 dark:text-amber-200 hover:from-amber-200 hover:to-orange-200 dark:hover:from-amber-900/50 dark:hover:to-orange-900/50"
                                : isTrialing
                                    ? "bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 text-violet-800 dark:text-violet-200 hover:from-violet-200 hover:to-purple-200"
                                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                        )}
                    >
                        {isPremium && !isTrialing ? (
                            <>
                                <Crown className="h-4 w-4" />
                                <span>Premium</span>
                            </>
                        ) : isTrialing ? (
                            <>
                                <Crown className="h-4 w-4" />
                                <div className="flex flex-col">
                                    <span>Prueba Gratis</span>
                                    <span className="text-[10px] opacity-75">Premium activo</span>
                                </div>
                                <Badge variant="secondary" className="text-[10px] ml-auto bg-violet-200 dark:bg-violet-800 text-violet-800 dark:text-violet-200">
                                    {trialDays !== null ? `${trialDays}d` : 'Trial'}
                                </Badge>
                            </>
                        ) : (
                            <>
                                <CreditCard className="h-4 w-4" />
                                <span>Plan Free</span>
                                <Badge className="text-[10px] ml-auto bg-primary">
                                    Mejorar
                                </Badge>
                            </>
                        )}
                    </Link>
                </div>
            )}

            <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-4">
                    <SidebarLinks
                        routes={baseRoutes.filter(route => {
                            // Hide Reports if not Owner/Admin/Manager
                            if (route.href === '/reports') {
                                return isAdmin || session?.role === 'manager';
                            }
                            // Hide Suppliers if not Owner/Admin/Manager
                            if (route.href === '/suppliers') {
                                return isAdmin || session?.role === 'manager';
                            }
                            return true;
                        }).map(route => ({
                            ...route,
                            badge: route.href === '/inventory' ? lowCount : undefined
                        }))}
                    />

                    {isAdmin && (
                        <>
                            <div className="my-4 border-t" />
                            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Administración
                            </div>
                            <SidebarLinks routes={adminRoutes} />
                        </>
                    )}

                    {activeRestaurantRoutes.length > 0 && (
                        <>
                            <div className="my-4 border-t" />
                            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                🍽️ Restaurante
                            </div>
                            <SidebarLinks routes={activeRestaurantRoutes} />
                        </>
                    )}
                </nav>
            </div>



            {/* Footer with version and feedback */}
            <div className="p-4 border-t mt-auto">
                <div className="text-center text-xs text-muted-foreground">
                    <p>Stockcito POS</p>
                    <p className="text-[10px]">{APP_VERSION_DISPLAY} · {new Date().getFullYear()}</p>
                    <a
                        href={`mailto:${FEEDBACK_EMAIL}?subject=Feedback%20-%20Stockcito`}
                        className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <Mail className="w-3 h-3" />
                        💬 Sugerencias?
                    </a>
                </div>
            </div>
        </div>
    )
}
