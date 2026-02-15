import { getSession } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { EmployeeReportsContent } from "@/components/reports/employee-reports-content"

export default async function EmployeeReportsPage() {
    const session = await getSession()

    if (!session?.organizationId) {
        redirect("/login")
    }

    // Only owner, admin, manager can access employee reports
    const allowedRoles = ['owner', 'admin', 'manager']
    if (!allowedRoles.includes(session.role)) {
        redirect("/dashboard")
    }

    return <EmployeeReportsContent />
}
