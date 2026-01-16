import { DiscountForm } from "@/components/discounts/discount-form"
import { getCategories } from "@/actions/category-actions"

export default async function NewDiscountPage() {
    const categories = await getCategories()

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Nuevo Descuento</h1>
                <p className="text-muted-foreground">Crear una nueva promoción o descuento</p>
            </div>
            <DiscountForm categories={categories} />
        </div>
    )
}
