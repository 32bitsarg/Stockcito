import { getSupplierById } from "@/actions/supplier-actions"
import { SupplierForm } from "@/components/suppliers/supplier-form"
import { notFound } from "next/navigation"

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supplier = await getSupplierById(parseInt(id))
  
  if (!supplier) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Proveedor</h1>
        <p className="text-muted-foreground">Modificar datos del proveedor</p>
      </div>
      <SupplierForm supplier={supplier} />
    </div>
  )
}
