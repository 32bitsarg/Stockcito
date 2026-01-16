import { POSInterface } from "@/components/sales/pos-interface"

export default function POSPage() {
    return (
        <div className="h-full flex flex-col">
            <h1 className="text-2xl font-bold mb-4">Punto de Venta</h1>
            <POSInterface />
        </div>
    )
}
