import { getSession } from "@/actions/auth-actions"
import { SalesHistoryContent } from "@/components/sales/sales-history-content"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function SalesHistoryPage() {
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    return <SalesHistoryContent />
}
