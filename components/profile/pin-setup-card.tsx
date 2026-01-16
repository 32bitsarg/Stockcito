"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PinSetup } from "@/components/employees/pin-pad"
import { setPin } from "@/actions/employee-actions"
import { KeyRound, Check, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

interface PinSetupCardProps {
    hasPin: boolean
}

export function PinSetupCard({ hasPin }: PinSetupCardProps) {
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
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <KeyRound className="h-5 w-5" />
                                PIN de Acceso Rápido
                            </CardTitle>
                            <CardDescription>
                                Usá un PIN para cambiar de usuario rápidamente
                            </CardDescription>
                        </div>
                        {hasPin && (
                            <Badge className="bg-green-100 text-green-700">
                                <Check className="h-3 w-3 mr-1" />
                                Configurado
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        El PIN te permite acceder rápidamente al sistema sin necesidad de ingresar 
                        tu email y contraseña cada vez. Útil cuando varios usuarios comparten un 
                        mismo terminal.
                    </p>

                    {success && (
                        <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-200 flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            PIN configurado correctamente
                        </div>
                    )}

                    <Button 
                        onClick={() => setShowSetup(true)}
                        variant={hasPin ? "outline" : "default"}
                    >
                        {hasPin ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Cambiar PIN
                            </>
                        ) : (
                            <>
                                <KeyRound className="h-4 w-4 mr-2" />
                                Configurar PIN
                            </>
                        )}
                    </Button>

                    <div className="text-xs text-muted-foreground">
                        <p><strong>Nota:</strong> El PIN es personal y seguro. Usá 4-6 dígitos que puedas recordar fácilmente.</p>
                    </div>
                </CardContent>
            </Card>

            <PinSetup
                open={showSetup}
                onOpenChange={setShowSetup}
                onSetup={handleSetPin}
            />
        </>
    )
}
