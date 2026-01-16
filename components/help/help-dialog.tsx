"use client"

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { HelpCircle } from 'lucide-react'

// Lazy load the heavy dialog content - only loads when triggered
const HelpDialogContent = dynamic(
    () => import('./help-dialog-content').then(mod => ({ default: mod.HelpDialogContent })),
    { ssr: false }
)

export function HelpDialog() {
    const [open, setOpen] = useState(false)

    // Listen for ? key to open help
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null
            const isEditable = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
            
            if (e.key === '?' && !isEditable) {
                e.preventDefault()
                setOpen(true)
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    // Listen for custom event
    useEffect(() => {
        const handler = () => setOpen(true)
        window.addEventListener('stockcito:open-help', handler)
        return () => window.removeEventListener('stockcito:open-help', handler)
    }, [])

    return (
        <>
            <Button 
                variant="ghost" 
                size="icon" 
                className="relative group" 
                title="Ayuda (?)"
                onClick={() => setOpen(true)}
            >
                <HelpCircle className="h-5 w-5" />
                <kbd className="absolute -bottom-1 -right-1 hidden group-hover:flex h-4 min-w-4 items-center justify-center rounded bg-muted px-1 text-[10px] font-mono text-muted-foreground">
                    ?
                </kbd>
                <span className="sr-only">Ayuda</span>
            </Button>
            
            {/* Only render dialog content when open - lazy loaded */}
            {open && (
                <HelpDialogContent open={open} onOpenChange={setOpen} />
            )}
        </>
    )
}
