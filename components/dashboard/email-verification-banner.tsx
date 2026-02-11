"use client"

import { useState } from "react"
import { Mail, X, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { resendVerificationEmailAction } from "@/actions/auth-actions"
import toast from "react-hot-toast"

interface EmailVerificationBannerProps {
    email: string
}

export function EmailVerificationBanner({ email }: EmailVerificationBannerProps) {
    const [dismissed, setDismissed] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleResend = async () => {
        setLoading(true)
        const result = await resendVerificationEmailAction()
        setLoading(false)

        if (result.success) {
            toast.success("Email de verificación reenviado")
        } else {
            toast.error(result.error || "Error al reenviar email")
        }
    }

    if (dismissed) return null

    return (
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <AlertTriangle className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                        Verifica tu email para desbloquear todas las funciones
                    </h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Te enviamos un email a <strong>{email}</strong>. Verifica tu cuenta para poder crear empleados y acceder a todas las funcionalidades.
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResend}
                            disabled={loading}
                            className="border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Mail className="w-4 h-4 mr-2" />
                            )}
                            Reenviar email
                        </Button>
                    </div>
                </div>

                <button
                    onClick={() => setDismissed(true)}
                    className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                >
                    <X className="w-4 h-4 text-zinc-600" />
                </button>
            </div>
        </div>
    )
}
