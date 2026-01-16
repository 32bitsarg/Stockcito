"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Organization, OrganizationFeatures } from "@prisma/client"
import { updateOrganizationTheme } from "@/actions/organization-actions"
import { cn } from "@/lib/utils"
import { appearanceSettingsSchema, AppearanceSettingsFormValues } from "@/lib/schemas"

interface AppearanceSettingsFormProps {
    initialTheme: string
    // If we had plan status we could disable items
    isPremium?: boolean
}

// Colors for the preview circles
const THEME_COLORS: Record<string, string> = {
    default: "bg-[#6366f1]", // Violet
    blue: "bg-[#3b82f6]",    // Blue
    green: "bg-[#10b981]",   // Emerald
    orange: "bg-[#f97316]",  // Orange
    red: "bg-[#ef4444]",     // Red
}

export function AppearanceSettingsForm({ initialTheme, isPremium = false }: AppearanceSettingsFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<AppearanceSettingsFormValues>({
        resolver: zodResolver(appearanceSettingsSchema),
        defaultValues: {
            theme: initialTheme || "default",
        },
    })

    async function onSubmit(data: AppearanceSettingsFormValues) {
        if (!isPremium && data.theme !== "default") {
            toast.error("Los temas personalizados requieren plan Premium")
            return
        }

        setIsLoading(true)
        try {
            const result = await updateOrganizationTheme(data.theme)

            if (result.success) {
                toast.success("Tema actualizado correctamente")
                router.refresh()
            } else {
                toast.error(result.error || "Error al actualizar el tema")
            }
        } catch (error) {
            toast.error("Ocurrió un error inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel>Color Primario</FormLabel>
                            <FormDescription>
                                Selecciona el color principal que identificará a tu negocio.
                                {!isPremium && <span className="text-amber-500 block mt-1 text-xs font-medium">✨ Función exclusiva del plan Premium</span>}
                            </FormDescription>
                            <FormMessage />
                            <div className="grid max-w-md grid-cols-2 gap-8 pt-2 md:grid-cols-5">
                                {Object.entries(THEME_COLORS).map(([value, colorClass]) => {
                                    const isSelected = field.value === value
                                    return (
                                        <FormItem key={value} className="space-y-0">
                                            <FormLabel className="cursor-pointer">
                                                <FormControl>
                                                    <input
                                                        type="radio"
                                                        className="sr-only"
                                                        name={field.name}
                                                        value={value}
                                                        checked={isSelected}
                                                        disabled={!isPremium && value !== 'default'}
                                                        onChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className={cn(
                                                    "items-center rounded-md border-2 p-1 transition-all hover:bg-accent hover:text-accent-foreground",
                                                    isSelected ? "border-primary bg-accent text-accent-foreground" : "border-muted",
                                                    !isPremium && value !== 'default' && "opacity-50 cursor-not-allowed"
                                                )}>
                                                    <div className={cn("h-16 w-full rounded-sm shadow-sm", colorClass)} />
                                                    <div className="block w-full p-2 text-center text-xs font-normal">
                                                        {value.charAt(0).toUpperCase() + value.slice(1)}
                                                    </div>
                                                </div>
                                            </FormLabel>
                                        </FormItem>
                                    )
                                })}
                            </div>
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                </Button>
            </form>
        </Form>
    )
}

