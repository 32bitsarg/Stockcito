"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getCategories() {
    return db.category.findMany({
        include: {
            _count: {
                select: { products: true }
            }
        },
        orderBy: { name: 'asc' }
    })
}

export async function createCategory(data: { name: string }) {
    try {
        await db.category.create({ data })
        revalidatePath("/categories")
        revalidatePath("/inventory")
        return { success: true }
    } catch (error) {
        return { error: "Error al crear categoría" }
    }
}

export async function updateCategory(id: number, data: { name: string }) {
    try {
        await db.category.update({ where: { id }, data })
        revalidatePath("/categories")
        revalidatePath("/inventory")
        return { success: true }
    } catch (error) {
        return { error: "Error al actualizar categoría" }
    }
}

export async function deleteCategory(id: number) {
    try {
        // Primero desasociar productos
        await db.product.updateMany({
            where: { categoryId: id },
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
