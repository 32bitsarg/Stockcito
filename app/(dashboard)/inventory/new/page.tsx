import { ProductForm } from "@/components/inventory/product-form"
import { getCategories } from "@/actions/category-actions"
import Link from "next/link"
import { ArrowLeft, Package } from "lucide-react"

export default async function NewProductPage() {
    const categories = await getCategories()

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
                        <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Nuevo Producto</h1>
                        <p className="text-sm text-muted-foreground">Agregá un producto al inventario</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-2xl">
                <ProductForm categories={categories} />
            </div>
        </div>
    )
}
