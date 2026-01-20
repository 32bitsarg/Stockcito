"use client"

import { useEffect, useRef, useState } from 'react'

interface UseBarcodeScannerProps {
    onScan: (code: string) => void
    minLength?: number
    maxInterval?: number // Max ms between keystrokes to be considered a scan
}

export function useBarcodeScanner({
    onScan,
    minLength = 3,
    maxInterval = 100
}: UseBarcodeScannerProps) {
    const buffer = useRef<string>('')
    const lastKeyTime = useRef<number>(0)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const currentTime = Date.now()
            const timeDiff = currentTime - lastKeyTime.current

            // Ignore if user is typing in an input/textarea
            // Unless the input defines 'data-scanner-input' attribute
            const target = e.target as HTMLElement
            if (
                (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
                !target.hasAttribute('data-scanner-input')
            ) {
                return
            }

            // If time difference is too large, reset buffer (likely manual typing)
            if (timeDiff > maxInterval && buffer.current.length > 0) {
                buffer.current = ''
            }

            lastKeyTime.current = currentTime

            if (e.key === 'Enter') {
                if (buffer.current.length >= minLength) {
                    // Prevent default behavior to avoid submitting forms or clicking focused buttons
                    e.preventDefault()
                    e.stopPropagation()

                    onScan(buffer.current)
                    buffer.current = ''
                }
            } else if (e.key.length === 1) {
                // Only printable characters
                buffer.current += e.key
            } else {
                // Non-printable keys reset buffer usually
                if (e.key !== 'Shift') {
                    // Optional: reset buffer on special keys? 
                    // Usually scanners act like generic keyboard, so maybe safe to leave.
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onScan, minLength, maxInterval])
}
