import { redirect } from "next/navigation"
import { getKioskSession, getKioskEmployees, getKioskSettings } from "@/actions/kiosk-actions"
import { KioskPinPad } from "@/components/employees/kiosk-pin-pad"

export default async function KioskPage() {
    const kioskSession = await getKioskSession()
    
    // If no kiosk session, redirect to normal login
    if (!kioskSession) {
        redirect("/login")
    }

    // If already has active employee, redirect to sales
    if (kioskSession.activeEmployeeId) {
        redirect("/sales")
    }

    // Get employees with PINs for this organization
    const employees = await getKioskEmployees()
    const settings = await getKioskSettings()

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
            <KioskPinPad 
                employees={employees}
                organizationName={kioskSession.organizationName}
                autoLockMinutes={settings.autoLockMinutes}
            />
        </div>
    )
}
