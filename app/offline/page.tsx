"use client"

import Link from "next/link"
import { WifiOff, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                        <WifiOff className="w-8 h-8 text-orange-600" />
                    </div>
                    <CardTitle className="text-2xl">Sin Conexión</CardTitle>
                    <CardDescription>
                        Parece que no tienes conexión a internet. Algunas funciones pueden no estar disponibles.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-2">Funciones disponibles offline:</p>
                        <ul className="space-y-1 list-disc list-inside">
                            <li>Ver páginas visitadas recientemente</li>
                            <li>Consultar inventario en caché</li>
                            <li>Las ventas se sincronizarán al reconectar</li>
                        </ul>
                    </div>
                    
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reintentar
                        </Button>
                        <Button asChild className="flex-1">
                            <Link href="/dashboard">
                                <Home className="w-4 h-4 mr-2" />
                                Dashboard
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
