import { getSession } from "@/actions/auth-actions"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { VerificationToast } from "@/components/dashboard/verification-toast"
import { redirect } from "next/navigation"
import { Suspense } from "react"

export default async function Dashboard() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <>
      <Suspense fallback={null}>
        <VerificationToast />
      </Suspense>
      <DashboardContent
        session={{
          id: session.id,
          name: session.name,
          email: session.email,
          role: session.role,
          emailVerified: session.emailVerified
        }}
      />
    </>
  )
}
