import { getSession } from "@/actions/auth-actions"
import { ClientsContent } from "@/components/clients/clients-content"
import { redirect } from "next/navigation"

export default async function ClientsPage(props: {
    searchParams: Promise<{ query?: string }>
}) {
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    const canExport = session.role === 'owner' || session.role === 'admin'
    const searchParams = await props.searchParams

    return (
        <ClientsContent
            canExport={canExport}
            initialQuery={searchParams.query}
        />
    )
}
