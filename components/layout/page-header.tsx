"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
    title: string
    subtitle?: string
    children?: React.ReactNode
    className?: string
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn("flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8", className)}
        >
            <div className="space-y-1">
                <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                        {subtitle}
                    </p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-3">
                    {children}
                </div>
            )}
        </motion.div>
    )
}
