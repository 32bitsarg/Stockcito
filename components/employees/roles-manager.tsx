"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Palette,
    Shield
} from "lucide-react"
import { Dialog } from "@ark-ui/react"
import { createRole, updateRole, deleteRole } from "@/actions/employee-actions"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { type UserPermissions, DEFAULT_PERMISSIONS, PERMISSION_LABELS } from "@/lib/permissions"

interface Role {
    id: number
    code: string
    name: string
    description?: string | null
    color?: string | null
    permissions: string
    isSystem: boolean
}

interface RolesManagerProps {
    customRoles: Role[]
}

const colorOptions = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
    '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
    '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b'
]

const moduleLabels: Record<string, string> = {
    sales: '📊 Ventas',
    inventory: '📦 Inventario',
    clients: '👥 Clientes',
    cashDrawer: '💰 Caja',
    reports: '📈 Reportes',
    users: '👤 Usuarios',
    settings: '⚙️ Configuración',
    pos: '🖥️ POS'
}

export function RolesManager({ customRoles }: RolesManagerProps) {
    const router = useRouter()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<Role | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

    // Form state
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [color, setColor] = useState("#6366f1")
    const [permissions, setPermissions] = useState<UserPermissions>(
        JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS.cashier)) // Start with cashier as base
    )

    const resetForm = () => {
        setName("")
        setDescription("")
        setColor("#6366f1")
        setPermissions(JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS.cashier)))
        setEditingRole(null)
    }

    const openCreateDialog = () => {
        resetForm()
        setIsDialogOpen(true)
    }

    const openEditDialog = (role: Role) => {
        setEditingRole(role)
        setName(role.name)
        setDescription(role.description || "")
        setColor(role.color || "#6366f1")
        try {
            setPermissions(JSON.parse(role.permissions))
        } catch {
            setPermissions(JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS.cashier)))
        }
        setIsDialogOpen(true)
    }

    const togglePermission = (module: keyof UserPermissions, action: string) => {
        setPermissions(prev => ({
            ...prev,
            [module]: {
                ...prev[module],
                [action]: !(prev[module] as any)?.[action]
            }
        }))
    }

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("El nombre es requerido")
            return
        }

        setIsSubmitting(true)
        try {
            if (editingRole) {
                const result = await updateRole(editingRole.id, {
                    name,
                    description,
                    color,
                    permissions
                })
                if (result.success) {
                    toast.success("Rol actualizado")
                    setIsDialogOpen(false)
                    resetForm()
                    router.refresh()
                } else {
                    toast.error(result.error || "Error")
                }
            } else {
                const result = await createRole({
                    name,
                    description,
                    color,
                    permissions
                })
                if (result.success) {
                    toast.success("Rol creado")
                    setIsDialogOpen(false)
                    resetForm()
                    router.refresh()
                } else {
                    toast.error(result.error || "Error")
                }
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (roleId: number) => {
        setIsSubmitting(true)
        try {
            const result = await deleteRole(roleId)
            if (result.success) {
                toast.success("Rol eliminado")
                setDeleteConfirmId(null)
                router.refresh()
            } else {
                toast.error(result.error || "Error")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Roles Personalizados
                            </CardTitle>
                            <CardDescription>
                                Crea roles con permisos específicos para tu negocio
                            </CardDescription>
                        </div>
                        <Button onClick={openCreateDialog}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Rol
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {customRoles.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No hay roles personalizados</p>
                            <p className="text-sm">Crea un rol para asignar permisos específicos</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {customRoles.map((role) => (
                                <div 
                                    key={role.id} 
                                    className="flex items-start gap-3 p-4 rounded-lg border"
                                >
                                    <div 
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                        style={{ backgroundColor: role.color || '#6366f1' }}
                                    >
                                        {role.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{role.name}</h3>
                                            <Badge variant="outline" className="text-xs">Personalizado</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {role.description || 'Sin descripción'}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => openEditDialog(role)}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        {deleteConfirmId === role.id ? (
                                            <>
                                                <Button 
                                                    variant="destructive" 
                                                    size="icon"
                                                    onClick={() => handleDelete(role.id)}
                                                    disabled={isSubmitting}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => setDeleteConfirmId(null)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={() => setDeleteConfirmId(role.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog.Root 
                open={isDialogOpen} 
                onOpenChange={(details) => {
                    setIsDialogOpen(details.open)
                    if (!details.open) resetForm()
                }}
            >
                <Dialog.Backdrop className="fixed inset-0 bg-black/50 z-50" />
                <Dialog.Positioner className="fixed inset-0 flex items-center justify-center z-50">
                    <Dialog.Content className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                        <Dialog.Title className="text-xl font-semibold mb-4">
                            {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
                        </Dialog.Title>

                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ej: Supervisor"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Color</Label>
                                    <div className="flex gap-1 flex-wrap">
                                        {colorOptions.map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'}`}
                                                style={{ backgroundColor: c }}
                                                onClick={() => setColor(c)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe las responsabilidades de este rol..."
                                    rows={2}
                                />
                            </div>

                            {/* Permissions */}
                            <div className="space-y-4">
                                <Label className="text-base font-semibold">Permisos</Label>
                                
                                {(Object.keys(PERMISSION_LABELS) as (keyof UserPermissions)[]).map((module) => (
                                    <div key={module} className="border rounded-lg p-4">
                                        <h4 className="font-medium mb-3">{moduleLabels[module] || module}</h4>
                                        <div className="grid gap-2 md:grid-cols-2">
                                            {Object.entries(PERMISSION_LABELS[module] || {}).map(([action, label]) => (
                                                <div key={action} className="flex items-center justify-between">
                                                    <Label htmlFor={`${module}-${action}`} className="text-sm font-normal cursor-pointer">
                                                        {label}
                                                    </Label>
                                                    <Switch
                                                        id={`${module}-${action}`}
                                                        checked={(permissions[module] as any)?.[action] ?? false}
                                                        onCheckedChange={() => togglePermission(module, action)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                            <Dialog.CloseTrigger asChild>
                                <Button variant="outline">Cancelar</Button>
                            </Dialog.CloseTrigger>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                <Save className="w-4 h-4 mr-2" />
                                {isSubmitting ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </div>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </>
    )
}
