"use client"

import { useState, useTransition } from "react"
import { Copy, Check, RefreshCw, Building2, AlertTriangle, Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"
import { 
    requestBusinessCodeRegeneration, 
    confirmBusinessCodeRegeneration,
    resendVerificationEmailAction 
} from "@/actions/auth-actions"

interface BusinessCodeSectionProps {
    businessCode: string
    businessName: string
    emailVerified: boolean
    userEmail: string
}

export function BusinessCodeSection({ 
    businessCode, 
    businessName,
    emailVerified,
    userEmail
}: BusinessCodeSectionProps) {
    const [copied, setCopied] = useState(false)
    const [showRegenerate, setShowRegenerate] = useState(false)
    const [confirmCode, setConfirmCode] = useState("")
    const [regenerateStep, setRegenerateStep] = useState<'initial' | 'waiting' | 'confirm'>('initial')
    const [isPending, startTransition] = useTransition()
    const [isResending, setIsResending] = useState(false)

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(businessCode)
        setCopied(true)
        toast.success("Código copiado al portapapeles")
        setTimeout(() => setCopied(false), 2000)
    }

    const handleRequestRegenerate = () => {
        startTransition(async () => {
            const result = await requestBusinessCodeRegeneration()
            if (result.success) {
                setRegenerateStep('confirm')
                toast.success("Te enviamos un código de confirmación por email")
            } else {
                toast.error(result.error || "Error al solicitar regeneración")
            }
        })
    }

    const handleConfirmRegenerate = () => {
        if (confirmCode.length !== 6) {
            toast.error("Ingresa el código de 6 dígitos")
            return
        }

        startTransition(async () => {
            const result = await confirmBusinessCodeRegeneration(confirmCode)
            if (result.success && result.newCode) {
                toast.success("Código regenerado exitosamente")
                setShowRegenerate(false)
                setRegenerateStep('initial')
                setConfirmCode("")
                // The page will reload to show the new code
                window.location.reload()
            } else {
                toast.error(result.error || "Código de confirmación inválido")
            }
        })
    }

    const handleResendVerification = async () => {
        setIsResending(true)
        const result = await resendVerificationEmailAction()
        setIsResending(false)
        
        if (result.success) {
            toast.success("Email de verificación reenviado")
        } else {
            toast.error(result.error || "Error al reenviar email")
        }
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Mi Negocio
            </h3>

            <div className="rounded-lg border bg-card p-6 space-y-6">
                {/* Business Name */}
                <div>
                    <p className="text-sm text-muted-foreground">Nombre del negocio</p>
                    <p className="text-lg font-semibold">{businessName}</p>
                </div>

                {/* Email Verification Status */}
                {!emailVerified && (
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-4">
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-medium text-amber-800 dark:text-amber-200">
                                    Email pendiente de verificación
                                </p>
                                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                    Verifica tu email para poder crear empleados y acceder a todas las funciones.
                                </p>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="mt-3"
                                    onClick={handleResendVerification}
                                    disabled={isResending}
                                >
                                    {isResending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Mail className="w-4 h-4 mr-2" />
                                    )}
                                    Reenviar email de verificación
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {emailVerified && (
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                            <Check className="w-3 h-3 mr-1" />
                            Email verificado
                        </Badge>
                    </div>
                )}

                {/* Business Code Display */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Código de negocio</p>
                        <Badge variant="secondary" className="text-xs">
                            Para login de empleados
                        </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-lg p-4 font-mono text-xl tracking-wider text-center border-2 border-dashed">
                            {businessCode}
                        </div>
                        <Button 
                            variant="outline" 
                            size="icon"
                            onClick={copyToClipboard}
                            className="shrink-0"
                        >
                            {copied ? (
                                <Check className="w-4 h-4 text-green-600" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                        </Button>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Comparte este código con tus empleados para que puedan acceder al sistema.
                        Solo necesitan el código y su PIN personal.
                    </p>
                </div>

                {/* Regenerate Code Section */}
                {!showRegenerate ? (
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowRegenerate(true)}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerar código
                    </Button>
                ) : (
                    <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-medium text-red-800 dark:text-red-200">
                                    ¿Regenerar código de negocio?
                                </p>
                                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                    El código anterior dejará de funcionar inmediatamente. 
                                    Todos tus empleados necesitarán el nuevo código para ingresar.
                                </p>
                            </div>
                        </div>

                        {regenerateStep === 'initial' && (
                            <div className="flex items-center gap-2 justify-end">
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setShowRegenerate(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={handleRequestRegenerate}
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Mail className="w-4 h-4 mr-2" />
                                    )}
                                    Enviar código de confirmación
                                </Button>
                            </div>
                        )}

                        {regenerateStep === 'confirm' && (
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    Ingresa el código de 6 dígitos que enviamos a {userEmail}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={confirmCode}
                                        onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        className="font-mono text-center text-lg tracking-widest"
                                        maxLength={6}
                                    />
                                </div>
                                <div className="flex items-center gap-2 justify-end">
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => {
                                            setShowRegenerate(false)
                                            setRegenerateStep('initial')
                                            setConfirmCode("")
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        size="sm"
                                        onClick={handleConfirmRegenerate}
                                        disabled={isPending || confirmCode.length !== 6}
                                    >
                                        {isPending ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                        )}
                                        Confirmar y regenerar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
