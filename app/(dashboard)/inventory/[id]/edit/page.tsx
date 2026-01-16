import { ProductForm } from "@/components/inventory/product-form"
import { getProductById } from "@/actions/product-actions"
import { getCategories } from "@/actions/category-actions"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil } from "lucide-react"

export default async function EditProductPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const productId = parseInt(id)
    if (isNaN(productId)) notFound()

    const product = await getProductById(productId)
    if (!product) notFound()

    const categories = await getCategories()

    // Transformar datos para el formulario
    const initialData = {
        name: product.name,
        sku: product.sku || undefined,
        description: product.description || undefined,
        price: Number(product.price),
        cost: Number(product.cost),
        stock: product.stock,
        minStock: product.minStock,
        taxRate: Number(product.taxRate || 21),
        categoryId: product.categoryId || undefined,
        id: product.id
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link 
                    href="/inventory" 
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg border bg-card hover:bg-accent transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Pencil className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Editar Producto</h1>
                        <p className="text-sm text-muted-foreground">{product.name}</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-2xl">
                <ProductForm initialData={initialData} categories={categories} />
            </div>
        </div>
    )
}
