import { createInitialAdmin } from "@/actions/auth-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function SetupPage() {
    const result = await createInitialAdmin()

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        {result.success ? (
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        ) : (
                            <Shield className="w-8 h-8 text-primary" />
                        )}
                    </div>
                    <CardTitle className="text-2xl">
                        {result.success ? "¡Configuración Completa!" : "Sistema Ya Configurado"}
                    </CardTitle>
                    <CardDescription>
                        {result.message}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {result.success && result.credentials && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                            <p className="text-sm font-medium text-green-800">Credenciales de administrador:</p>
                            <div className="font-mono text-sm bg-white rounded p-2 border">
                                <p><strong>Email:</strong> {result.credentials.email}</p>
                                <p><strong>Contraseña:</strong> {result.credentials.password}</p>
                            </div>
                            <p className="text-xs text-green-600">
                                ⚠️ Cambia la contraseña después de iniciar sesión
                            </p>
                        </div>
                    )}
                    
                    <Button asChild className="w-full">
                        <Link href="/login">
                            Ir a Iniciar Sesión
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
