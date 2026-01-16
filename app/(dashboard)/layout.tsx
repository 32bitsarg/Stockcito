import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import GlobalShortcuts from '@/components/shortcuts/global-shortcuts'
import { getSession } from '@/actions/auth-actions'
import { getKioskSession, getKioskSettings } from '@/actions/kiosk-actions'
import { KioskAutoLock } from '@/components/employees/kiosk-auto-lock'
import { ThemeSetter } from '@/components/theme-setter'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  // Get current organization for theme
  const { getCurrentOrganization } = await import('@/actions/organization-actions')
  const organization = await getCurrentOrganization()

  // Check if we're in kiosk mode
  const kioskSession = await getKioskSession()
  const isKioskMode = kioskSession?.kioskMode && kioskSession?.activeEmployeeId != null

  // Get auto-lock settings
  let autoLockMinutes = 0
  if (isKioskMode) {
    const settings = await getKioskSettings()
    autoLockMinutes = settings.autoLockMinutes
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        {/* Global shortcuts for quick-search, ctrl+k and '/' */}
        <GlobalShortcuts />
        {/* Kiosk auto-lock monitor */}
        {isKioskMode && autoLockMinutes > 0 && (
          <KioskAutoLock isKioskMode={true} autoLockMinutes={autoLockMinutes} />
        )}
        <ThemeSetter theme={organization?.theme || 'default'} />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
