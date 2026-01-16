"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCashDrawer } from "@/actions/employee-actions"
import { Calculator, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewCashDrawerPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    
    const [name, setName] = useState("")
    const [terminalId, setTerminalId] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!name.trim()) {
            setError("El nombre de la caja es requerido")
            return
        }

        startTransition(async () => {
            const result = await createCashDrawer({
                name: name.trim(),
                terminalId: terminalId.trim() || undefined
            })

            if (result.success) {
                router.push("/sales/drawer")
                router.refresh()
            } else {
                setError(result.error || "Error al crear la caja")
            }
        })
    }

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/sales/drawer">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Nueva Caja</h1>
                    <p className="text-muted-foreground">
                        Configurar una nueva caja registradora
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Datos de la Caja
                    </CardTitle>
                    <CardDescription>
                        Cada caja puede ser usada por un usuario a la vez
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre de la Caja *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej: Caja 1, Caja Principal, Caja Salón"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Un nombre descriptivo para identificar esta caja
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="terminalId">ID de Terminal (opcional)</Label>
                            <Input
                                id="terminalId"
                                value={terminalId}
                                onChange={(e) => setTerminalId(e.target.value)}
                                placeholder="Ej: POS-001, CAJA-A"
                            />
                            <p className="text-xs text-muted-foreground">
                                Identificador único del dispositivo o terminal físico
                            </p>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isPending}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creando...
                                    </>
                                ) : (
                                    "Crear Caja"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
