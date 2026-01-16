"use client"

import { useEffect, useCallback, useRef, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { lockKiosk, updateKioskActivity, shouldAutoLock, getKioskSession } from "@/actions/kiosk-actions"

interface KioskAutoLockProps {
    autoLockMinutes: number
    isKioskMode: boolean
}

/**
 * Component that monitors user activity and auto-locks the kiosk
 * after a period of inactivity.
 */
export function KioskAutoLock({ autoLockMinutes, isKioskMode }: KioskAutoLockProps) {
    const router = useRouter()
    const pathname = usePathname()
    const lastActivityRef = useRef<number>(Date.now())
    const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Skip if not in kiosk mode or no auto-lock configured
    const shouldMonitor = isKioskMode && autoLockMinutes > 0

    const handleActivity = useCallback(() => {
        lastActivityRef.current = Date.now()
        // Update activity on server every 30 seconds of activity
        const now = Date.now()
        if (now - lastActivityRef.current > 30000) {
            updateKioskActivity()
        }
    }, [])

    const checkForLock = useCallback(async () => {
        if (!shouldMonitor) return

        const shouldLock = await shouldAutoLock()
        
        if (shouldLock) {
            // Lock the kiosk and redirect to PIN screen
            await lockKiosk()
            router.push("/kiosk")
        }
    }, [shouldMonitor, router])

    useEffect(() => {
        if (!shouldMonitor) return

        // Activity events to track
        const events = [
            'mousedown',
            'mousemove',
            'keydown',
            'scroll',
            'touchstart',
            'click'
        ]

        // Throttle activity updates
        let throttleTimeout: NodeJS.Timeout | null = null
        const throttledActivity = () => {
            if (throttleTimeout) return
            throttleTimeout = setTimeout(() => {
                handleActivity()
                throttleTimeout = null
            }, 1000)
        }

        // Add event listeners
        events.forEach(event => {
            document.addEventListener(event, throttledActivity, { passive: true })
        })

        // Check for auto-lock every minute
        checkIntervalRef.current = setInterval(checkForLock, 60000)

        // Initial activity update
        updateKioskActivity()

        return () => {
            // Cleanup
            events.forEach(event => {
                document.removeEventListener(event, throttledActivity)
            })
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current)
            }
            if (throttleTimeout) {
                clearTimeout(throttleTimeout)
            }
        }
    }, [shouldMonitor, handleActivity, checkForLock])

    // Don't render anything
    return null
}

/**
 * Wrapper component that fetches kiosk session and renders auto-lock
 */
export function KioskAutoLockWrapper() {
    const [kioskData, setKioskData] = useState<{ isKiosk: boolean; autoLock: number } | null>(null)

    useEffect(() => {
        async function checkKiosk() {
            const session = await getKioskSession()
            if (session && session.kioskMode && session.activeEmployeeId) {
                // We're in kiosk mode with an active employee
                // The autoLockMinutes is fetched from settings in the action
                setKioskData({ isKiosk: true, autoLock: 5 }) // Default 5 min
            }
        }
        checkKiosk()
    }, [])

    if (!kioskData) return null

    return (
        <KioskAutoLock 
            isKioskMode={kioskData.isKiosk}
            autoLockMinutes={kioskData.autoLock}
        />
    )
}
