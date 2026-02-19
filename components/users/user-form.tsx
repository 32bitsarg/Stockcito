"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useOfflineMutation } from "@/hooks/use-offline-mutation"
import { createUser, updateUser, UserRole } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
    Loader2,
    UserPlus,
    Shield,
    ShoppingCart,
    Eye,
    Briefcase,
    UtensilsCrossed,
    Crown,
    Mail,
    KeyRound,
    Lock,
    Info,
    Check,
    ArrowLeft,
    Sparkles,
    Copy,
    CheckCircle2
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { SYSTEM_ROLES, DEFAULT_PERMISSIONS, type SystemRole } from "@/lib/permissions"
import { cn } from "@/lib/utils"

interface UserFormProps {
    user?: {
        id: number
        name: string
        email: string
        role: UserRole
        active: boolean
    }
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
    owner: <Crown className="h-4 w-4" />,
    admin: <Shield className="h-4 w-4" />,
    manager: <Briefcase className="h-4 w-4" />,
    cashier: <ShoppingCart className="h-4 w-4" />,
    waiter: <UtensilsCrossed className="h-4 w-4" />,
    viewer: <Eye className="h-4 w-4" />
}

const ROLE_COLORS: Record<string, string> = {
    owner: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    admin: "bg-primary/10 text-primary border-primary/20",
    manager: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    cashier: "bg-green-500/10 text-green-600 border-green-500/20",
    waiter: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    viewer: "bg-gray-500/10 text-gray-600 border-gray-500/20"
}

type CredentialMode = 'auto' | 'pin' | 'password'

export function UserForm({ user }: UserFormProps) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)

    // Basic info
    const [name, setName] = useState(user?.name || "")
    const [email, setEmail] = useState(user?.email || "")
    const [role, setRole] = useState<string>(user?.role || "cashier")
    const [active, setActive] = useState(user?.active ?? true)

    // Credentials
    const [credentialMode, setCredentialMode] = useState<CredentialMode>('auto')
    const [pin, setPin] = useState("")
    const [password, setPassword] = useState("")

    // Credentials Modal
    const [showCredentials, setShowCredentials] = useState(false)
    const [createdCredentials, setCreatedCredentials] = useState<{
        email: string
        businessCode?: string
        pin?: string
        password?: string
    } | null>(null)

    const isEditing = !!user
    const roleInfo = SYSTEM_ROLES[role as SystemRole]

    // Filter out 'owner' role - can't create owners
    const availableRoles = Object.entries(SYSTEM_ROLES).filter(([key]) => key !== 'owner')

    const saveMutation = useOfflineMutation({
        mutationFn: async (data: any) =>
            isEditing ? updateUser(user.id, data) : createUser(data),
        invalidateQueries: [['users']],
        onSuccess: (result: any) => {
            if (result.success) {
                if (!isEditing && result.credentials) {
                    setCreatedCredentials(result.credentials)
                    setShowCredentials(true)
                } else {
                    router.push("/users")
                    router.refresh()
                }
            } else {
                setError(result.error || "Error al guardar")
            }
        },
        onError: () => setError("Error de conexión al guardar")
    })

    const isPending = saveMutation.isPending

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!name.trim()) {
            setError("El nombre es requerido")
            return
        }

        if (!email.trim()) {
            setError("El email es requerido")
            return
        }

        // Validate credentials based on mode
        if (credentialMode === 'pin' && pin) {
            if (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
                setError("El PIN debe ser de 4 a 6 dígitos numéricos")
                return
            }
        }

        if (credentialMode === 'password' && password) {
            if (password.length < 6) {
                setError("La contraseña debe tener al menos 6 caracteres")
                return
            }
        }

        const payload = isEditing ? {
            name,
            email,
            role: role as UserRole,
            active,
            ...(password ? { password } : {})
        } : {
            name,
            email,
            password: credentialMode === 'password' ? password : undefined,
            pin: credentialMode === 'pin' ? pin : undefined,
            role: role as UserRole
        }

        saveMutation.mutate(payload)
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    const handleCloseCredentials = () => {
        setShowCredentials(false)
        router.push("/users")
        router.refresh()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error */}
            {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Section: Basic Info */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold">Información básica</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nombre completo</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Juan Pérez"
                            className="h-11"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="juan@ejemplo.com"
                                className="h-11 pl-10"
                                required
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Se enviarán las credenciales a este email
                        </p>
                    </div>
                </div>
            </section>

            {/* Section: Role Selection */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold">Rol del empleado</h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {availableRoles.map(([key, info]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setRole(key)}
                            className={cn(
                                "relative p-4 rounded-lg border-2 transition-all text-left",
                                role === key
                                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                    : "border-muted hover:border-muted-foreground/25"
                            )}
                        >
                            {role === key && (
                                <div className="absolute top-2 right-2">
                                    <Check className="w-4 h-4 text-primary" />
                                </div>
                            )}
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center mb-3",
                                ROLE_COLORS[key]
                            )}>
                                {ROLE_ICONS[key]}
                            </div>
                            <p className="font-medium text-sm">{info.name}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {info.description}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Quick permissions preview */}
                {roleInfo && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {role in DEFAULT_PERMISSIONS && (
                            <>
                                <PermissionChip label="Ventas" enabled={DEFAULT_PERMISSIONS[role as SystemRole].sales.create} />
                                <PermissionChip label="Descuentos" enabled={DEFAULT_PERMISSIONS[role as SystemRole].sales.applyDiscount} />
                                <PermissionChip label="Devoluciones" enabled={DEFAULT_PERMISSIONS[role as SystemRole].sales.refund} />
                                <PermissionChip label="Reportes" enabled={DEFAULT_PERMISSIONS[role as SystemRole].reports.viewSales} />
                                <PermissionChip label="Inventario" enabled={DEFAULT_PERMISSIONS[role as SystemRole].inventory.edit} />
                            </>
                        )}
                    </div>
                )}
            </section>

            {/* Section: Credentials - Only for new users */}
            {!isEditing && (
                <section className="space-y-4">
                    <h3 className="text-lg font-semibold">Credenciales de acceso</h3>

                    {/* Credential mode selection */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setCredentialMode('auto')}
                            className={cn(
                                "p-4 rounded-lg border-2 transition-all text-center",
                                credentialMode === 'auto'
                                    ? "border-primary bg-primary/5"
                                    : "border-muted hover:border-muted-foreground/25"
                            )}
                        >
                            <Sparkles className="w-5 h-5 mx-auto mb-2 text-primary" />
                            <p className="font-medium text-sm">Automático</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Genera PIN
                            </p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setCredentialMode('pin')}
                            className={cn(
                                "p-4 rounded-lg border-2 transition-all text-center",
                                credentialMode === 'pin'
                                    ? "border-primary bg-primary/5"
                                    : "border-muted hover:border-muted-foreground/25"
                            )}
                        >
                            <KeyRound className="w-5 h-5 mx-auto mb-2 text-green-600" />
                            <p className="font-medium text-sm">PIN manual</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Tú eliges el PIN
                            </p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setCredentialMode('password')}
                            className={cn(
                                "p-4 rounded-lg border-2 transition-all text-center",
                                credentialMode === 'password'
                                    ? "border-primary bg-primary/5"
                                    : "border-muted hover:border-muted-foreground/25"
                            )}
                        >
                            <Lock className="w-5 h-5 mx-auto mb-2 text-primary" />
                            <p className="font-medium text-sm">Contraseña</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Login tradicional
                            </p>
                        </button>
                    </div>

                    {/* Credential input based on mode */}
                    {credentialMode === 'auto' && (
                        <div className="rounded-lg bg-muted/50 p-4 flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-sm">PIN generado automáticamente</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Se generará un PIN de 4 dígitos y se enviará al email del empleado junto con el código de negocio e instrucciones de acceso.
                                </p>
                            </div>
                        </div>
                    )}

                    {credentialMode === 'pin' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">PIN de acceso (4-6 dígitos)</label>
                            <div className="relative max-w-xs">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                    placeholder="1234"
                                    className="h-11 pl-10 font-mono tracking-widest text-lg"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                El empleado usará este PIN para ingresar con el código de negocio.
                            </p>
                        </div>
                    )}

                    {credentialMode === 'password' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Contraseña (mín. 6 caracteres)</label>
                            <div className="relative max-w-xs">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-11 pl-10"
                                    minLength={6}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                El empleado usará su email y esta contraseña para ingresar.
                            </p>
                        </div>
                    )}

                    {/* Email notification info */}
                    <div className="rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 p-4 flex items-start gap-3">
                        <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm text-primary dark:text-primary-foreground">
                                Notificación por email
                            </p>
                            <p className="text-sm text-primary/80 dark:text-primary-foreground/80 mt-1">
                                Las credenciales se enviarán automáticamente al email del empleado con instrucciones para acceder.
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Section: Status - Only when editing */}
            {isEditing && (
                <section className="space-y-4">
                    <h3 className="text-lg font-semibold">Estado del usuario</h3>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-1">
                            <p className="font-medium">Usuario activo</p>
                            <p className="text-sm text-muted-foreground">
                                Los usuarios inactivos no pueden iniciar sesión
                            </p>
                        </div>
                        <Switch
                            checked={active}
                            onCheckedChange={(details) => setActive(details.checked)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nueva contraseña (opcional)</label>
                        <div className="relative max-w-xs">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Dejar vacío para mantener"
                                className="h-11 pl-10"
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    disabled={isPending}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Cancelar
                </Button>
                <Button type="submit" disabled={isPending} className="ml-auto">
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {isEditing ? 'Guardando...' : 'Creando...'}
                        </>
                    ) : (
                        <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            {isEditing ? 'Guardar cambios' : 'Crear empleado'}
                        </>
                    )}
                </Button>
            </div>
            {/* Credentials Modal */}
            <Dialog open={showCredentials} onOpenChange={(open) => !open && handleCloseCredentials()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-6 h-6" />
                            Usuario creado exitosamente
                        </DialogTitle>
                        <DialogDescription>
                            El usuario ha sido creado correctamente. Copia estas credenciales para compartirlas con el empleado.
                        </DialogDescription>
                    </DialogHeader>

                    {createdCredentials && (
                        <div className="space-y-4 py-4">
                            <div className="rounded-lg bg-muted p-4 space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Código de Negocio</label>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 bg-background p-2 rounded border font-mono font-bold text-lg text-center">
                                            {createdCredentials.businessCode}
                                        </code>
                                        <Button size="icon" variant="outline" onClick={() => handleCopy(createdCredentials.businessCode || "")}>
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {createdCredentials.pin && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">PIN de Acceso</label>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 bg-background p-2 rounded border font-mono font-bold text-lg text-center tracking-widest text-primary">
                                                {createdCredentials.pin}
                                            </code>
                                            <Button size="icon" variant="outline" onClick={() => handleCopy(createdCredentials.pin || "")}>
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {createdCredentials.password && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contraseña</label>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 bg-background p-2 rounded border font-mono text-lg truncate px-3">
                                                {createdCredentials.password}
                                            </code>
                                            <Button size="icon" variant="outline" onClick={() => handleCopy(createdCredentials.password || "")}>
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-200 dark:border-yellow-900/30 text-xs text-yellow-800 dark:text-yellow-200">
                                <strong>Nota:</strong> Estas credenciales también han sido enviadas a {createdCredentials.email}. Guárdalas por si el correo no llega.
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={handleCloseCredentials} className="w-full">
                            Entendido, cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </form>
    )
}

function PermissionChip({ label, enabled }: { label: string; enabled: boolean }) {
    return (
        <Badge
            variant="outline"
            className={cn(
                "text-xs",
                enabled
                    ? "bg-green-500/10 text-green-700 border-green-500/20"
                    : "bg-gray-100 text-gray-400 dark:bg-gray-800"
            )}
        >
            {enabled ? '✓' : '✗'} {label}
        </Badge>
    )
}
