import { getSession } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { SuppliersContent } from "@/components/suppliers/suppliers-content"

export default async function SuppliersPage() {
    const session = await getSession()
    if (!session) return null
    if (session.role !== 'owner' && session.role !== 'admin' && session.role !== 'manager') {
        redirect('/dashboard')
    }

    return <SuppliersContent />
}
