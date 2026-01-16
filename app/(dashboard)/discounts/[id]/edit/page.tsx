import { getDiscountById } from "@/actions/discount-actions"
import { getCategories } from "@/actions/category-actions"
import { DiscountForm } from "@/components/discounts/discount-form"
import { notFound } from "next/navigation"

export default async function EditDiscountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [discount, categories] = await Promise.all([
    getDiscountById(parseInt(id)),
    getCategories()
  ])
  
  if (!discount) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Descuento</h1>
        <p className="text-muted-foreground">Modificar promoción o descuento</p>
      </div>
      <DiscountForm discount={discount} categories={categories} />
    </div>
  )
}
