import { getSession } from "@/actions/auth-actions"
import { CategoriesContent } from "@/components/categories/categories-content"
import { redirect } from "next/navigation"

export default async function CategoriesPage() {
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    return <CategoriesContent />
}
