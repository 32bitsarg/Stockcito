import { getCategoryById } from "@/actions/category-actions"
import { CategoryForm } from "@/components/categories/category-form"
import { notFound } from "next/navigation"

export default async function EditCategoryPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    let category = null
    try {
        category = await getCategoryById(parseInt(id))
    } catch (error) {
        console.error("Error loading category:", error)
    }

    if (!category) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Editar Categoría</h1>
                <p className="text-muted-foreground">
                    Modifica los datos de la categoría
                </p>
            </div>

            <CategoryForm initialData={category} />
        </div>
    )
}
