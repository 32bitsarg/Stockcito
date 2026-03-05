import { BarcodeGenerator } from "@/components/barcodes/barcode-generator"

export default function BarcodesPage() {
    return (
        <div className="p-4 md:p-6 max-w-5xl mx-auto">
            <BarcodeGenerator />
        </div>
    )
}
