import { getSession } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { getNotificationSettings, getOrganizationFeatures } from "@/actions/notification-actions"
import { NotificationSettingsForm } from "@/components/settings/notification-settings-form"
import { FeatureToggles } from "@/components/settings/feature-toggles"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Settings2, Smartphone, Paintbrush, CreditCard, ShieldCheck } from "lucide-react"
import { AppearanceSettingsForm } from "@/components/settings/appearance-settings-form"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import * as motion from "framer-motion/client"

export default async function SettingsNotificationsPage() {
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    // Load all necessary data including full organization object
    const { getCurrentOrganization } = await import("@/actions/organization-actions")
    const { getPaymentStatus, getPaymentHistory, getPaymentMethod } = await import("@/actions/payment-actions")
    const { BillingSettings } = await import("@/components/settings/billing-settings")

    const [notificationSettings, organizationFeatures, organization, paymentStatus, paymentHistory, paymentMethod] = await Promise.all([
        getNotificationSettings(),
        getOrganizationFeatures(),
        getCurrentOrganization(),
        getPaymentStatus(),
        getPaymentHistory(),
        getPaymentMethod()
    ])

    const isAdmin = session.role === 'owner' || session.role === 'admin'
    const isPremium = organization?.plan === 'premium' || organization?.planStatus === 'trial'

    // Transform paymentMethod to match BillingSettings expected format
    const billingPaymentMethod = paymentMethod ? {
        type: paymentMethod.type,
        lastFourDigits: paymentMethod.lastFourDigits,
        brand: paymentMethod.brand,
        expirationMonth: paymentMethod.expirationMonth,
        expirationYear: paymentMethod.expirationYear
    } : null

    return (
        <div className="pb-10">
            <PageHeader
                title="Sistemas & Preferencias"
                subtitle="Configuración técnica de la infraestructura, personalización y facturación empresarial."
            />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <Tabs defaultValue="notifications" className="space-y-6">
                    <TabsList className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 h-auto flex-wrap">
                        <TabsTrigger value="notifications" className="gap-2 px-4 py-2 text-xs font-black uppercase tracking-tighter data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm transition-all">
                            <Bell className="h-3.5 w-3.5" />
                            Notificaciones
                        </TabsTrigger>

                        <TabsTrigger value="appearance" className="gap-2 px-4 py-2 text-xs font-black uppercase tracking-tighter data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm transition-all">
                            <Paintbrush className="h-3.5 w-3.5" />
                            Apariencia
                        </TabsTrigger>

                        {isAdmin && (
                            <>
                                <TabsTrigger value="billing" className="gap-2 px-4 py-2 text-xs font-black uppercase tracking-tighter data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm transition-all">
                                    <CreditCard className="h-3.5 w-3.5" />
                                    Facturación
                                </TabsTrigger>
                                <TabsTrigger value="features" className="gap-2 px-4 py-2 text-xs font-black uppercase tracking-tighter data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm transition-all">
                                    <Settings2 className="h-3.5 w-3.5" />
                                    Módulos
                                </TabsTrigger>
                            </>
                        )}
                        <TabsTrigger value="pwa" className="gap-2 px-4 py-2 text-xs font-black uppercase tracking-tighter data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm transition-all">
                            <Smartphone className="h-3.5 w-3.5" />
                            Escritorio
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="notifications" className="outline-none">
                        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Canales de Comunicación</CardTitle>
                                <CardDescription className="font-medium text-zinc-500">
                                    Defina las reglas de alertado para eventos críticos, stock y ventas.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <NotificationSettingsForm initialSettings={notificationSettings} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="appearance" className="outline-none">
                        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Interfaz & Estética</CardTitle>
                                <CardDescription className="font-medium text-zinc-500">
                                    Personalice la identidad visual de su terminal de trabajo.
                                    {isPremium && (
                                        <Badge variant="outline" className="ml-2 border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 px-1 font-black text-[9px] uppercase italic">Premium ✨</Badge>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AppearanceSettingsForm
                                    initialTheme={organization?.theme || 'default'}
                                    isPremium={isPremium}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {isAdmin && (
                        <>
                            <TabsContent value="billing" className="outline-none">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <BillingSettings
                                        currentPlan={organization?.plan || 'free'}
                                        status={organization?.planStatus || 'unknown'}
                                        nextPaymentDue={paymentStatus.nextPaymentDue}
                                        lastPaymentDate={paymentStatus.lastPayment}
                                        amount={paymentStatus.amount}
                                        paymentMethod={billingPaymentMethod}
                                        history={paymentHistory}
                                    />
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="features" className="outline-none">
                                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Capacidades del Negocio</CardTitle>
                                        <CardDescription className="font-medium text-zinc-500">
                                            Habilite o restrinja módulos funcionales según su flujo operativo.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <FeatureToggles initialFeatures={organizationFeatures} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </>
                    )}

                    <TabsContent value="pwa" className="outline-none">
                        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Integración Nativa</CardTitle>
                                <CardDescription className="font-medium text-zinc-500">
                                    Despliegue Stockcito como una aplicación de escritorio o móvil independiente.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                        <div className="h-12 w-12 rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center shadow-sm">
                                            <ShieldCheck className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Certificación PWA Activa</p>
                                            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-tighter">Listo para ejecución offline y notificaciones push nativas.</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 mb-2">WINDOWS / MAC</h4>
                                            <p className="text-[11px] text-zinc-500 leading-tight">Click en el ícono de instalación en la barra de direcciones del navegador para crear el acceso directo.</p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 mb-2">IPHONE / IOS</h4>
                                            <p className="text-[11px] text-zinc-500 leading-tight">Menú "Compartir" y seleccione "Agregar a Inicio". Icono Stockcito aparecerá en su Home.</p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 mb-2">ANDROID</h4>
                                            <p className="text-[11px] text-zinc-500 leading-tight">El sistema detectará automáticamente el instalador. Acepte el banner inferior.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </div>
    )
}
