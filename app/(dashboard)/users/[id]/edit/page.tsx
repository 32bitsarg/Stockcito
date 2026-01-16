import { getSession, getUserById } from "@/actions/auth-actions"
import { redirect, notFound } from "next/navigation"
import { UserForm } from "@/components/users/user-form"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession()
    
    if (!session) {
        redirect("/login")
    }

    // Solo owner y admin pueden editar usuarios
    if (session.role !== "owner" && session.role !== "admin") {
        redirect("/")
    }

    const { id } = await params
    const user = await getUserById(parseInt(id))

    if (!user) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
                <Link href="/users" className="hover:text-foreground transition-colors">
                    Usuarios
                </Link>
                <ChevronRight className="h-4 w-4" />
                <Link href={`/users/${user.id}`} className="hover:text-foreground transition-colors">
                    {user.name}
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">Editar</span>
            </nav>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Editar Usuario
                </h1>
                <p className="text-muted-foreground mt-1">
                    Modifica los datos de {user.name}
                </p>
            </div>

            {/* Form */}
            <UserForm 
                user={{
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role as "owner" | "admin" | "manager" | "cashier" | "waiter" | "viewer",
                    active: user.active
                }} 
            />
        </div>
    )
}
