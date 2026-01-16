"use client"

import * as React from "react"
import { Progress as ArkProgress } from "@ark-ui/react/progress"

import { cn } from "@/lib/utils"

interface ProgressProps {
  value?: number
  max?: number
  className?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => (
    <ArkProgress.Root
      ref={ref}
      value={value}
      max={max}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ArkProgress.Track className="h-full w-full">
        <ArkProgress.Range
          className="h-full bg-primary transition-all"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </ArkProgress.Track>
    </ArkProgress.Root>
  )
)
Progress.displayName = "Progress"

export { Progress }
