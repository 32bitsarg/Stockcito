"use client"

import * as React from "react"
import { Checkbox as ArkCheckbox } from "@ark-ui/react/checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (details: { checked: boolean | "indeterminate" }) => void
  defaultChecked?: boolean
  disabled?: boolean
  name?: string
  value?: string
  id?: string
  className?: string
  required?: boolean
}

const Checkbox = React.forwardRef<HTMLLabelElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => (
    <ArkCheckbox.Root
      ref={ref}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <ArkCheckbox.Control className="flex items-center justify-center size-full">
        <ArkCheckbox.Indicator>
          <Check className="h-3 w-3" />
        </ArkCheckbox.Indicator>
      </ArkCheckbox.Control>
      <ArkCheckbox.HiddenInput />
    </ArkCheckbox.Root>
  )
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
