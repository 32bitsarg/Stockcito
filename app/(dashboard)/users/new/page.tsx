import { getSession } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { UserForm } from "@/components/users/user-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NewUserPage() {
    const session = await getSession()
    
    if (!session) {
        redirect("/login")
    }

    if (!['owner', 'admin'].includes(session.role)) {
        redirect("/")
    }

    // Check if email is verified (required to create employees)
    if (session.role === 'owner' && !session.emailVerified) {
        redirect("/profile?verify=true")
    }

    return (
        <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
            {/* Breadcrumb */}
            <div className="mb-6">
                <Link 
                    href="/users" 
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a usuarios
                </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Nuevo empleado</h1>
                <p className="text-muted-foreground mt-1">
                    Agrega un nuevo miembro a tu equipo. Las credenciales se enviarán por email.
                </p>
            </div>

            {/* Form */}
            <UserForm />
        </div>
    )
}
