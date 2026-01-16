"use client"

import Link from "next/link"
import { WifiOff, RefreshCw, Home, Package, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-4">
            <div className="flex items-center gap-2 mb-8 animate-fade-in-down">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xl font-bold tracking-tight">Stockcito</span>
            </div>

            <Card className="max-w-md w-full border-primary/10 shadow-xl glass-card animate-scale-in">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6 ring-1 ring-primary/20">
                        <WifiOff className="w-10 h-10 text-primary/80" />
                    </div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                        Sin Conexión
                    </CardTitle>
                    <CardDescription className="text-base pt-2">
                        No pudimos conectar con el servidor. <br />
                        Verifica tu conexión a internet.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 text-sm">
                        <p className="font-medium text-primary mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Modo Offline Activo
                        </p>
                        <ul className="space-y-2 text-muted-foreground ml-1">
                            <li className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span>Puedes seguir consultando productos cacheados.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span>Las ventas realizadas se guardarán y sincronizarán al volver.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reintentar
                        </Button>
                        <Button asChild className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20">
                            <Link href="/dashboard">
                                <Home className="w-4 h-4 mr-2" />
                                Ir al Inicio
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <p className="mt-8 text-xs text-muted-foreground text-center animate-fade-in delay-500">
                Stockcito POS v2.0 <br />
                Sistema Operativo para Comercios
            </p>
        </div>
    )
}
