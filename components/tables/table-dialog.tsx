"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createTable, updateTable, type TableData, type TableShape } from "@/actions/table-actions"
import { toast } from "sonner"
import { tableSchema, TableFormValues } from "@/lib/schemas"

interface TableDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    table?: TableData | null
}

export function TableDialog({ open, onOpenChange, table }: TableDialogProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const isEditing = !!table

    const form = useForm<TableFormValues>({
        resolver: zodResolver(tableSchema),
        defaultValues: {
            number: table?.number || 1,
            name: table?.name || "",
            capacity: table?.capacity || 4,
            shape: table?.shape || "square",
        },
    })

    // Reset form when table changes
    useEffect(() => {
        if (table) {
            form.reset({
                number: table.number,
                name: table.name || "",
                capacity: table.capacity,
                shape: table.shape,
            })
        } else {
            form.reset({
                number: 1,
                name: "",
                capacity: 4,
                shape: "square",
            })
        }
    }, [table, form])

    // Wrapper to handle ark-ui dialog signature
    const handleOpenChange = (details: { open: boolean }) => {
        onOpenChange(details.open)
    }

    const onSubmit = async (values: TableFormValues) => {
        setIsLoading(true)
        try {
            if (isEditing && table) {
                const result = await updateTable(table.id, {
                    name: values.name || undefined,
                    capacity: values.capacity,
                    shape: values.shape as TableShape,
                })
                if (result.success) {
                    toast.success("Mesa actualizada")
                    onOpenChange(false)
                    router.refresh()
                } else {
                    toast.error(result.error || "Error al actualizar")
                }
            } else {
                const result = await createTable({
                    number: values.number,
                    name: values.name || undefined,
                    capacity: values.capacity,
                    shape: values.shape as TableShape,
                })
                if (result.success) {
                    toast.success("Mesa creada")
                    onOpenChange(false)
                    form.reset()
                    router.refresh()
                } else {
                    toast.error(result.error || "Error al crear")
                }
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? `Editar Mesa ${table?.number}` : "Nueva Mesa"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Modifica los datos de la mesa"
                            : "Agrega una nueva mesa al layout"}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {!isEditing && (
                            <FormField
                                control={form.control}
                                name="number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de Mesa</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre (opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Terraza 1, VIP" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Un nombre descriptivo para identificar la mesa
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="capacity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Capacidad</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Número máximo de personas
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="shape"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Forma</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una forma" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="square">Cuadrada</SelectItem>
                                            <SelectItem value="round">Redonda</SelectItem>
                                            <SelectItem value="rectangle">Rectangular</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? "Guardar" : "Crear"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
