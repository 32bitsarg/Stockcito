"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createCategory, updateCategory, deleteCategory } from "@/actions/category-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"

interface CategoryFormProps {
    initialData?: { id: number; name: string }
}

export function CategoryForm({ initialData }: CategoryFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [name, setName] = useState(initialData?.name || "")

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if (!name.trim()) {
            setError("El nombre es obligatorio")
            return
        }

        startTransition(async () => {
            const result = initialData
                ? await updateCategory(initialData.id, { name })
                : await createCategory({ name })

            if (result.error) {
                setError(result.error)
            } else {
                router.push("/categories")
                router.refresh()
            }
        })
    }

    function handleDelete() {
        if (!initialData) return

        startTransition(async () => {
            const result = await deleteCategory(initialData.id)
            if (result.error) {
                setError(result.error)
            } else {
                router.push("/categories")
                router.refresh()
            }
        })
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {initialData ? "Editar Categoría" : "Nueva Categoría"}
                    </CardTitle>
                    <CardDescription>
                        {initialData
                            ? "Modifica los datos de la categoría"
                            : "Crea una nueva categoría para organizar tus productos"
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre de la Categoría</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Electrónica, Ropa, Alimentos..."
                            disabled={isPending}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/categories")}
                            disabled={isPending}
                        >
                            Cancelar
                        </Button>
                    </div>

                    {initialData && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={isPending}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción eliminará la categoría. Los productos asociados no se eliminarán, solo se desasociarán de esta categoría.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>
                                        Eliminar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </CardFooter>
            </Card>
        </form>
    )
}
