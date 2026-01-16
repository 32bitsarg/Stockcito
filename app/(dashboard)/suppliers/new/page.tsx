import { SupplierForm } from "@/components/suppliers/supplier-form"

export default function NewSupplierPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Nuevo Proveedor</h1>
                <p className="text-muted-foreground">Registrar un nuevo proveedor</p>
            </div>
            <SupplierForm />
        </div>
    )
}
