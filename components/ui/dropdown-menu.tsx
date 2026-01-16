"use client"

import * as React from "react"
import { Menu } from "@ark-ui/react/menu"
import { Portal } from "@ark-ui/react/portal"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  open?: boolean
  onOpenChange?: (details: { open: boolean }) => void
  children: React.ReactNode
}

function DropdownMenu({ children, ...props }: DropdownMenuProps) {
  return (
    <Menu.Root {...props} lazyMount unmountOnExit>
      {children}
    </Menu.Root>
  )
}

function DropdownMenuTrigger({
  className,
  children,
  asChild,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  return (
    <Menu.Trigger
      data-slot="dropdown-menu-trigger"
      className={className}
      asChild={asChild}
      {...props}
    >
      {children}
    </Menu.Trigger>
  )
}

function DropdownMenuContent({
  className,
  align = "start",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end" }) {
  // Map align to Ark UI's placement
  const placement = align === "end" ? "bottom-end" : align === "center" ? "bottom" : "bottom-start"
  
  return (
    <Portal>
      <Menu.Positioner>
        <Menu.Content
          data-slot="dropdown-menu-content"
          className={cn(
            "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md",
            className
          )}
          {...props}
        />
      </Menu.Positioner>
    </Portal>
  )
}

function DropdownMenuGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Menu.ItemGroup
      data-slot="dropdown-menu-group"
      className={className}
      {...props}
    />
  )
}

let menuItemCounter = 0

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  onSelect,
  children,
  value,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'id'> & {
  inset?: boolean
  variant?: "default" | "destructive"
  onSelect?: () => void
  value?: string
}) {
  // Generate unique value for each item - Ark UI requires unique values
  const itemValue = React.useMemo(() => value || `menu-item-${++menuItemCounter}`, [value])
  
  return (
    <Menu.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      value={itemValue}
      onSelect={onSelect}
    >
      {children}
    </Menu.Item>
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  onCheckedChange,
}: {
  className?: string
  children?: React.ReactNode
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <Menu.Item
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      value="checkbox"
      onSelect={() => onCheckedChange?.(!checked)}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked && <CheckIcon className="size-4" />}
      </span>
      {children}
    </Menu.Item>
  )
}

function DropdownMenuRadioGroup({
  className,
  value,
  onValueChange,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value?: string
  onValueChange?: (value: string) => void
}) {
  return (
    <Menu.ItemGroup
      data-slot="dropdown-menu-radio-group"
      className={className}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ selected?: boolean; onSelect?: () => void }>, {
            selected: (child.props as { value?: string }).value === value,
            onSelect: () => onValueChange?.((child.props as { value?: string }).value || ""),
          })
        }
        return child
      })}
    </Menu.ItemGroup>
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  value,
  selected,
  onSelect,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value?: string
  selected?: boolean
  onSelect?: () => void
}) {
  return (
    <Menu.Item
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      value={value || "radio"}
      onClick={onSelect}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {selected && <CircleIcon className="size-2 fill-current" />}
      </span>
      {children}
    </Menu.Item>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  inset?: boolean
}) {
  return (
    <div
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLHRElement>) {
  return (
    <Menu.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
}
