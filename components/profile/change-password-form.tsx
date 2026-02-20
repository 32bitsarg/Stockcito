"use client"

import { useState } from "react"
import { changePassword } from "@/actions/auth-actions"
import { useOfflineMutation } from "@/hooks/use-offline-mutation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Check, Lock } from "lucide-react"

export function ChangePasswordForm() {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const passwordMutation = useOfflineMutation({
        mutationFn: (data: any) => changePassword(data.current, data.new),
        invalidateQueries: [],
        onSuccess: (result: any) => {
            if (result.success) {
                setSuccess(true)
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
                setTimeout(() => setSuccess(false), 3000)
            } else {
                setError(result.error || "Error al cambiar contraseña")
            }
        },
        onError: () => setError("Error de conexión al cambiar contraseña")
    })

    const isPending = passwordMutation.isPending

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)

        if (!currentPassword) {
            setError("Ingresa tu contraseña actual")
            return
        }

        if (newPassword.length < 6) {
            setError("La nueva contraseña debe tener al menos 6 caracteres")
            return
        }

        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden")
            return
        }

        passwordMutation.mutate({ current: currentPassword, new: newPassword })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-200 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Contraseña actualizada correctamente
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña actual</Label>
                <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                />
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cambiando...
                    </>
                ) : (
                    <>
                        <Lock className="w-4 h-4 mr-2" />
                        Cambiar Contraseña
                    </>
                )}
            </Button>
        </form>
    )
}
