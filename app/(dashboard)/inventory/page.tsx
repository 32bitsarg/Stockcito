import { getSession } from "@/actions/auth-actions"
import { InventoryContent } from "@/components/inventory/inventory-content"
import { redirect } from "next/navigation"

export default async function InventoryPage(props: {
    searchParams: Promise<{ query?: string }>
}) {
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    const canEdit = session.role === 'owner' || session.role === 'admin' || session.role === 'manager'
    const canExport = session.role === 'owner' || session.role === 'admin'

    const searchParams = await props.searchParams

    return (
        <InventoryContent
            canEdit={canEdit}
            canExport={canExport}
            initialQuery={searchParams.query}
        />
    )
}
