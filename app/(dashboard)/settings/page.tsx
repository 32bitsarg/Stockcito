import { getSession } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { getNotificationSettings, getOrganizationFeatures } from "@/actions/notification-actions"
import { NotificationSettingsForm } from "@/components/settings/notification-settings-form"
import { FeatureToggles } from "@/components/settings/feature-toggles"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Settings2, Smartphone, Paintbrush, CreditCard } from "lucide-react"
import { AppearanceSettingsForm } from "@/components/settings/appearance-settings-form"

export default async function SettingsNotificationsPage() {
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    // Load all necessary data including full organization object
    const { getCurrentOrganization } = await import("@/actions/organization-actions")
    const { getPaymentStatus, getPaymentHistory, getPaymentMethod } = await import("@/actions/payment-actions")
    const { BillingSettings } = await import("@/components/settings/billing-settings") // Dynamic import to avoid circular deps if any

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
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                <p className="text-muted-foreground">
                    Administra tus preferencias de notificaciones y funciones
                </p>
            </div>

            <Tabs defaultValue="notifications" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="h-4 w-4" />
                        Notificaciones
                    </TabsTrigger>

                    <TabsTrigger value="appearance" className="gap-2">
                        <Paintbrush className="h-4 w-4" />
                        Apariencia
                    </TabsTrigger>

                    {isAdmin && (
                        <>
                            <TabsTrigger value="billing" className="gap-2">
                                <CreditCard className="h-4 w-4" />
                                Pagos
                            </TabsTrigger>
                            <TabsTrigger value="features" className="gap-2">
                                <Settings2 className="h-4 w-4" />
                                Funciones
                            </TabsTrigger>
                        </>
                    )}
                    <TabsTrigger value="pwa" className="gap-2">
                        <Smartphone className="h-4 w-4" />
                        Instalación
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferencias de Notificaciones</CardTitle>
                            <CardDescription>
                                Configura qué alertas quieres recibir y cómo
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <NotificationSettingsForm
                                initialSettings={notificationSettings}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personalización Visual</CardTitle>
                            <CardDescription>
                                Elige el color de énfasis para tu interfaz. {isPremium ? '✨ Tienes acceso Premium' : '🔒 Requiere Plan Premium'}
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
                        <TabsContent value="billing">
                            <BillingSettings
                                currentPlan={organization?.plan || 'free'}
                                status={organization?.planStatus || 'unknown'}
                                nextPaymentDue={paymentStatus.nextPaymentDue}
                                lastPaymentDate={paymentStatus.lastPayment}
                                amount={paymentStatus.amount}
                                paymentMethod={billingPaymentMethod}
                                history={paymentHistory}
                            />
                        </TabsContent>

                        <TabsContent value="features">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Funciones del Negocio</CardTitle>
                                    <CardDescription>
                                        Activa o desactiva funciones según el tipo de negocio
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FeatureToggles
                                        initialFeatures={organizationFeatures}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </>
                )}

                <TabsContent value="pwa">
                    <Card>
                        <CardHeader>
                            <CardTitle>Instalar Aplicación</CardTitle>
                            <CardDescription>
                                Instala Stockcito en tu dispositivo para acceso rápido
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Stockcito es una Progressive Web App (PWA). Puedes instalarla
                                    en tu dispositivo para tener acceso rápido y poder usarla
                                    incluso sin conexión a internet.
                                </p>
                                <div className="p-4 bg-muted rounded-lg">
                                    <h4 className="font-medium mb-2">Cómo instalar:</h4>
                                    <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
                                        <li>En Chrome/Edge: Busca el ícono de instalación en la barra de direcciones</li>
                                        <li>En Safari (iOS): Toca el ícono de compartir y selecciona "Agregar a inicio"</li>
                                        <li>En Android: El navegador te mostrará una opción de instalación automáticamente</li>
                                    </ol>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
