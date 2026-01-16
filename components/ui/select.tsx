"use client"

import * as React from "react"
import { Select as ArkSelect, createListCollection } from "@ark-ui/react/select"
import { Portal } from "@ark-ui/react/portal"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  disabled?: boolean
  name?: string
  children: React.ReactNode
  items?: Array<{ value: string; label: string }>
}

function Select({ value, onValueChange, defaultValue, disabled, name, children, items = [] }: SelectProps) {
  // Create collection from items or use empty collection
  const collection = React.useMemo(
    () => createListCollection({ items }),
    [items]
  )
  
  return (
    <ArkSelect.Root
      collection={collection}
      value={value ? [value] : undefined}
      onValueChange={(details) => onValueChange?.(details.value[0] || "")}
      defaultValue={defaultValue ? [defaultValue] : undefined}
      disabled={disabled}
      name={name}
      positioning={{ sameWidth: true }}
    >
      {children}
    </ArkSelect.Root>
  )
}

function SelectGroup({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ArkSelect.ItemGroup data-slot="select-group" className={className} {...props}>
      {children}
    </ArkSelect.ItemGroup>
  )
}

function SelectValue({
  placeholder,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }) {
  return (
    <ArkSelect.ValueText
      data-slot="select-value"
      placeholder={placeholder}
      className={className}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "default"
}) {
  return (
    <ArkSelect.Control>
      <ArkSelect.Trigger
        data-slot="select-trigger"
        data-size={size}
        className={cn(
          "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
        {...props}
      >
        {children}
        <ArkSelect.Indicator>
          <ChevronDownIcon className="size-4 opacity-50" />
        </ArkSelect.Indicator>
      </ArkSelect.Trigger>
    </ArkSelect.Control>
  )
}

function SelectContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Portal>
      <ArkSelect.Positioner>
        <ArkSelect.Content
          data-slot="select-content"
          className={cn(
            "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 relative z-50 max-h-[300px] min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
            className
          )}
          {...props}
        >
          {children}
        </ArkSelect.Content>
      </ArkSelect.Positioner>
    </Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ArkSelect.ItemGroupLabel
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  return (
    <ArkSelect.Item
      data-slot="select-item"
      item={value}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ArkSelect.ItemText>{children}</ArkSelect.ItemText>
      <ArkSelect.ItemIndicator className="absolute right-2 flex size-3.5 items-center justify-center">
        <CheckIcon className="size-4" />
      </ArkSelect.ItemIndicator>
    </ArkSelect.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px border-0", className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
