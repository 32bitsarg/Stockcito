import { getSession } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { ReportsContent } from "@/components/reports/reports-content"

export default async function ReportsPage() {
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    const allowedRoles = ['owner', 'admin', 'manager']
    if (!allowedRoles.includes(session.role)) {
        redirect("/dashboard")
    }

    return <ReportsContent />
}
