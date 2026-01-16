import { getSession } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { ProfileContent } from "@/components/profile/profile-content"

export default async function ProfilePage() {
    const session = await getSession()
    
    if (!session) {
        redirect("/login")
    }

    const user = await db.user.findUnique({
        where: { id: session.id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            pin: true,
            emailVerified: true,
            createdAt: true,
            organizationId: true,
            _count: {
                select: { sales: true }
            }
        }
    })

    if (!user) {
        redirect("/login")
    }

    // Get organization data for owners
    let organization: { name: string; businessCode: string } | undefined
    if (user.role === 'owner' && user.organizationId) {
        const org = await db.organization.findUnique({
            where: { id: user.organizationId },
            select: { name: true, businessCode: true }
        })
        if (org) {
            organization = org
        }
    }

    const isAdmin = ['owner', 'admin'].includes(session.role)
    const isOwner = session.role === 'owner'

    return (
        <ProfileContent 
            user={{
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                hasPin: !!user.pin,
                createdAt: user.createdAt.toISOString(),
                salesCount: user._count.sales
            }}
            organization={organization}
            emailVerified={!!user.emailVerified}
            isAdmin={isAdmin}
            isOwner={isOwner}
        />
    )
}
