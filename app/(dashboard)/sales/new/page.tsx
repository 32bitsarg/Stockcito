import { POSInterface } from "@/components/sales/pos-interface"
import { getSession } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { getOrganizationFeatures } from "@/actions/notification-actions"
import { getTables } from "@/actions/table-actions"

export const dynamic = 'force-dynamic'

export default async function POSPage() {
    const session = await getSession()
    if (!session) {
        redirect("/login")
    }

    // Get feature flags and tables if enabled
    const features = await getOrganizationFeatures()
    const tables = features?.tableManagement
        ? await getTables()
        : []

    return (
        <div className="h-full flex flex-col">
            <h1 className="text-2xl font-bold mb-4">Punto de Venta</h1>
            <POSInterface
                tableManagementEnabled={features?.tableManagement ?? false}
                tables={tables}
            />
        </div>
    )
}
