import { getSession } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { ProfileContent } from "@/components/profile/profile-content"
import { getUserProfile } from "@/actions/profile-actions"

export default async function ProfilePage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams
    const verify = searchParams.verify === 'true'
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    let profileData = null
    try {
        profileData = await getUserProfile()
    } catch (error) {
        console.error("Error loading profile data:", error)
    }

    if (!profileData) {
        redirect("/login")
    }

    return (
        <ProfileContent
            user={profileData.user}
            organization={profileData.organization}
            emailVerified={profileData.emailVerified}
            isAdmin={profileData.isAdmin}
            isOwner={profileData.isOwner}
            showVerificationWarning={verify}
        />
    )
}
