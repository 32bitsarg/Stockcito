"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

import { getSession } from "@/actions/auth-actions"

export async function getCategories() {
    const session = await getSession()
    if (!session?.organizationId) return []

    return db.category.findMany({
        where: { organizationId: session.organizationId },
        include: {
            _count: {
                select: { products: true }
            }
        },
        orderBy: { name: 'asc' }
    })
}

export async function getCategoryById(id: number) {
    try {
        return await db.category.findUnique({
            where: { id },
        })
    } catch (error) {
        console.error("Error fetching category:", error)
        return null
    }
}

export async function createCategory(data: { name: string }) {
    try {
        const session = await getSession()
        if (!session?.organizationId) return { error: "No autorizado" }

        await db.category.create({
            data: {
                ...data,
                organizationId: session.organizationId
            }
        })
        revalidatePath("/categories")
        revalidatePath("/inventory")
        return { success: true }
    } catch (error) {
        return { error: "Error al crear categoría" }
    }
}

export async function updateCategory(id: number, data: { name: string }) {
    try {
        const session = await getSession()
        if (!session?.organizationId) return { error: "No autorizado" }

        // Verificar propiedad antes de actualizar
        const category = await db.category.findUnique({ where: { id } })
        if (category?.organizationId !== session.organizationId) {
            return { error: "No autorizado" }
        }

        await db.category.update({
            where: { id },
            data
        })
        revalidatePath("/categories")
        revalidatePath("/inventory")
        return { success: true }
    } catch (error) {
        return { error: "Error al actualizar categoría" }
    }
}

export async function deleteCategory(id: number) {
    try {
        const session = await getSession()
        if (!session?.organizationId) return { error: "No autorizado" }

        // Verificar propiedad
        const category = await db.category.findUnique({ where: { id } })
        if (category?.organizationId !== session.organizationId) {
            return { error: "No autorizado" }
        }

        // Primero desasociar productos de forma segura
        await db.product.updateMany({
            where: { categoryId: id, organizationId: session.organizationId },
            data: { categoryId: null }
        })
        await db.category.delete({ where: { id } })
        revalidatePath("/categories")
        revalidatePath("/inventory")
        return { success: true }
    } catch (error) {
        return { error: "Error al eliminar categoría" }
    }
}
