"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { KeyRound, Check, ChevronRight, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PinSetup } from "@/components/employees/pin-pad"
import { setPin } from "@/actions/employee-actions"
import { cn } from "@/lib/utils"

interface PinSetupSectionProps {
    hasPin: boolean
}

export function PinSetupSection({ hasPin }: PinSetupSectionProps) {
    const router = useRouter()
    const [showSetup, setShowSetup] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSetPin = async (pin: string) => {
        const result = await setPin(pin)
        if (result.success) {
            setSuccess(true)
            router.refresh()
            setTimeout(() => setSuccess(false), 3000)
        }
        return result
    }

    return (
        <>
            <div className="rounded-lg border bg-card overflow-hidden">
                <button
                    onClick={() => setShowSetup(true)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-md",
                            hasPin ? "bg-green-500/10" : "bg-muted"
                        )}>
                            <KeyRound className={cn(
                                "w-4 h-4",
                                hasPin ? "text-green-600" : "text-muted-foreground"
                            )} />
                        </div>
                        <div className="text-left">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">PIN de acceso rápido</p>
                                {hasPin && (
                                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                                        <Check className="w-3 h-3 mr-1" />
                                        Activo
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {hasPin ? "Cambiar tu PIN actual" : "Configura un PIN para acceso rápido"}
                            </p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>

                {success && (
                    <div className="mx-4 mb-4 p-3 text-sm text-green-600 bg-green-50 dark:bg-green-500/10 rounded-md border border-green-200 dark:border-green-500/20 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        PIN configurado correctamente
                    </div>
                )}

                <div className="px-4 pb-4 border-t">
                    <p className="text-xs text-muted-foreground pt-3">
                        El PIN te permite cambiar de usuario rápidamente sin ingresar email y contraseña. 
                        Útil cuando varios usuarios comparten un terminal.
                    </p>
                </div>
            </div>

            <PinSetup
                open={showSetup}
                onOpenChange={setShowSetup}
                onSetup={handleSetPin}
            />
        </>
    )
}
